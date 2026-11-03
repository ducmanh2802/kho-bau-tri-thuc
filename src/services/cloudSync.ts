import { loadFirebaseSdk, onAuthChange, type CloudUser } from './firebase';
import { StorageService } from './storage';
import { mergeCloudState } from './cloudMerge';

/**
 * T39 — "Thiết bị này từng đăng nhập" là một cờ boolean thuần tuý, không chứa
 * dữ liệu bài làm của bé. Nhờ nó, app chỉ nạp SDK Firebase (538 KiB) cho người
 * dùng cloud sync thật; bé học offline hoàn toàn không tải chunk đó.
 */
const CLOUD_SESSION_HINT = 'kho_bau_cloud_session_hint';

/**
 * Độ trễ gom thao tác trước khi đẩy lên cloud: nhỏ đủ để mất mạng đột xuất vẫn
 * còn bản ghi, lớn đủ để một lượt học không tạo chục lần `setDoc`.
 */
const AUTO_SYNC_DEBOUNCE_MS = 2000;

function readSessionHint(): boolean {
  try {
    return localStorage.getItem(CLOUD_SESSION_HINT) === '1';
  } catch {
    return false;
  }
}

function writeSessionHint(signedIn: boolean): void {
  try {
    if (signedIn) localStorage.setItem(CLOUD_SESSION_HINT, '1');
    else localStorage.removeItem(CLOUD_SESSION_HINT);
  } catch {
    // localStorage bị chặn (private mode): sync chỉ không tự bật, không hỏng gì khác.
  }
}

export type CloudSyncStatus = 'offline' | 'idle' | 'syncing' | 'synced' | 'error';

export interface CloudSyncState {
  status: CloudSyncStatus;
  user: CloudUser | null;
  lastSyncedAt: Date | null;
  error: string | null;
  /**
   * Luật hợp nhất mà lần kéo cloud gần nhất đã áp — chỉ tên trường và chiều thắng
   * (`stars:from_cloud`), **không** chứa nội dung bài làm của bé. Cần để test chứng
   * minh luật nào thực sự chạy, và để màn tài khoản giải thích vì sao con số đổi.
   */
  mergeTrace: string[];
}

type SyncListener = (state: CloudSyncState) => void;

