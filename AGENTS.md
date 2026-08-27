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

After adding or validating an authorized remote, attempt to fetch the expected baseline before modifying files.

A network, proxy, authentication, tunnel, DNS or GitHub availability failure is not by itself a reason to discard an otherwise valid local checkout. If the task provides an exact baseline SHA and that exact SHA can be verified locally together with repository identity and a clean working tree, local implementation may proceed under the network-resilient delivery policy below.

Do not claim that `origin/develop` was verified when fetch did not succeed.

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

Before editing files, always run the local identity checks:

```bash
git rev-parse --show-toplevel
git remote -v
git status --short
git branch --show-current
git rev-parse HEAD
```

When network access is available, also run:

```bash
git fetch origin --prune
git rev-parse origin/develop
```

Confirm:

1. Repository is `hcamusso1166/camercodex-sonada-pc-app`.
2. Working tree is clean.
3. `origin`, when configured, identifies the expected GitHub repository.
4. The checked-out baseline SHA matches the exact baseline required by the task.
5. When fetch succeeds, `origin/develop` also matches the baseline required by the task.

The filesystem path may differ between local Windows development and remote Codex execution.

Do not reject a valid Codex checkout solely because it is under `/workspace` rather than `C:\CamerDev`.

If repository identity is wrong, the working tree is unexpectedly dirty, or an exact required baseline SHA does not match:

**STOP without modifying files.**

If fetch, push or GitHub API access fails for network/infrastructure reasons but the exact task baseline is locally verifiable, do not treat that infrastructure failure as a baseline mismatch. Follow the network-resilient delivery policy.

Do not silently select another baseline.

Do not silently rebase.

---

## Network-resilient delivery policy

GitHub availability and repository correctness are separate concerns.

A task must not become useless merely because `fetch`, `push` or Pull Request creation is temporarily unavailable.

When the exact repository identity, clean working tree and exact task baseline SHA are locally verifiable, Codex should continue the authorized local work even if remote network operations fail.

Preferred delivery order:

1. create or use the exact task branch from the approved baseline;
2. make only authorized changes;
3. run required validations;
4. create a local commit when permitted by the task;
5. attempt push to `origin`;
6. attempt to open the authorized Draft Pull Request;
7. if push or PR creation is unavailable, preserve the completed local work and produce a transportable fallback.

The fallback should be, in order of preference:

1. a Git patch representing the completed task, suitable for application with `git apply` or an equivalent documented command;
2. if a patch cannot be produced, the complete modified files together with their exact repository paths.

When falling back, report:

- repository;
- exact baseline SHA;
- exact task branch;
- local commit SHA, if created;
- files changed;
- validations executed and results;
- exact remote operation that failed and its error;
- patch filename or complete-file fallback paths;
- exact commands the project owner can run locally to apply, inspect, commit, push and continue the PR workflow.

Do not reset, discard or overwrite completed authorized work merely because GitHub is unreachable.

Only stop before implementation when repository identity, baseline integrity, branch safety or working-tree integrity cannot be established safely.

---

## Branch policy

Never implement a task directly on `develop` or `main`.

Create the exact task branch from the approved baseline before editing.

Never reuse an unrelated feature branch.

When a task specifies a branch name, that branch name becomes part of the task contract after branch creation.

---

## Mandatory delivery invariants

### Initial execution branch is not task identity

A remote environment may initially be on `work`, a detached HEAD or another temporary branch. This is not by itself a preflight failure when repository identity is correct, the working tree is clean and the exact baseline SHA is verifiable.

The initial temporary branch never substitutes for the task branch.

### Exact task branch before edits

When a task provides a mandatory branch, Codex must:

1. verify the baseline;
2. create or switch to the exact task branch;
3. verify that the exact task branch is active;
4. only then edit files.

Do not implement first and move the commit administratively afterward.

### No task commits on temporary branches

Task commits must not be created on `work`, `main`, `develop` or another temporary execution branch.

When the task specifies an exact branch, that exact branch is mandatory.

When the task does not specify a branch, create a dedicated task branch from the approved baseline using the repository convention `codex/<task-name>` before editing.

For the remainder of this section, `task branch` means the exact branch specified by the task, or the dedicated branch derived using `codex/<task-name>` when no exact branch was specified.

The delivery commit must belong to the task branch.

### Exact pushed branch

When a task authorizes push or Pull Request delivery, the branch pushed to `origin` must be exactly the task branch. Never use a temporary branch as the delivery source.

### Exact Pull Request head and base

Before considering a Pull Request delivered, verify for the normal repository flow, unless the task explicitly instructs otherwise:

```text
head = exact task branch
base = develop
```

A Pull Request created from `work` or another branch is not valid delivery even if it contains exactly the same commit.

### Draft is mandatory initial state

When a task authorizes creating a Pull Request and does not explicitly authorize Ready for Review, create the Pull Request as:

```text
Draft
```

Creating a Pull Request and later changing it to Ready for Review require separate authorizations. Never interpret “create PR”, “open PR”, “deliver PR”, successful tests or successful validation as authorization to mark a Pull Request Ready for Review.

### Delivery verification before completion report

Before declaring success, explicitly run at least:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
```

When GitHub is accessible, also verify that the Pull Request has the exact head branch, exact base branch and correct Draft state.

The completion report must state observed values, not expected or assumed values.

### Wrong branch or Pull Request is incomplete delivery

If Codex detects before completion that it accidentally created a commit on the wrong branch, pushed the wrong branch, created a Pull Request with the wrong head or base, or created a non-Draft Pull Request without authorization, it must not report the task as correctly delivered.

Correct the delivery during the same execution when this can be done safely, without modifying the implementation or taking reserved actions such as merge or Ready for Review. The user should not need to request a separate administrative correction for invariants already required by the original task.

### Implementation and delivery correctness are separate

A correct implementation does not imply a correct delivery. A task is complete only when both are satisfied:

```text
implementation invariants
+
delivery invariants
```

A correct commit contained in the wrong branch or Pull Request remains an incomplete delivery.

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

### Foundational Pull Requests

A foundational Pull Request must introduce one minimal, explicit and verifiable architectural capability or boundary.

Do not use a foundational PR as an opportunity for unrelated cleanup, refactors, UX changes, dependency changes or follow-on functionality.

Any additional change must be strictly necessary to establish or validate the declared foundation. Otherwise defer it to a later PR.

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

If steps 5 or 6 fail solely because remote connectivity or GitHub access is unavailable, follow the network-resilient delivery policy instead of discarding the completed local work.

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
- fallback patch or complete-file artifact, when remote delivery failed;
- confirmation that no unrelated repository was modified.

If validation or remote delivery could not be performed, state exactly what was not validated or delivered and why.
