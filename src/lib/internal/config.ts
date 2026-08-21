import type { HrefLocalizer } from './link.js';

/** Library-wide defaults shared by both presentation variants. */
export type I18nMarkupConfig = {
	/**
	 * Localizes internal link hrefs, normally Paraglide's generated
	 * `localizeHref` from your project's output directory.
	 */
	localizeHref?: HrefLocalizer;
};

let configuredLocalizeHref: HrefLocalizer | undefined;

/**
 * Sets library-wide defaults.
 *
 * Call this once while your app starts up, passing the `localizeHref` that
 * Paraglide generated into your project's output directory. The value is module
 * state, so it must not be changed per request on the server. Pass the
 * `localizeHref` prop on `I18nMarkupMessage` instead to override it for one
 * message.
 *
 * See the README for a copy-pasteable example.
 */
export function configureI18nMarkup(config: I18nMarkupConfig): void {
	configuredLocalizeHref = config.localizeHref;
}

/** The configured localizer, if any. Links are left as-is without one. */
export function configuredHrefLocalizer(): HrefLocalizer | undefined {
	return configuredLocalizeHref;
}
