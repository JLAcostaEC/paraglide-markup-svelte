import type { MessageMarkupAttributes, MessageMarkupOptions } from '@inlang/paraglide-js-svelte';
import { isFlagSet, optionText } from './markup.js';

/**
 * Turns an app-internal href into a locale-aware one.
 *
 * Paraglide generates `localizeHref` into the consuming app's output directory,
 * so the library cannot import it. Supply it once with `configureI18nMarkup`,
 * or per message with the `localizeHref` prop.
 */
export type HrefLocalizer = (href: string) => string;

/** How a link target should be treated. */
export type HrefKind =
	/** An app path such as `/about` — localized. */
	| 'internal'
	/** A same-document `#hash` or `?query` — left untouched. */
	| 'anchor'
	/** Another origin or scheme — never localized, opens in a new tab. */
	| 'external'
	/** An email address — never localized, stays in the same tab. */
	| 'mailto'
	/** A phone number — never localized, stays in the same tab. */
	| 'tel';

/** Used when a link carries no usable target at all. */
export const FALLBACK_HREF = '#';

const NETWORK_PATH = /^\/\//;
const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/** Classifies a link target. */
export function hrefKind(href: string): HrefKind {
	const trimmed = href.trim();

	if (NETWORK_PATH.test(trimmed)) {
		return 'external';
	}
	if (trimmed.startsWith('#') || trimmed.startsWith('?')) {
		return 'anchor';
	}

	const scheme = SCHEME.exec(trimmed)?.[1]?.toLowerCase();
	if (scheme === undefined) {
		return 'internal';
	}
	if (scheme === 'mailto') {
		return 'mailto';
	}
	if (scheme === 'tel' || scheme === 'sms') {
		return 'tel';
	}

	return 'external';
}

/** Whether a link leaves the app. */
export function isExternalHref(href: string): boolean {
	const kind = hrefKind(href);
	return kind === 'external' || kind === 'mailto' || kind === 'tel';
}

/** The attributes a rendered `<a>` receives. */
export type AnchorAttributes = {
	href: string;
	target: '_blank' | undefined;
	rel: string | undefined;
};

/** Everything needed to turn markup options and flags into `<a>` attributes. */
export type AnchorAttributesInput = {
	options: MessageMarkupOptions;
	attributes: MessageMarkupAttributes;
	localizeHref?: HrefLocalizer;
};

/** Reads the link target from `href=|..|`, `to=|..|` or `url=|..|`. */
export function linkHref(options: MessageMarkupOptions): string {
	return (
		optionText(options.href) ?? optionText(options.to) ?? optionText(options.url) ?? FALLBACK_HREF
	);
}

/**
 * Builds the attributes for a link rendered from a message.
 *
 * Internal paths are localized; everything else is passed through untouched.
 * Cross-origin links open in a new tab and get `rel="noopener noreferrer"`;
 * `mailto:` and `tel:` links stay in the same tab, because handing them to a
 * new browser tab leaves an empty window behind. `@newtab`, `@external` and
 * `@nofollow` override the detected behaviour.
 */
export function anchorAttributes({
	options,
	attributes,
	localizeHref
}: AnchorAttributesInput): AnchorAttributes {
	const href = linkHref(options);
	const kind = hrefKind(href);

	const external = kind === 'external' || isFlagSet(attributes, 'external');
	const opensNewTab =
		isFlagSet(attributes, 'newtab') || (external && kind !== 'mailto' && kind !== 'tel');

	const rel: string[] = [];
	if (opensNewTab) {
		rel.push('noopener', 'noreferrer');
	}
	if (isFlagSet(attributes, 'nofollow')) {
		rel.push('nofollow');
	}

	const localizable = kind === 'internal' && !external;

	return {
		href: localizable && localizeHref ? localizeHref(href) : href,
		target: opensNewTab ? '_blank' : undefined,
		rel: rel.length > 0 ? rel.join(' ') : undefined
	};
}
