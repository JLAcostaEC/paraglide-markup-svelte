import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { m } from '$lib/paraglide/messages.js';
import type { HrefLocalizer } from '$lib/index.js';
import RenderMessage from './fixtures/RenderMessage.svelte';
import CustomBadge from './fixtures/CustomBadge.svelte';
import OverrideRenderers from './fixtures/OverrideRenderers.svelte';

/** Stands in for Paraglide's generated `localizeHref`. */
const localizeHref: HrefLocalizer = (href) => `/es${href}`;

const VARIANTS = ['css', 'tailwind'] as const;
type Variant = (typeof VARIANTS)[number];

/** A tag name, its attributes and its text, with presentation stripped out. */
type SemanticNode =
	{ text: string } | { tag: string; attrs: Record<string, string>; children: SemanticNode[] };

/**
 * Describes what a variant rendered, ignoring anything presentational.
 *
 * Classes are dropped (they are the whole point of the difference between the
 * two variants) and whitespace is collapsed, so the comparison is about
 * elements, attributes and text.
 */
function semanticShape(root: Element): SemanticNode[] {
	const nodes: SemanticNode[] = [];

	for (const node of root.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
			if (text !== '') {
				nodes.push({ text });
			}
			continue;
		}

		if (!(node instanceof Element)) {
			continue;
		}

		const attrs: Record<string, string> = {};
		for (const attribute of node.attributes) {
			if (attribute.name !== 'class') {
				attrs[attribute.name] = attribute.value;
			}
		}

		nodes.push({ tag: node.tagName.toLowerCase(), attrs, children: semanticShape(node) });
	}

	return nodes;
}

