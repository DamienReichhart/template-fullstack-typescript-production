# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase. Layout: **multi-context**, one bounded context per folder under `packages/contexts/`.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root (`GLOSSARY-MAP.md` is a symlink to it): the map. It lists each context with a one-line scope and links its `GLOSSARY.md`, and its **Relationships** section says how contexts talk (always through queued jobs, never imports). Read the glossary of every context the topic touches.
- **`packages/contexts/<context>/README.md`**: the context's layers, where each one runs, its integrations and the data it owns.
- **`docs/adr/`**: system-wide decisions. Read the ones that touch the area you're about to work in; the titles state the decision, so `ls docs/adr` is usually enough to pick.
- **`packages/contexts/<context>/docs/adr/`**: decisions scoped to one context. Only some contexts have one yet (identity does).
- **`docs/architecture/boundaries.md`** when a change crosses a context, app or layer: it holds the import rules the lint enforces.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```text
/
├── CONTEXT.md                             ← the map (GLOSSARY-MAP.md links to it)
├── docs/adr/                              ← system-wide decisions, 0001…
└── packages/contexts/
    ├── identity/
    │   ├── README.md
    │   ├── GLOSSARY.md
    │   └── docs/adr/                      ← context decisions, numbered from 0001 again
    └── notifications/
        ├── README.md
        └── GLOSSARY.md
```

A new context follows `docs/guides/add-a-bounded-context.md`, which adds its line to `CONTEXT.md`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name, a class or a variable), use the term as defined in that context's `GLOSSARY.md`, capitalised as the glossary writes it (User, Session, One-time token). Don't drift to synonyms the glossary explicitly avoids. The same word can mean different things in two contexts (a Notifications Recipient is not an Identity User): use the term of the context you're in.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`). A new term lands in the context's `GLOSSARY.md`, and in `CONTEXT.md` when it changes a context's scope or a relationship.

## Writing an ADR

Match the existing ones: the title is the decision as a sentence (`# Users can sign in before verifying their email`), followed by one paragraph giving the decision, why, and what it costs. File name `NNNN-<title-slug>.md`, the next number in that folder. A decision that binds one context goes in its `docs/adr/`; anything crossing contexts or apps goes in `docs/adr/`. Record only hard-to-reverse decisions.

## Flag ADR conflicts

Cite a system-wide ADR as the repo does (`ADR 0007`) and a context one with its context (`identity ADR 0001`), since context numbering restarts. If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR 0007 (sessions live in httpOnly cookies), but worth reopening because…_
