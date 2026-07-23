# Task routing

Read project `AGENTS.md` and `COMPONENTS.md` first. Use the smallest specialist skill set that covers the request.

| Request | Add | Inspect first |
| --- | --- | --- |
| React pages, components, hooks, routes, client data | `vercel-react-best-practices` | Related route, feature, service, and `COMPONENTS.md` |
| i18n work | This skill | `src/locales/*.js` and the feature |
| Vue, Vue Router, or Pinia | Relevant Vue skills | Target `.vue` files and stores |
| Images | `imagegen` | Existing asset and its UI consumer |

## UI choice order

1. Search `COMPONENTS.md` by interaction and layout need.
2. Reuse global Toast, loading/error components, and layouts before adding equivalents.
3. Search the feature folder before introducing a feature-specific primitive.
