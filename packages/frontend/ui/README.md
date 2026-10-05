# @template/ui

The design system: shadcn/ui ("new-york", zinc) on Tailwind CSS v4 and Radix. Presentational
only: no data fetching, no i18n (callers pass translated text), no app knowledge.

## Layout

| Path                   | Holds                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `src/primitives/`      | shadcn components, kept flat because the shadcn CLI owns that layout                        |
| `src/components/`      | Compositions: `form/` (react-hook-form bindings), `password-input`, `spinner`, `status-dot` |
| `src/lib/cn.ts`        | `cn()` class merger                                                                         |
| `src/styles/theme.css` | Design tokens (light/dark) as CSS variables + Tailwind `@theme`                             |

## Usage

```ts
import { Button } from '@template/ui/primitives/button';
import { Form, FormItem } from '@template/ui/components/form/form';
```

The app's global stylesheet must import the theme and let Tailwind scan this package:

```css
@import 'tailwindcss';
@import '@template/ui/styles/theme.css';
@source '../../../../packages/frontend/ui/src';
```

## Adding a shadcn component

`bunx shadcn@latest add <name>` from this folder (paths are configured in `components.json`),
then change `@/lib/utils` imports to `../lib/cn.js`.
