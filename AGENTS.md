# AFIA Agent Instructions

Architecture constraints and hard rules: [docs/execution-rules.md](docs/execution-rules.md)

If there is any conflict between this file and `docs/execution-rules.md`, **execution-rules.md takes priority**.

---

## Executor Prompt (Use this every time)

Copy this for every task in Cursor / انسخ هذا لكل مهمة داخل Cursor:

```text
Follow the execution rules in this repository.

Primary authority:
- docs/execution-rules.md (highest priority)
- AGENTS.md (secondary reference)

<<< TASK START >>>

PUT YOUR TASK HERE

<<< TASK END >>>

Rules:
- Make minimal changes only
- Do not change architecture
- Do not add new features
- Do not create new files unless strictly required
- Ensure build + type-check + lint remain valid
- If anything is unclear, stop and explain instead of guessing

After completion:
- List modified files
- Explain what changed
- Provide verification steps (commands)
```
