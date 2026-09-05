---
phase: quick-260905-stj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - public/assets/avatar/Idle.mp4
  - dist/assets/avatar/Idle.mp4
autonomous: true
requirements: []
---

<objective>
Replace the avatar widget's idle-loop video clip with an updated version supplied by the
user, keeping the filename identical so no source code changes are needed.
</objective>

<context>
The idle-loop clip (`AVATAR_IDLE_SRC` in `src/avatarFaqData.js`, which points at
`/assets/avatar/Idle.mp4`) is referenced by filename only — the video engine, reducer, and
data module all resolve it at the same path regardless of the file's actual content. The
user re-recorded/re-exported this clip and wants the new footage swapped in under the same
name, with no other change.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Swap the idle video asset</name>
  <files>public/assets/avatar/Idle.mp4, dist/assets/avatar/Idle.mp4</files>
  <action>
Copy the user-supplied file at `D:\ttt\LaDidier Avatar\idle.mp4` over both
`public/assets/avatar/Idle.mp4` (the source asset Vite serves in dev and copies on build)
and `dist/assets/avatar/Idle.mp4` (the committed build output this project deploys from),
so the dev server and the deployed build serve identical content. No other file in `dist/`
is touched — this project's `dist/` already carries unrelated pending build output from a
prior local build, which this task must not fold in or disturb.
  </action>
  <verify>
    <automated>sha256sum "D:\ttt\LaDidier Avatar\idle.mp4" public/assets/avatar/Idle.mp4 dist/assets/avatar/Idle.mp4  # all three identical</automated>
    <automated>file public/assets/avatar/Idle.mp4  # reports valid ISO Media / MP4 container</automated>
  </verify>
  <done>
public/assets/avatar/Idle.mp4 and dist/assets/avatar/Idle.mp4 are byte-identical to the
user-supplied replacement clip; no source file changed.
  </done>
  <reversibility rating="reversible">Binary asset replacement only; revert is a git revert of these two files.</reversibility>
</task>

</tasks>

<verification>
1. Hash equality across source file and both destination copies.
2. `file` confirms a valid MP4 container (not a truncated/corrupt copy).
3. No `src/*.js` or `src/*.jsx` file appears in the diff — filename-only swap needs no code change.
</verification>

<success_criteria>
- Idle video content is updated in both the dev-served path and the committed build output.
- No code changes; `AVATAR_IDLE_SRC` and every consumer of it are untouched.
</success_criteria>

<source_audit>
Single source: the user's own instruction in this session ("I changed the idle video, update
the video, name is same idle.mp4") plus the file path they supplied on request
(`D:\ttt\LaDidier Avatar\idle.mp4`) after the repo copy was confirmed unchanged from HEAD.
</source_audit>

<output>
Create `.planning/quick/260905-stj-replace-the-avatar-idle-loop-video-asset/260905-stj-SUMMARY.md` when done.
</output>
