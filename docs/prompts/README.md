# `docs/prompts/` — thẻ prompt tái dùng

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`

Mục tiêu của thư mục này: một người **khác** mở repo, copy một thẻ, dán vào agent, và nhận được
kết quả cùng loại mà không cần hỏi lại "làm thế nào". Mỗi thẻ có đủ 5 phần và **tiêu chí đạt** —
thẻ nào không viết được tiêu chí đạt thì chưa phải thẻ, đó là lời dặn dò.

| Thẻ | Dùng khi | Thẻ gốc đã áp dụng |
|---|---|---|
| [`TASK_BRIEF.md`](TASK_BRIEF.md) | giao một thay đổi hành vi cho agent | T41A · T41B · T41C |
| [`BUG_HUNT.md`](BUG_HUNT.md) | rà lỗi một vùng chưa có probe | T32 · T33 · T41 |
| [`MEASURE_SYNC.md`](MEASURE_SYNC.md) | sau khi `verify` / build / merge | mỗi đợt đồng bộ số liệu docs |
| [`REVIEW_4LAYER.md`](REVIEW_4LAYER.md) | đọc diff của agent trước khi merge | G-2 ở `05` §4 |
| [`CONTEXT_PACK.md`](CONTEXT_PACK.md) | **mọi** thẻ trên — phần context đi kèm | 6 mục + phần loại bỏ |

## Quy ước

1. **Một thẻ = một nhiệm vụ.** Không nhét hai việc vào một brief; agent sẽ làm nửa vời việc thứ hai.
2. **Expected thuộc về người.** Thẻ phải chỉ ra AC/TC nguồn; nếu chưa có AC thì việc đầu tiên của
   agent là *dừng và hỏi*, không phải tự đặt expected (`02_AI_USAGE_CHARTER.md` §0.3).
3. **Tiêu chí đạt là lệnh, không là tính từ.** "Sạch sẽ", "mượt hơn" không đạt;
   "`npm run verify` EXIT=0 và `node qa/run-one.mjs qa/focus.mjs` in `QA PASS`" thì đạt.
4. **Điểm khôi phục.** Thẻ nào cũng phải nói agent dừng ở đâu nếu giữa đường hỏng
   (`git status` sạch `src/`, không để lại mutation dở).
