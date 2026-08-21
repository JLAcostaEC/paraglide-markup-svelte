/**
 * `paraglide-markup-svelte/tailwindcss` — the same `I18nMarkupMessage`, styled
 * with Tailwind utility classes instead of component-scoped CSS.
 *
 * Tailwind must scan this package and, if messages use `class=|...|`, your
 * message files:
 *
 * ```css
 * @import 'tailwindcss';
 * @source '../node_modules/paraglide-markup-svelte/dist';
 * @source '../messages';
 * ```
 */

export { default as I18nMarkupMessage } from './I18nMarkupMessage.svelte';
export * from '../internal/public-api.js';