/** Collapses rendered text the way a reader sees it. */
function visibleText(root: Element): string {
	return (root.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe.each(VARIANTS)('I18nMarkupMessage (%s)', (variant: Variant) => {
	describe('message content', () => {
		it('renders a message without markup as plain text', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.plain_text
			});

			expect(visibleText(container)).toBe('Plain text without markup.');
			expect(container.querySelectorAll('*')).toHaveLength(0);
		});

		it('interpolates message inputs', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.hello_world,
				inputs: { name: 'Ada' }
			});

			expect(visibleText(container)).toBe('Hello, Ada from en!');
		});

		it('renders markup', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.docs_link
			});

			const anchor = container.querySelector('a');
			expect(anchor).not.toBeNull();
			expect(anchor?.textContent?.trim()).toBe('Read the docs');
		});

		it('renders inputs interpolated inside markup', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.markup_with_input,
				inputs: { name: 'Ada' }
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('/users');
			expect(anchor?.textContent?.replace(/\s+/g, ' ').trim()).toBe("Ada's profile");
		});

		it('honours message options', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.hello_world,
				inputs: { name: 'Ada' },
				options: { locale: 'es' }
			});

			expect(visibleText(container)).toBe('Hola, Ada desde es!');
		});

		it('renders nested markup as nested elements', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.nested_markup
			});

			const emphasis = container.querySelector('p > strong > em');
			expect(emphasis?.textContent?.trim()).toBe('and italic');
		});

		it('renders the children of a tag that has no renderer, without a wrapper', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.unknown_tag
			});

			expect(visibleText(container)).toBe('Hello stranger!');
			expect(container.querySelectorAll('*')).toHaveLength(0);
		});
	});

	describe('default renderers', () => {
		it('uses a semantic element for every inline tag', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.inline_styles
			});

			expect(container.querySelector('strong')?.textContent?.trim()).toBe('bold');
			expect(container.querySelector('em')?.textContent?.trim()).toBe('emph');
			expect(container.querySelector('u')?.textContent?.trim()).toBe('under');
			expect(container.querySelector('s')?.textContent?.trim()).toBe('struck');
			expect(container.querySelector('mark')?.textContent?.trim()).toBe('marked');
			expect(container.querySelector('code')?.textContent?.trim()).toBe('code');
			expect(container.querySelector('small')?.textContent?.trim()).toBe('small');
			expect(container.querySelector('sup')?.textContent?.trim()).toBe('sup');
			expect(container.querySelector('sub')?.textContent?.trim()).toBe('sub');
			expect(container.querySelector('span[data-i18n-markup="muted"]')?.textContent?.trim()).toBe(
				'muted'
			);
			expect(container.querySelector('span[data-i18n-markup="nowrap"]')?.textContent?.trim()).toBe(
				'no wrap'
			);
		});

		it('renders aliases through the same element as their canonical tag', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.inline_styles
			});

			const strongs = [...container.querySelectorAll('strong')].map((el) => el.textContent?.trim());
			const emphases = [...container.querySelectorAll('em')].map((el) => el.textContent?.trim());

			expect(strongs).toEqual(['bold', 'alias-bold']);
			expect(emphases).toEqual(['emph', 'alias-emph']);
		});

		it('renders the a alias as an anchor', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.about_anchor
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('/about');
			expect(anchor?.textContent?.trim()).toBe('About us');
		});

		it('renders a paragraph per p tag', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.paragraphs
			});

			const paragraphs = [...container.querySelectorAll('p')];
			expect(paragraphs.map((el) => el.textContent?.trim())).toEqual([
				'First paragraph',
				'Second paragraph'
			]);
		});

		it('renders an unordered list', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.bullet_list
			});

			const items = [...container.querySelectorAll('ul > li')];
			expect(items.map((el) => el.textContent?.trim())).toEqual(['One', 'Two']);
		});

		it('renders a standalone br', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.line_break
			});

			// The break is an element, so it contributes no text of its own.
			expect(container.querySelectorAll('br')).toHaveLength(1);
			expect(visibleText(container)).toBe('First lineSecond line');
		});
	});

	describe('ordered lists', () => {
		it('applies start, type and reversed', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.numbered_list
			});

			const list = container.querySelector('ol');
			expect(list?.getAttribute('start')).toBe('3');
			expect(list?.getAttribute('type')).toBe('a');
			expect(list?.hasAttribute('reversed')).toBe(true);
		});

		it('applies a list item value as a number', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.numbered_list
			});

			const items = [...container.querySelectorAll('li')];
			expect(items[0]?.getAttribute('value')).toBe('5');
			expect(items[1]?.hasAttribute('value')).toBe(false);
		});

		it('drops invalid attribute values instead of writing them to the DOM', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.invalid_ol
			});

			const list = container.querySelector('ol');
			expect(list).not.toBeNull();
			expect(list?.hasAttribute('start')).toBe(false);
			expect(list?.hasAttribute('type')).toBe(false);
			expect(list?.hasAttribute('reversed')).toBe(false);
			expect(container.querySelector('li')?.hasAttribute('value')).toBe(false);
		});
	});

	describe('links', () => {
		it('leaves an internal link alone without a localizer', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.docs_link
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('/docs');
			expect(anchor?.hasAttribute('target')).toBe(false);
			expect(anchor?.hasAttribute('rel')).toBe(false);
		});

		it('localizes an internal link with the localizeHref prop', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.docs_link,
				localizeHref
			});

			expect(container.querySelector('a')?.getAttribute('href')).toBe('/es/docs');
		});

		it('opens an external link in a new tab and never localizes it', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.external_link,
				localizeHref
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('https://example.com/pricing');
			expect(anchor?.getAttribute('target')).toBe('_blank');
			expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
		});

		it('treats a protocol-relative url as external', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.protocol_relative_link,
				localizeHref
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('//cdn.example.com/asset');
			expect(anchor?.getAttribute('target')).toBe('_blank');
		});

		it('keeps a mailto link in the same tab', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.mail_link,
				localizeHref
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('mailto:hello@example.com');
			expect(anchor?.hasAttribute('target')).toBe(false);
		});

		it('keeps a tel link in the same tab', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.tel_link,
				localizeHref
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('tel:+15550100');
			expect(anchor?.hasAttribute('target')).toBe(false);
		});

		it('honours @newtab and @nofollow', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.newtab_link,
				localizeHref
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('/es/terms');
			expect(anchor?.getAttribute('target')).toBe('_blank');
			expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer nofollow');
		});

		it('honours @external on an internal path', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.forced_external_link,
				localizeHref
			});

			const anchor = container.querySelector('a');
			expect(anchor?.getAttribute('href')).toBe('/partner');
			expect(anchor?.getAttribute('target')).toBe('_blank');
		});

		it('reads the target from the url option', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.url_option_link
			});

			expect(container.querySelector('a')?.getAttribute('href')).toBe('/pricing');
		});
	});

	describe('classes from markup options', () => {
		it('applies a class supplied by the message to a link', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.url_option_link
			});

			expect(container.querySelector('a')?.classList.contains('cta-link')).toBe(true);
		});

		it('applies a class supplied by the message to a span', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.span_with_class
			});

			const span = container.querySelector('span');
			expect(span?.classList.contains('extra-class')).toBe(true);
			expect(span?.textContent?.trim()).toBe('Styled span');
		});

		it('applies a class supplied by the message to a paragraph', async () => {
			const { container } = await render(RenderMessage, {
				variant,
				message: m.paragraphs
			});

			const paragraphs = [...container.querySelectorAll('p')];
			expect(paragraphs[0]?.classList.contains('lead')).toBe(false);
			expect(paragraphs[1]?.classList.contains('lead')).toBe(true);
		});
	});

	describe('custom renderers', () => {
		it('renders a tag the defaults do not know', async () => {
			const { container } = await render(CustomBadge, { variant });

			const badge = container.querySelector('[data-testid="badge"]');
			expect(badge?.textContent?.trim()).toBe('New');
			expect(visibleText(container)).toBe('Status: New');
		});

		it('gives a custom renderer access to markup options', async () => {
			const { container } = await render(CustomBadge, { variant });

			expect(container.querySelector('[data-testid="badge"]')?.getAttribute('data-level')).toBe(
				'new'
			);
		});

		it('replaces a default renderer of the same name', async () => {
			const { container } = await render(OverrideRenderers, { variant });

			expect(container.querySelectorAll('strong')).toHaveLength(0);
			const overridden = [...container.querySelectorAll('[data-testid="custom-strong"]')];
			expect(overridden.map((el) => el.textContent?.trim())).toEqual(['bold', 'alias-bold']);
		});

		it('lets an explicit alias override win over the canonical override', async () => {
			const { container } = await render(OverrideRenderers, {
				variant,
				overrideAlias: true
			});

			expect(container.querySelector('[data-testid="custom-strong"]')?.textContent?.trim()).toBe(
				'bold'
			);
			expect(container.querySelector('[data-testid="custom-alias"]')?.textContent?.trim()).toBe(
				'alias-bold'
			);
		});

		it('overrides an alias on its own, leaving the canonical tag on the default', async () => {
			const { container } = await render(OverrideRenderers, {
				variant,
				aliasOnly: true
			});

			expect(container.querySelector('strong')?.textContent?.trim()).toBe('bold');
			expect(container.querySelector('[data-testid="custom-alias"]')?.textContent?.trim()).toBe(
				'alias-bold'
			);
			expect(container.querySelectorAll('[data-testid="custom-strong"]')).toHaveLength(0);
		});
	});
});

