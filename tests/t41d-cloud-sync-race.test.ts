import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * T41D — race đăng nhập và thứ tự ghi cloud.
 *
 * `CloudSyncManager` là singleton nên module state phải được dựng lại từng test
 * (`vi.resetModules()` + `await import`). Firebase bị mock ở tầng module
 * `src/services/firebase` để điều khiển được đúng hai chỗ sinh race: callback
 * `onAuthChange` (bé đăng nhập/đăng xuất/đổi tài khoản) và độ trễ mạng của
 * `getDoc`/`setDoc` (dùng `gate` để giữ lời gọi đang chờ giữa chừng).
 * `StorageService` là hàng **thật** vì chính nó phát event `kho_bau_storage_change`
 * — bỏ qua loop tự đồng bộ chỉ chứng minh được khi event thật sự nổ.
 */

interface Harness {
  authListeners: Array<(user: unknown, source: string) => void>;
  unsubscribed: number;
  writes: Array<{ path: string; payload: Record<string, unknown>; options?: unknown }>;
  inFlight: number;
  maxInFlight: number;
  docExists: boolean;
  docData: unknown;
  gate: { promise: Promise<void>; resolve: () => void } | null;
  failGet: boolean;
  failSet: boolean;
  storageEventTypes: string[];
}

const h = vi.hoisted(() => ({
  authListeners: [],
  unsubscribed: 0,
  writes: [],
  inFlight: 0,
  maxInFlight: 0,
  docExists: false,
  docData: null,
  gate: null,
  failGet: false,
  failSet: false,
  storageEventTypes: [],
})) as unknown as Harness;

function newGate() {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  h.gate = { promise, resolve };
  return () => resolve();
}

vi.mock('../src/services/firebase', () => ({
  loadFirebaseSdk: async () => ({
    auth: {},
    db: {},
    provider: {},
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    doc: (_db: unknown, collection: string, id: string) => ({ path: `${collection}/${id}` }),
    getDoc: async (ref: { path: string }) => {
      h.inFlight += 1;
      h.maxInFlight = Math.max(h.maxInFlight, h.inFlight);
      try {
        if (h.gate) await h.gate.promise;
        if (h.failGet) throw new Error('Không kéo được hồ sơ từ cloud');
        return { exists: () => h.docExists, data: () => h.docData };
      } finally {
        h.inFlight -= 1;
        void ref;
      }
    },
    setDoc: async (ref: { path: string }, payload: Record<string, unknown>, options?: unknown) => {
      h.inFlight += 1;
      h.maxInFlight = Math.max(h.maxInFlight, h.inFlight);
      try {
        if (h.gate) await h.gate.promise;
        if (h.failSet) throw new Error('Không lưu được lên cloud');
        h.writes.push({ path: ref.path, payload, options });
      } finally {
        h.inFlight -= 1;
      }
    },
  }),
  onAuthChange: (cb: (user: unknown, source: string) => void) => {
    h.authListeners.push(cb);
    return () => {
      h.unsubscribed += 1;
    };
  },
  signInWithGoogle: vi.fn(),
  logOut: vi.fn(),
  sanitizeUser: (user: unknown) => user,
}));

const USER_A = { uid: 'uid-a', displayName: 'Bé An', email: 'an@example.com', photoURL: null };
const USER_B = { uid: 'uid-b', displayName: 'Bé Bình', email: 'binh@example.com', photoURL: null };

const HINT_KEY = 'kho_bau_cloud_session_hint';

function installBrowserShims() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    },
  });

  const listeners = new Map<string, Set<(event: unknown) => void>>();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      addEventListener: (type: string, fn: (event: unknown) => void) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(fn);
      },
      removeEventListener: (type: string, fn: (event: unknown) => void) => {
        listeners.get(type)?.delete(fn);
      },
      dispatchEvent: (event: { type: string }) => {
        h.storageEventTypes.push(event.type);
        for (const fn of listeners.get(event.type) ?? []) fn(event);
        return true;
      },
      location: { hostname: 'localhost' },
    },
  });
}

