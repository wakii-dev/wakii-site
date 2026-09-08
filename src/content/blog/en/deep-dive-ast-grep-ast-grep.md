---
title: "ast-grep: find and fix code by AST"
description: "ast-grep searches and rewrites code by syntax structure: patterns look like code, complex rules live in YAML files, and sg scan runs in CI as a machine gate. This post reads the repo's actual code to see how the mechanism works."
pubDate: "2026-10-18"
category: "tech"
tags: ["terminal", "cli"]
draft: false
---

grep works on text: you hand it a string, it returns the lines containing that string. But code is not plain text — code is a syntax tree. Rename a variable, wrap a line, add parentheses: the meaning stays the same while grep's result changes. The ast-grep/ast-grep repo — 15,799 stars, MIT licensed, per the GitHub API on 2026-09-08 — goes the other way: it finds and fixes code by structure, using patterns that look like the code you are looking for.

TL;DR:

- Patterns are written as code: `$A && $A()` matches every expression with the same structure, regardless of formatting or variable names.
- The `$A` variable is stored in an environment on match — reusable when rewriting.
- Complex rules move into YAML files with severity and fix — rules become data, reviewable like code.
- `sg scan` reads a rule directory and returns an ExitCode — the right shape for a command you install in CI.
- Wakii runs the same principle in its blog pipeline: machine lint green first, human review second.

## Patterns written as code, matched as structure

The repo's README compresses the idea into one line: ast-grep is "a CLI tool for code structural search, lint, and rewriting" (ast-grep/ast-grep, [README](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/README.md)). What it matches is not text but nodes of the syntax tree produced by tree-sitter. The README's own example:

```bash
ast-grep -p '$A && $A()' -l ts -r '$A?.()'
```

One command: find every place that calls the same value twice and rewrite it into the optional-call form `$A?.()`. A regex only catches this pattern cleanly if you predict the whitespace and variable names in advance; an AST pattern predicts nothing — `$A` matches any single node, and `$A` appearing twice in one pattern forces both nodes to be identical.

The mechanism lives in a fairly small struct inside crates/core. The repo's own comment explains how the variable binds to real code:

```rust
/// a dictionary that stores metavariable instantiation
/// const a = 123 matched with const a = $A will produce env: $A => 123
pub struct MetaVarEnv<'tree, D: Doc> {
  single_matched: HashMap<MetaVariableID, Node<'tree, D>>,
  multi_matched: HashMap<MetaVariableID, Vec<Node<'tree, D>>>,
  transformed_var: HashMap<MetaVariableID, Underlying<D>>,
}
```

Source: [crates/core/src/meta_var.rs](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/core/src/meta_var.rs), HEAD of main on 2026-09-08.

On every match, `$A` is recorded in `MetaVarEnv` together with the real node it stands for — the rewrite step reuses that record, so the replacement knows exactly which node to insert. Three dictionaries keep three kinds of variables apart: single matches, multi-node matches, and transformed variables. A pattern is therefore both easy to write (it looks like ordinary code) and informative enough to patch the code in the right place.

## When one line is not enough: rules as YAML files

A one-line pattern handles simple find-and-replace. Banning a set of code patterns with conditions and scope needs somewhere to describe the rule outside the CLI. ast-grep picks YAML: each rule declares an id, a language, the match condition, a severity and a fix. The severity ladder comes straight from the code:

```rust
pub enum Severity {
  /// Turns off the rule.
  Off,
  #[default]
  /// A kind reminder for code with potential improvement.
  Hint,
  /// A suggestion that code can be improved or optimized.
  Info,
  /// A warning that code might produce bugs or does not follow best practice.
  Warning,
  /// An error that code produces bugs or has logic errors.
  Error,
}
```

Source: [crates/config/src/rule_config.rs](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/config/src/rule_config.rs), HEAD of main on 2026-09-08.

Five levels from Off to Error — exactly the scale a CI gate needs to separate "just a hint" from "must fix". The description of each level sits next to the enum like documentation: anyone reading a rule understands which level blocks and which only suggests.

