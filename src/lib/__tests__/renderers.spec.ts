import { describe, expect, it } from 'vitest';
import { CANONICAL_MARKUP_TAGS, DEFAULT_MARKUP_TAGS, MARKUP_ALIAS_ENTRIES } from '$lib/index.js';
import type { CanonicalMarkupTag, I18nMarkupRenderer } from '$lib/index.js';
import { resolveRenderers } from '../internal/renderers.js';
import type { CanonicalRendererSet } from '../internal/types.js';

/**
 * Snippets are opaque functions at runtime, so the tests identify a renderer by
 * its reference rather than by what it would render.
 */
function stubRenderer(name: string): I18nMarkupRenderer {
	const renderer = () => {};
	Object.defineProperty(renderer, 'name', { value: name });
	return renderer as unknown as I18nMarkupRenderer;
}

const canonical: CanonicalRendererSet = Object.fromEntries(
	CANONICAL_MARKUP_TAGS.map((tag) => [tag, stubRenderer(tag)])
) as Record<CanonicalMarkupTag, I18nMarkupRenderer>;

describe('markup tag inventory', () => {
	it('covers every tag the default renderers document', () => {
		expect([...DEFAULT_MARKUP_TAGS].sort()).toEqual(
			[
				'a',
				'b',
				'br',
				'code',
				'em',
				'i',
				'li',
				'link',
				'mark',
				'muted',
				'nowrap',
				'ol',
				'p',
				's',
				'small',
				'span',
				'strong',
				'sub',
				'sup',
				'u',
				'ul'
			].sort()
		);
	});

	it('keeps aliases out of the canonical set so behaviour is implemented once', () => {
		const aliases = MARKUP_ALIAS_ENTRIES.map(([alias]) => alias);
		for (const alias of aliases) {
			expect(CANONICAL_MARKUP_TAGS).not.toContain(alias);
		}
		expect(aliases).toEqual(['a', 'b', 'i']);
	});

	it('points every alias at a canonical tag', () => {
		for (const [, target] of MARKUP_ALIAS_ENTRIES) {
			expect(CANONICAL_MARKUP_TAGS).toContain(target);
		}
	});
});

describe('resolveRenderers', () => {
	it('exposes every canonical renderer', () => {
		const resolved = resolveRenderers(canonical, {});
		for (const tag of CANONICAL_MARKUP_TAGS) {
			expect(resolved[tag]).toBe(canonical[tag]);
		}
	});

	it('reuses the canonical renderer for each alias', () => {
		const resolved = resolveRenderers(canonical, {});
		expect(resolved.a).toBe(canonical.link);
		expect(resolved.b).toBe(canonical.strong);
		expect(resolved.i).toBe(canonical.em);
	});

	it('replaces a default renderer with an override of the same name', () => {
		const custom = stubRenderer('custom-strong');
		const resolved = resolveRenderers(canonical, { strong: custom });
		expect(resolved.strong).toBe(custom);
	});

	it('adds a renderer for a tag the defaults do not know', () => {
		const badge = stubRenderer('badge');
		const resolved = resolveRenderers(canonical, { badge });
		expect(resolved.badge).toBe(badge);
	});

	it('carries an override of a canonical tag over to its aliases', () => {
		const custom = stubRenderer('custom-strong');
		const resolved = resolveRenderers(canonical, { strong: custom });
		expect(resolved.b).toBe(custom);
	});

	it('lets an explicit alias override win over the canonical override', () => {
		const customStrong = stubRenderer('custom-strong');
		const customB = stubRenderer('custom-b');
		const resolved = resolveRenderers(canonical, { strong: customStrong, b: customB });
		expect(resolved.strong).toBe(customStrong);
		expect(resolved.b).toBe(customB);
	});

	it('overrides an alias on its own without touching the canonical tag', () => {
		const customB = stubRenderer('custom-b');
		const resolved = resolveRenderers(canonical, { b: customB });
		expect(resolved.b).toBe(customB);
		expect(resolved.strong).toBe(canonical.strong);
	});

	it('ignores props that are not snippets, such as an unset override', () => {
		const resolved = resolveRenderers(canonical, { strong: undefined, mark: null, code: 'nope' });
		expect(resolved.strong).toBe(canonical.strong);
		expect(resolved.mark).toBe(canonical.mark);
		expect(resolved.code).toBe(canonical.code);
	});

	it('does not mutate the renderer set it was given', () => {
		const badge = stubRenderer('badge');
		const before = { ...canonical };
		resolveRenderers(canonical, { badge });
		expect(canonical).toEqual(before);
		expect('badge' in canonical).toBe(false);
	});
});
