# Wave wave-1778768506983

Hand this directory to the outer agentic session. The session will:

1. For each edge in `wave.json`, dispatch 3 researcher subagents in isolated worktrees with the prompt from `scripts/data/agent-recipes/transmission-evidence.md`.
2. Collect each subagent's JSON envelope into `<edgeId>/researcher-{1,2,3}.json`.
3. Run the reducer subagent on the three envelopes and write the merged evidence file to `scripts/data/transmission-evidence/<student>__<teacher>.md`.
4. Run the reviewer subagent; downgrade tier in the file if warranted.
5. Append any suggested corrections to `scripts/data/transmission-evidence/_suggested-corrections.md`.
6. Update `scripts/data/transmission-evidence/_state.json` by appending the processed edge ids.
