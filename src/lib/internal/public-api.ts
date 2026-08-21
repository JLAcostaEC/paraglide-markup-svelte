/**
 * Everything both entry points expose apart from `I18nMarkupMessage` itself.
 *
 * Re-exported verbatim by `paraglide-markup-svelte` and
 * `paraglide-markup-svelte/tailwindcss` so the two variants can never drift
 * apart in their public surface.
 */

export { configureI18nMarkup } from './config.js';
export type { I18nMarkupConfig } from './config.js';

export { anchorAttributes, hrefKind, isExternalHref, linkHref, FALLBACK_HREF } from './link.js';
export type { AnchorAttributes, AnchorAttributesInput, HrefKind, HrefLocalizer } from './link.js';

export {
	integerOption,
	isFlagSet,
	listItemValue,
	mergeClasses,
	optionClass,
	optionText,
	orderedListAttributes,
	orderedListType,
	ORDERED_LIST_TYPES
} from './markup.js';
export type { OrderedListAttributes, OrderedListType } from './markup.js';

export { CANONICAL_MARKUP_TAGS, DEFAULT_MARKUP_TAGS, MARKUP_ALIAS_ENTRIES } from './renderers.js';
export type { CanonicalMarkupTag, DefaultMarkupTag, MarkupAlias } from './renderers.js';

export type {
	I18nMarkupMessageProps,
	I18nMarkupRenderer,
	I18nMarkupRendererProps,
	MarkupRendererOverrides,
	MessageInputsOf,
	MessageMarkupAttributes,
	MessageMarkupOptions,
	MessageMarkupTag,
	MessageMarkupTagsOf,
	MessageOptions,
	MessageOptionsOf,
	ParaglideMessageLike
} from './types.js';