/**
 * Strips all undefined fields recursively so Firestore never throws
 * "Unsupported field value: undefined"
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return null as unknown as T;
  }
  return JSON.parse(JSON.stringify(data));
}

class CloudSyncManager {
  private state: CloudSyncState = {
    status: 'offline',
    user: null,
    lastSyncedAt: null,
    error: null,
    mergeTrace: [],
  };

  private listeners = new Set<SyncListener>();
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private authStarted = false;

  /**
   * T41D — "thế hệ" của phiên đăng nhập: mỗi lần auth đổi là một epoch mới, kết
   * quả thuộc epoch cũ bị bỏ. Không có nó thì bé đăng xuất (hoặc đổi tài khoản)
   * giữa lúc `pullAndMerge` còn chờ mạng sẽ ghi `synced` + `lastSyncedAt` lên
   * trạng thái của tài khoản **khác** — UI báo "đã lưu an toàn" dù không còn ai
   * đăng nhập, và hồ sơ máy A lọt vào hồ sơ máy B.
   */
  private authEpoch = 0;

  /**
   * T41D — mọi thao tác cloud đi qua một hàng đợi. Trước đây nút "Đồng bộ ngay",
   * auto-sync sau 2 s và pull-merge lúc đăng nhập chồng nhau: hai `setDoc` đọc hai
   * bản local khác rồi tranh ghi, bản ghi sau đè mất bản vừa hợp nhất.
   */
  private queue: Promise<void> = Promise.resolve();

  /**
   * True khi chính máy này đang đọc/ghi `localStorage` để phục vụ đồng bộ.
   * T41D: `saveChildProfile`, và cả `getAnalytics` (tự làm mới bộ đếm ngày), phát
   * event `kho_bau_storage_change` y hệt một lần bé học. Người nghe bên dưới coi
   * đó là "bé vừa làm gì" rồi hẹn giờ đẩy ngược lên cloud ⇒ mỗi lần đăng nhập nổ
   * một vòng tự đồng bộ, và vòng đó lại ghi local ⇒ nổ tiếp. Chỉ bọc quanh đoạn
   * **đọc/ghi local**, không bọc lúc chờ mạng, để thao tác học thật của bé trong
   * lúc sync vẫn được nghe.
   */
  private writingOwnState = false;

  constructor() {
    // Listen to local storage changes to trigger debounced auto-sync
    if (typeof window !== 'undefined') {
      window.addEventListener('kho_bau_storage_change', () => {
        // T41D: `saveChildProfile(merged)` và `getAnalytics()` cũng phát event này.
        // Trước đây nó đặt hẹn giờ auto-sync ngay giữa lúc pull, rồi đẩy ngược dữ
        // liệu vừa kéo về lên cloud — một vòng tự đồng bộ nổ mỗi lần đăng nhập.
        if (this.writingOwnState) return;
        if (this.state.user) {
          this.scheduleAutoSync();
        }
      });

      // Listen to Firebase Auth state — nhưng chỉ khi máy này đã từng đăng nhập.
      if (readSessionHint()) {
        this.start();
      }
    }
  }

  /**
   * Nạp SDK và theo dõi trạng thái đăng nhập. Idempotent: AccountModal gọi lúc
   * mở màn hình, constructor gọi lúc resume — không lần nào tải Firebase thừa.
   */
  public start(): void {
    if (this.authStarted || typeof window === 'undefined') return;
    this.authStarted = true;
    onAuthChange((user, source) => {
      // T41D: onAuthChange cũng báo null khi **không nạp được SDK** (mạng đứt,
      // chunk Firebase lỗi). Xoá cờ "máy này từng đăng nhập" ở nhánh đó là tự cắt
      // tính năng vĩnh viễn — lần mở sau app không nghe auth nữa dù bé vẫn đang
      // đăng nhập. Chỉ bỏ cờ khi Firebase chắc chắn trả lời đã đăng xuất.
      if (source === 'state') writeSessionHint(!!user);
      else if (user) writeSessionHint(true);
      else this.authStarted = false;
      void this.handleAuthChanged(user);
    });
  }

  public getState(): CloudSyncState {
    return this.state;
  }

  public subscribe(listener: SyncListener): () => void {
    listener(this.state);
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Luôn gán đối tượng trạng thái **mới** rồi mới báo. `AuthButton` và
   * `CloudSyncBanner` đưa thẳng kết quả vào `setSyncState`, nên sửa tại chỗ
   * (`this.state.status = …`) giữ nguyên tham chiếu và UI đứng yên — lỗi cũ ở
   * nhánh "chưa đăng nhập" của `syncNow`.
   */
  private setState(patch: Partial<CloudSyncState>) {
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private async handleAuthChanged(user: CloudUser | null) {
    const epoch = ++this.authEpoch;

    if (!user) {
      this.cancelScheduledSync();
      this.setState({ status: 'offline', user: null, lastSyncedAt: null, error: null, mergeTrace: [] });
      return;
    }

    this.setState({ user, status: 'syncing', error: null });

    await this.enqueue(async () => {
      if (epoch !== this.authEpoch) return;
      try {
        const mergeTrace = await this.pullAndMergeCloudData(user.uid);
        if (epoch !== this.authEpoch) return;
        this.setState({ status: 'synced', lastSyncedAt: new Date(), error: null, mergeTrace });
      } catch (err: unknown) {
        if (epoch !== this.authEpoch) return;
        const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ đám mây';
        this.setState({ status: 'error', error: msg });
      }
    });
  }

  private cancelScheduledSync() {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = null;
    }
  }

  private scheduleAutoSync() {
    this.cancelScheduledSync();
    this.syncDebounceTimer = setTimeout(() => {
      this.syncDebounceTimer = null;
      this.syncNow().catch(() => {});
    }, AUTO_SYNC_DEBOUNCE_MS);
  }

  /**
   * Ghép một thao tác cloud vào cuối hàng đợi. Trả về kết quả của chính thao tác
   * để caller vẫn thấy lỗi; bản thân hàng đợi nuốt lỗi để không chặn bước sau.
   */
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  /**
   * Pulls existing cloud document, merges with local state, and pushes the result
   * back to cloud. Trả về luật hợp nhất đã áp.
   */
  private async pullAndMergeCloudData(uid: string): Promise<string[]> {
    const sdk = await loadFirebaseSdk();
    const userDocRef = sdk.doc(sdk.db, 'users', uid);
    const snap = await sdk.getDoc(userDocRef);

    // Đọc sau khi đã chờ mạng: bé vẫn học trong lúc pull, và bản đọc từ đầu phiên
    // là bản cũ — đẩy nó lên cloud sẽ nuốt các bước bé vừa làm.
    const { localProfile, localAnalytics } = this.withMutedLocalWrites(() => ({
      localProfile: StorageService.getChildProfile(),
      localAnalytics: StorageService.getAnalytics(),
    }));

    if (!snap.exists()) {
      // First cloud save for this account
      await sdk.setDoc(
        userDocRef,
        sanitizeForFirestore({
          profile: localProfile,
          analytics: localAnalytics,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
      return ['first_cloud_save'];
    }

    const cloudData = snap.data() || {};
    const outcome = mergeCloudState({
      local: localProfile,
      localAnalytics,
      cloudProfile: (cloudData.profile as Record<string, unknown>) || null,
      cloudAnalytics: (cloudData.analytics as Record<string, unknown>) || null,
    });

    // T42/E — ghi kết quả hợp nhất xuống máy là bản sao trạng thái đã có mốc
    // riêng, không phải bé vừa đổi gì. Không câm ở đây thì mỗi lần đồng bộ làm
    // máy này "mới hơn" và máy kia vĩnh viễn thua ⇒ vé tiêu ở máy kia bị in lại.
    this.withMutedLocalWrites(() => StorageService.saveChildProfile(outcome.profile));

    // Đẩy cả analytics đã hợp nhất. Bản cũ chỉ gửi analytics của máy này nên báo
    // cáo của máy khác bị đè về số của máy này sau mỗi lần đồng bộ.
    await sdk.setDoc(
      userDocRef,
      sanitizeForFirestore({
        profile: outcome.profile,
        analytics: outcome.analytics,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );

    return outcome.trace;
  }

  /**
   * Chạy một đoạn đọc/ghi `localStorage` của riêng bộ đồng bộ mà không cho nó
   * tự kích hoạt lần đồng bộ kế tiếp (xem `writingOwnState`), và không để nó
   * tự nhích `stateTouchedAt` (xem T42/E — `StorageService.withoutStateTouch`).
   */
  private withMutedLocalWrites<T>(run: () => T): T {
    this.writingOwnState = true;
    try {
      return StorageService.withoutStateTouch(run);
    } finally {
      this.writingOwnState = false;
    }
  }

  /**
   * Triggers immediate manual sync
   */
  public async syncNow(): Promise<void> {
    const user = this.state.user;
    if (!user) {
      this.setState({ status: 'offline' });
      return;
    }
    const epoch = this.authEpoch;

    return this.enqueue(async () => {
      if (epoch !== this.authEpoch) return;
      this.setState({ status: 'syncing', error: null });

      try {
        const uid = user.uid;
        const sdk = await loadFirebaseSdk();
        const userDocRef = sdk.doc(sdk.db, 'users', uid);
        const { profile, analytics } = this.withMutedLocalWrites(() => ({
          profile: StorageService.getChildProfile(),
          analytics: StorageService.getAnalytics(),
        }));

        await sdk.setDoc(
          userDocRef,
          sanitizeForFirestore({
            profile,
            analytics,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );

        if (epoch !== this.authEpoch) return;
        this.setState({ status: 'synced', lastSyncedAt: new Date(), error: null });
      } catch (err: unknown) {
        if (epoch !== this.authEpoch) return;
        const msg = err instanceof Error ? err.message : 'Không thể lưu lên đám mây';
        this.setState({ status: 'error', error: msg });
        throw err;
      }
    });
  }
}

export const CloudSyncService = new CloudSyncManager();
