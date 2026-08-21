import type { CanonicalRendererSet, I18nMarkupRenderer, MarkupRendererBag } from './types.js';

/**
 * Tags that have their own renderer implementation.
 *
 * A presentation variant provides exactly one renderer per entry; aliases are
 * added afterwards by {@link resolveRenderers} and never reimplemented.
 */
export const CANONICAL_MARKUP_TAGS = [
	'link',
	'strong',
	'em',
	'u',
	's',
	'mark',
	'code',
	'small',
	'sup',
	'sub',
	'muted',
	'nowrap',
	'span',
	'p',
	'ul',
	'ol',
	'li',
	'br'
] as const;

/** A tag with its own renderer implementation. */
export type CanonicalMarkupTag = (typeof CANONICAL_MARKUP_TAGS)[number];

/**
 * Alternative names that reuse an existing renderer.
 *
 * Stored as tuples rather than a record so iteration keeps the key literals.
 */
export const MARKUP_ALIAS_ENTRIES = [
	['a', 'link'],
	['b', 'strong'],
	['i', 'em']
] as const satisfies readonly (readonly [string, CanonicalMarkupTag])[];

/** A tag name that reuses another tag's renderer. */
export type MarkupAlias = (typeof MARKUP_ALIAS_ENTRIES)[number][0];

/** Every tag name the default renderer set responds to. */
export type DefaultMarkupTag = CanonicalMarkupTag | MarkupAlias;

/** Every default tag name, canonical entries first. */
export const DEFAULT_MARKUP_TAGS: readonly DefaultMarkupTag[] = [
	...CANONICAL_MARKUP_TAGS,
	...MARKUP_ALIAS_ENTRIES.map(([alias]) => alias)
];

/**
 * Snippets are functions at runtime, which is what separates a renderer
 * override from an unset prop without asserting the value's type.
 */
function isRenderer(value: unknown): value is I18nMarkupRenderer {
	return typeof value === 'function';
}

/**
 * Merges a variant's canonical renderers with consumer-provided overrides.
 *
 * Resolution order is fixed:
 *
 * 1. the variant's canonical renderers,
 * 2. aliases, pointing at the canonical renderer they reuse,
 * 3. consumer overrides, replacing a default or adding a new tag,
 * 4. aliases of an overridden canonical tag, so that overriding `strong` also
 *    changes `b` — unless `b` itself was overridden, which always wins.
 */
export function resolveRenderers(
	canonical: CanonicalRendererSet,
	overrides: MarkupRendererBag
): Record<string, I18nMarkupRenderer> {
	const resolved: Record<string, I18nMarkupRenderer> = { ...canonical };

	for (const [alias, target] of MARKUP_ALIAS_ENTRIES) {
		resolved[alias] = canonical[target];
	}

	for (const [tag, renderer] of Object.entries(overrides)) {
		if (isRenderer(renderer)) {
			resolved[tag] = renderer;
		}
	}

	for (const [alias, target] of MARKUP_ALIAS_ENTRIES) {
		const aliasOverride = overrides[alias];
		if (isRenderer(aliasOverride)) {
			continue;
		}

		const targetOverride = overrides[target];
		if (isRenderer(targetOverride)) {
			resolved[alias] = targetOverride;
		}
	}

	return resolved;
}