describe('presentation strategy', () => {
	it('scopes the CSS variant styles to the component instead of using utility classes', async () => {
		const { container } = await render(RenderMessage, {
			variant: 'css',
			message: m.inline_styles
		});

		const strong = container.querySelector('strong');
		expect(strong).not.toBeNull();

		// Svelte's scoping class is what makes the component's <style> apply.
		const scoped = [...(strong?.classList ?? [])].filter((name) => name.startsWith('svelte-'));
		expect(scoped).toHaveLength(1);
		expect(getComputedStyle(strong as Element).fontWeight).toBe('600');
	});

	it('gives the CSS variant no Tailwind utility classes', async () => {
		const { container } = await render(RenderMessage, {
			variant: 'css',
			message: m.inline_styles
		});

		for (const element of container.querySelectorAll('*')) {
			for (const name of element.classList) {
				expect(name.startsWith('svelte-')).toBe(true);
			}
		}
	});

	it('styles the Tailwind variant with utility classes', async () => {
		const { container } = await render(RenderMessage, {
			variant: 'tailwind',
			message: m.inline_styles
		});

		expect(container.querySelector('strong')?.classList.contains('font-semibold')).toBe(true);
		expect(container.querySelector('em')?.classList.contains('italic')).toBe(true);
		expect(container.querySelector('code')?.classList.contains('font-mono')).toBe(true);
		expect(
			container
				.querySelector('span[data-i18n-markup="nowrap"]')
				?.classList.contains('whitespace-nowrap')
		).toBe(true);
	});

	it('combines Tailwind utility classes with the class the message supplied', async () => {
		const { container } = await render(RenderMessage, {
			variant: 'tailwind',
			message: m.url_option_link
		});

		const anchor = container.querySelector('a');
		expect(anchor?.classList.contains('underline')).toBe(true);
		expect(anchor?.classList.contains('cta-link')).toBe(true);
	});

	it('omits Tailwind list-decimal when the message asked for another numbering type', async () => {
		const { container } = await render(RenderMessage, {
			variant: 'tailwind',
			message: m.numbered_list
		});

		const list = container.querySelector('ol');
		expect(list?.classList.contains('list-decimal')).toBe(false);
		expect(getComputedStyle(list as Element).listStyleType).toBe('lower-alpha');
	});

	it('keeps the CSS variant numbering type from the message', async () => {
		const { container } = await render(RenderMessage, {
			variant: 'css',
			message: m.numbered_list
		});

		const list = container.querySelector('ol');
		expect(getComputedStyle(list as Element).listStyleType).toBe('lower-alpha');
	});
});