function removeBrowserShims() {
  delete (globalThis as { localStorage?: unknown }).localStorage;
  delete (globalThis as { window?: unknown }).window;
}

/** Đẩy hết vi mô task đang chờ (chuỗi promise của hàng đợi cloud khá dài). */
async function flush() {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
}

async function loadManager() {
  vi.resetModules();
  const mod = await import('../src/services/cloudSync');
  const storage = await import('../src/services/storage');
  return { service: mod.CloudSyncService, StorageService: storage.StorageService };
}

describe('T41D — race đăng nhập trong cloud sync', () => {
  beforeEach(() => {
    h.authListeners = [];
    h.unsubscribed = 0;
    h.writes = [];
    h.inFlight = 0;
    h.maxInFlight = 0;
    h.docExists = false;
    h.docData = null;
    h.gate = null;
    h.failGet = false;
    h.failSet = false;
    h.storageEventTypes = [];
    installBrowserShims();
  });

  afterEach(() => {
    removeBrowserShims();
    vi.useRealTimers();
  });

  it('start() chỉ đăng ký theo dõi auth một lần dù mở màn tài khoản nhiều lần', async () => {
    const { service } = await loadManager();
    service.start();
    service.start();
    service.start();
    expect(h.authListeners.length).toBe(1);
  });

  it('đăng xuất giữa lúc kéo cloud không để lại "synced" khi không còn ai đăng nhập', async () => {
    const { service } = await loadManager();
    h.docExists = true;
    h.docData = { profile: { stars: 40, lastActiveDate: '2026-11-03' } };

    const release = newGate();
    service.start();
    h.authListeners[0](USER_A, 'state');
    await flush();
    expect(service.getState().status).toBe('syncing');

    h.authListeners[0](null, 'state');
    await flush();
    release();
    await flush();

    const state = service.getState();
    expect(state.user).toBeNull();
    expect(state.status).toBe('offline');
    expect(state.lastSyncedAt).toBeNull();
  });

  it('bất biến: không có trạng thái "synced" nào mà user rỗng, kể cả khi login/logout xen kẽ', async () => {
    const { service } = await loadManager();
    h.docExists = true;
    h.docData = { profile: { stars: 12, lastActiveDate: '2026-11-02' } };

    const seen: Array<{ status: string; user: unknown }> = [];
    service.subscribe((s) => seen.push({ status: s.status, user: s.user }));

    const release = newGate();
    service.start();
    h.authListeners[0](USER_A, 'state');
    await flush();
    h.authListeners[0](null, 'state');
    await flush();
    h.authListeners[0](USER_B, 'state');
    release();
    await flush();

    for (const snapshot of seen) {
      if (snapshot.status === 'synced') expect(snapshot.user).not.toBeNull();
    }
    expect(service.getState().user).toEqual(USER_B);
  });

  it('kết quả kéo về của tài khoản cũ không được gán cho tài khoản mới', async () => {
    const { service } = await loadManager();
    h.docExists = true;
    h.docData = { profile: { stars: 99, lastActiveDate: '2026-11-03' } };

    const release = newGate();
    service.start();
    h.authListeners[0](USER_A, 'state');
    await flush();
    h.authListeners[0](USER_B, 'state');
    await flush();
    release();
    await flush();

    // uid A vẫn kịp ghi dở (lời gọi đã bay đi), nhưng trạng thái không được báo
    // synced cho phiên của A; chỉ epoch hiện hành (B) được quyền kết luận.
    expect(service.getState().user).toEqual(USER_B);
    expect(service.getState().status).toBe('synced');
    expect(h.writes.map((w) => w.path)).toEqual(['users/uid-a', 'users/uid-b']);
  });

  it('không bao giờ có hai thao tác cloud chồng nhau khi bấm đồng bộ liên tiếp', async () => {
    const { service } = await loadManager();
    service.start();
    h.authListeners[0](USER_A, 'state');
    await flush();
    h.maxInFlight = 0;
    h.writes = [];

    const release = newGate();
    const first = service.syncNow();
    const second = service.syncNow();
    await flush();
    expect(h.maxInFlight).toBe(1);

    release();
    await Promise.all([first, second]);
    expect(h.writes.length).toBe(2);
    expect(h.maxInFlight).toBe(1);
  });

  it('ghi hồ sơ do cloud đưa về không tự đặt hẹn giờ đẩy ngược lên cloud', async () => {
    vi.useFakeTimers();
    const { service } = await loadManager();
    h.docExists = true;
    h.docData = { profile: { xp: 500, completedLessons: ['les-cloud'], lastActiveDate: '2026-11-03' } };

    service.start();
    h.authListeners[0](USER_A, 'state');
    await vi.advanceTimersByTimeAsync(0);

    expect(h.writes.length).toBe(1);
    // Loop cũ: saveChildProfile phát kho_bau_storage_change → scheduleAutoSync →
    // sau 2 s lại setDoc một lần nữa với đúng dữ liệu vừa kéo về.
    await vi.advanceTimersByTimeAsync(5000);
    expect(h.writes.length).toBe(1);
    expect(service.getState().status).toBe('synced');
    expect(service.getState().mergeTrace).toContain('xp:cloud_higher');
  });

  it('bé học thật sau khi đồng bộ thì vẫn tự đẩy lên cloud (không chặn quá mức)', async () => {
    vi.useFakeTimers();
    const { service, StorageService } = await loadManager();
    h.docExists = true;
    h.docData = { profile: { xp: 10, lastActiveDate: '2026-11-03' } };

    service.start();
    h.authListeners[0](USER_A, 'state');
    await vi.advanceTimersByTimeAsync(0);
    expect(h.writes.length).toBe(1);

    const profile = StorageService.getChildProfile();
    StorageService.saveChildProfile({ ...profile, stars: profile.stars + 3 });
    await vi.advanceTimersByTimeAsync(2500);

    expect(h.writes.length).toBe(2);
  });

  it('không nạp được SDK thì không xoá cờ "máy này từng đăng nhập" và còn được phép thử lại', async () => {
    localStorage.setItem(HINT_KEY, '1');
    const { service } = await loadManager();
    // constructor đã tự start() vì có cờ hint
    expect(h.authListeners.length).toBe(1);

    h.authListeners[0](null, 'sdk_unavailable');
    await flush();

    expect(localStorage.getItem(HINT_KEY)).toBe('1');
    service.start();
    expect(h.authListeners.length).toBe(2);
  });

  it('Firebase báo đăng xuất thật thì cờ hint bị xoá', async () => {
    localStorage.setItem(HINT_KEY, '1');
    const { service } = await loadManager();
    expect(localStorage.getItem(HINT_KEY)).toBe('1');
    h.authListeners[0](null, 'state');
    await flush();
    expect(localStorage.getItem(HINT_KEY)).toBeNull();
    expect(service.getState().status).toBe('offline');
  });

  it('mỗi lần trạng thái đổi là một object mới để React thực sự render lại', async () => {
    const { service } = await loadManager();
    const snapshots: Array<Record<string, unknown>> = [];
    service.subscribe((s) => snapshots.push(s as unknown as Record<string, unknown>));

    await service.syncNow();
    await service.syncNow();

    expect(snapshots.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < snapshots.length; i += 1) {
      expect(snapshots[i]).not.toBe(snapshots[i - 1]);
    }
  });

  it('chưa đăng nhập thì syncNow không gọi Firestore và trả về offline', async () => {
    const { service } = await loadManager();
    service.start();
    h.authListeners[0](null, 'state');
    await flush();
    await service.syncNow();
    expect(h.writes.length).toBe(0);
    expect(service.getState().status).toBe('offline');
  });

  it('lỗi khi đẩy lên cloud được báo cho người dùng và không bị nuốt', async () => {
    const { service } = await loadManager();
    service.start();
    h.authListeners[0](USER_A, 'state');
    await flush();
    expect(service.getState().status).toBe('synced');

    h.failSet = true;
    const release = newGate();
    const pending = service.syncNow();
    await flush();
    release();
    await expect(pending).rejects.toThrow('Không lưu được lên cloud');
    expect(service.getState().status).toBe('error');
    expect(service.getState().error).toBe('Không lưu được lên cloud');
  });
});
