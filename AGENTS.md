# AGENTS.md — Camer Codex Soñada PC App

## Repository identity

Repository:

`hcamusso1166/camercodex-sonada-pc-app`

This repository contains the Camer Codex / Rutina Soñada web application.

Do not confuse this repository with:

- `hcamusso1166/Camer_Drawing_Pad_V1`
- `hcamusso1166/camercodexapp`

Changes to those repositories are outside the scope of this repository.

---

## Development environments

The canonical Windows checkout used by the project owner is:

`C:\CamerDev\camercodex-sonada-pc-app`

Codex and other remote development environments may use their own checkout paths, for example:

`/workspace/camercodex-sonada-pc-app`

The absolute filesystem path is not repository identity.

Remote environments must validate repository identity using Git metadata, especially:

- repository;
- `origin`;
- approved baseline branch;
- approved baseline SHA.

Remote environments must not fail merely because the Windows path is unavailable.

The historical user-profile checkout is not the canonical development location:

`C:\Users\Hernán Camusso\camercodex-sonada-pc-app`

---

## Remote checkout bootstrap

Codex or another ephemeral remote environment may receive a valid
repository checkout without a configured Git remote.

A missing `origin` is not by itself evidence that the checkout is invalid.

When a task explicitly provides:

- the expected GitHub repository;
- the expected remote URL;
- an exact baseline SHA;

the task may explicitly authorize creating `origin` in the ephemeral
checkout.

Never invent a remote.

Never replace an existing remote unless the task explicitly authorizes it.

After adding an authorized remote, always fetch and verify the exact
baseline before modifying files.

The canonical Windows path used by the project owner and the ephemeral
Codex checkout path are separate concerns.

---

## Canonical development branch

The current integration and development branch is:

`develop`

Feature work must NOT be implemented directly on:

- `develop`
- `main`

Every task must use a dedicated branch.

Preferred naming:

`codex/<task-name>`

Unless explicitly stated otherwise, feature work starts from the approved `origin/develop` baseline.

When a task specifies an exact baseline SHA, that SHA is part of the task contract.

---

## Mandatory preflight

Before editing files:

```bash
git rev-parse --show-toplevel
git remote -v
git status --short
git branch --show-current
git rev-parse HEAD
git fetch origin
git rev-parse origin/develop
```

Confirm:

1. Repository is `hcamusso1166/camercodex-sonada-pc-app`.
2. Working tree is clean.
3. `origin` identifies the expected GitHub repository.
4. `origin/develop` matches the baseline required by the task.

The filesystem path may differ between local Windows development and remote Codex execution.

Do not reject a valid Codex checkout solely because it is under `/workspace` rather than `C:\CamerDev`.

If an exact baseline SHA is required and does not match:

**STOP without modifying files.**

Do not silently select another baseline.

Do not silently rebase.

---

## Branch policy

Never implement a task directly on `develop` or `main`.

Create the exact task branch from the approved baseline before editing.

Never reuse an unrelated feature branch.

When a task specifies a branch name, that branch name becomes part of the task contract after branch creation.

---

## Scope discipline

Make only the changes required by the task.

Do not perform unrelated:

- refactors;
- renames;
- formatting changes;
- dependency changes;
- architecture changes;
- protocol changes;
- asset regeneration;
- cleanup.

If an out-of-scope change appears necessary:

**STOP and report it.**

---

## Rutina Soñada protection

Existing validated behavior must be preserved unless explicitly authorized.

Sensitive areas include:

- Book Test Imposible V2;
- audio sequencing;
- BLE behavior;
- antenna payload interpretation;
- NextAudio;
- book/page/line selection;
- image Encore behavior;
- book assets;
- audio assets;
- service worker/cache behavior;
- authentication;
- production deployment behavior.

Do not modify these areas incidentally.

---

## Cross-repository boundaries

Camer Drawing Pad firmware belongs to:

`hcamusso1166/Camer_Drawing_Pad_V1`

The separate Camer Codex application belongs to:

`hcamusso1166/camercodexapp`

Do not modify those repositories from a task in this repository unless a coordinated cross-repository task explicitly authorizes it.

Q5, ESP-NOW and Drawing Pad firmware changes do not belong here unless explicitly requested.

When an external protocol is declared frozen, treat it as immutable.

---

## SHOW_SKETCH integration discipline

Future `SHOW_SKETCH` work in this repository must preserve all protocol contracts declared frozen by the task.

Application-side work must not silently redefine:

- packet layout;
- packet length;
- protocol fields;
- receiver semantics;
- Q5 behavior;
- Drawing Pad firmware behavior;
- physical transport contracts.

Application code and Drawing Pad firmware are separate repository responsibilities unless explicitly coordinated.

---

## Tests

This repository contains JavaScript tests using the Node.js built-in test runner.

Run all tests relevant to modified code.

A known existing test is:

```bash
node --test test/bookTestImposibleV2ImageEncore.test.js
```

Do not introduce a package manager or new dependency merely to execute tests unless explicitly requested.

Before declaring work complete:

```bash
git diff --check
git status --short
git diff --stat
git diff
```

---

## Git and Pull Request workflow

When a task explicitly authorizes Pull Request delivery, Codex may:

1. create/use the exact task branch;
2. make only authorized changes;
3. run validations;
4. commit;
5. push the task branch to `origin`;
6. open a Draft Pull Request against `develop`.

The Pull Request must remain Draft until explicit authorization to mark it Ready for Review.

Codex must NOT:

- push directly to `develop`;
- push directly to `main`;
- merge without explicit authorization;
- mark a Draft PR Ready without authorization;
- create or move tags without authorization;
- delete branches without authorization;
- force-push;
- rewrite published history.

---

## Pull Request target

Normal flow:

```text
origin/develop
      ↓
codex/<task>
      ↓
Draft Pull Request
      ↓
develop
```

Do not open normal feature PRs against `main` unless explicitly instructed.

---

## Vercel deployment architecture

This repository is connected directly to the Vercel project:

`camercodex-sonada-pc-app`

through Vercel Git Integration.

Vercel deployment is not currently implemented through a repository GitHub Actions workflow.

Do not create `.github/workflows` merely to reproduce the existing Vercel integration.

Current production deployments are associated with:

`develop`

Therefore:

**MERGING INTO** **`develop`** **MAY AUTOMATICALLY DEPLOY TO PRODUCTION.**

Never merge without explicit user authorization following review and validation.

Feature branches and Pull Requests may receive Vercel Preview deployments through the existing integration.

Do not modify:

- Vercel project configuration;
- production branch configuration;
- domains;
- environment variables;
- deployment settings;
- Git integration;

unless explicitly requested.

---

## Production safety

Treat `develop` as production-sensitive.

None of these constitute merge authorization on their own:

- passing tests;
- successful code review;
- successful Vercel Preview;
- successful deployment check.

Merge always requires explicit user authorization.

---

## Completion report

At the end of every task report:

- repository;
- repository root used by the execution environment;
- baseline branch;
- baseline SHA;
- working branch;
- files modified;
- reason for each modification;
- tests executed;
- test results;
- `git diff --check` result;
- final `git status --short`;
- commit SHA;
- pushed branch;
- PR number and URL;
- Draft/Ready status;
- Vercel status if available;
- confirmation that no unrelated repository was modified.

If validation could not be performed, state exactly what was not validated and why.
