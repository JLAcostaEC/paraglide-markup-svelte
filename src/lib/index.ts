/**
 * `paraglide-markup-svelte` — the default presentation, styled with
 * component-scoped Svelte CSS. Works without Tailwind and without importing a
 * stylesheet.
 *
 * For the Tailwind presentation import from `paraglide-markup-svelte/tailwindcss`,
 * which exposes the same `I18nMarkupMessage` and the same public types.
 */

export { default as I18nMarkupMessage } from './css/I18nMarkupMessage.svelte';
export * from './internal/public-api.js';