describe('variant equivalence', () => {
	const MESSAGES = [
		['plain text', m.plain_text, undefined],
		['inline styles', m.inline_styles, undefined],
		['internal link', m.docs_link, undefined],
		['external link', m.external_link, undefined],
		['mailto link', m.mail_link, undefined],
		['tel link', m.tel_link, undefined],
		['new tab link', m.newtab_link, undefined],
		['ordered list', m.numbered_list, undefined],
		['invalid ordered list', m.invalid_ol, undefined],
		['bullet list', m.bullet_list, undefined],
		['paragraphs', m.paragraphs, undefined],
		['line break', m.line_break, undefined],
		['nested markup', m.nested_markup, undefined],
		['unknown tag', m.unknown_tag, undefined],
		['span with class', m.span_with_class, undefined],
		['interpolation', m.hello_world, { name: 'Ada' }],
		['markup with input', m.markup_with_input, { name: 'Ada' }]
	] as const;

	it.each(MESSAGES)(
		'produces the same semantic output in both variants for %s',
		async (_name, message, inputs) => {
			const css = await render(RenderMessage, { variant: 'css', message, inputs, localizeHref });
			const tailwind = await render(RenderMessage, {
				variant: 'tailwind',
				message,
				inputs,
				localizeHref
			});

			expect(semanticShape(tailwind.container)).toEqual(semanticShape(css.container));
		}
	);

	it('produces the same semantic output for a custom renderer in both variants', async () => {
		const css = await render(CustomBadge, { variant: 'css' });
		const tailwind = await render(CustomBadge, { variant: 'tailwind' });

		expect(semanticShape(tailwind.container)).toEqual(semanticShape(css.container));
	});
});
