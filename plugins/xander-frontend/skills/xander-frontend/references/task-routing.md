# Task routing

Use the smallest set that covers the request. Read project `AGENTS.md` and `COMPONENTS.md` first in every case.

| Request                                                           | Add these skills / references                                 | Inspect first                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| React pages, components, hooks, routes, client data               | `vercel-react-best-practices`                                 | `src/router`, feature page, related service, `COMPONENTS.md`      |
| Studio upload, compiler, preview, source sharing, Node Studio API | this skill; React best practices for UI                       | `src/features/studio`, Node service’s `AGENTS.md` and `server.js` |
| i18n text or locale work                                          | this skill                                                    | `src/locales/*.js` and surrounding feature                        |
| Vue, Vue Router, or Pinia code                                    | `vue-best-practices`, plus router/Pinia skill when applicable | target `.vue` files and store/router                              |
| GitHub PR review or CI failure                                    | relevant `github:*` skill                                     | PR/check context before editing                                   |
| Images or bitmap asset edits                                      | `imagegen`                                                    | existing asset and UI consumer                                    |
| Docs, slides, spreadsheets, or PDFs                               | corresponding artifact skill                                  | requested artifact and template                                   |
| Visual simulator, chart, or interactive exploration               | `visualize`                                                   | requested data and interaction model                              |

## Xander UI choice order

1. Search `COMPONENTS.md` by interaction and layout need.
2. Use `CustomSelect` for enum choices; do not introduce a native `select` without a browser-native requirement.
3. Use `Modal`, global Toast, loading/error components, and existing layouts before introducing equivalents.
4. For a feature-specific primitive, search its feature folder before creating another one.