The depth of the rule system lives in [crates/config/src/rule](https://github.com/ast-grep/ast-grep/tree/fc2b1530db74de49131b725221de98036a552a9f/crates/config/src/rule) (GitHub API on 2026-09-08) — the directory contains files named after their mechanisms:

```
relational_rule.rs   relational rules: inside / has
nth_child.rs         child position within a parent node
stop_by.rs           stop condition when walking the tree
referent_rule.rs     rules referencing other rules
selector.rs          picking nodes for other rules to apply to
```

Relational rules are the big win: a rule can say "find pattern X inside pattern Y" instead of cramming both into one pattern. A rule then becomes structured data — read, reviewed and versioned alongside the code, instead of a regex buried in a script nobody dares to touch.

## `sg scan` in CI: the machine gates before the human reads

The CLI carries the short name `sg` (the README titles the tool "ast-grep(sg)"). The scan command has its own file in the CLI — and its signature shows a CI-first design:

```rust
pub fn run_with_config(arg: ScanArg, project: Result<ProjectConfig>) -> Result<ExitCode>
```

Source: [crates/cli/src/scan.rs](https://github.com/ast-grep/ast-grep/blob/fc2b1530db74de49131b725221de98036a552a9f/crates/cli/src/scan.rs), HEAD of main on 2026-09-08 — the function returns `std::process::ExitCode`, meaning the exit status of `sg scan` reflects the scan result, exactly what a CI job needs to pass or fail. The ast-grep organization also maintains the `ast-grep/action` repo for embedding the scan step into GitHub Actions (exists, 12 stars, per the GitHub API on 2026-09-08).

The release cadence shows a tool in steady use: 5 of the 10 most recent releases (per the GitHub API on 2026-09-08):

| Tag | Date |
|--------|------------|
| 0.45.3 | 2026-08-31 |
| 0.45.2 | 2026-08-23 |
| 0.45.1 | 2026-08-07 |
| 0.45.0 | 2026-07-23 |
| 0.44.1 | 2026-07-04 |

Continuous patches, a minor roughly once a month — the rhythm of a tool used in anger, not a showcase repo.

The lesson is not ast-grep itself but the shape it chose: the machine scans first, the human reads second. A mediocre YAML rule can still be fixed while it runs quietly in CI; no rule survives if every violation needs a human eyeball. Wakii runs the same shape for its blog pipeline — the post [CI gates: the machine blocks first, the human closes](/blog/arch-ci-gates/) describes exactly this layering: vocabulary lint, word band, and two-locale parity run first; human review only receives what the machine cannot judge.

## One engine, many faces

The whole repo is a Rust workspace split along the right boundaries: core is the engine, config is the rule system, the rest are faces for individual environments (per the GitHub API on 2026-09-08):

```
crates/core     pattern matching engine on the tree-sitter tree
crates/config   loads YAML rules, severity, fix
crates/cli      the sg command line
crates/language language definitions
crates/napi     Node.js binding (npm @ast-grep/cli)
crates/wasm     runs in the browser (online playground)
crates/lsp      language server for editors
crates/pyo3     Python binding
```

Source: [crates/](https://github.com/ast-grep/ast-grep/tree/fc2b1530db74de49131b725221de98036a552a9f/crates), GitHub API on 2026-09-08.

Separating the engine from the interfaces is why this tool shows up in so many places without duplicating logic: the same `MetaVarEnv`, the same YAML rules, running in a terminal, in an npm script, on a playground page, and inside editors over LSP. Wakii layers its checks the same way: one rule core (the topic matrix manifest plus the lint script) serves several faces — lint while writing, audit at convergence, gate at build — instead of each face inventing its own rules.

If you want to see where these check layers sit inside a real story — the machine runs lint in every SF, the human decides at gates — read the [story workflow: from idea to release](/docs/story-workflow/).

## What Wakii learns

- **ADOPT** — the "machine gate before human review" principle is one Wakii already applies and keeps: content lint (word band, FORBIDDEN list, grading marker) and two-locale parity run in the build chain before a reviewer opens the post; the B0-B5 gates have the same shape at the story level. The three-layer watchdog is another machine gate ([idle is not dead](/blog/watchdog-idle-is-not-dead/)). This post confirms the direction with a tool that runs the same principle at industry scale.
- **DIRECTION** — AST-level checks for content: today's lint checks line by line (band counting, literal grep, heading level comparison) and is enough for data-style rules like the FORBIDDEN list. When checks need to go beyond the line — nested section structure, frontmatter schemas with many constraints — the AST direction is feasible in principle because tree-sitter has a markdown grammar (tree-sitter-grammars/tree-sitter-markdown, MIT, per the GitHub API on 2026-09-08). Being honest about the present: no current blog check needs an AST — this is a direction, not a task worth doing today.
- **WATCH** — a pattern-level scanner for scripts in the site repo: ast-grep supports JavaScript out of the box; if the number of code-level rules to enforce on the check scripts grows until regex breaks down, an `sg scan`-style scanner with YAML rules becomes the candidate. Condition to change the grade: the first code-level rule that regex cannot express correctly.

ast-grep ships an online playground so you can try patterns without installing anything. If you are building a content pipeline or a multi-gate agent workflow, download Wakii and run your first story following the docs.
