import { describe, expect, it } from 'vitest';
import { anchorAttributes, FALLBACK_HREF, hrefKind, isExternalHref, linkHref } from '$lib/index.js';
import type { HrefLocalizer } from '$lib/index.js';

/** Stands in for Paraglide's generated `localizeHref`. */
const localizeHref: HrefLocalizer = (href) => `/es${href}`;

describe('hrefKind', () => {
	it('classifies app paths as internal', () => {
		expect(hrefKind('/about')).toBe('internal');
		expect(hrefKind('docs/intro')).toBe('internal');
	});

	it('classifies same-document targets as anchors', () => {
		expect(hrefKind('#section')).toBe('anchor');
		expect(hrefKind('?page=2')).toBe('anchor');
	});

	it('classifies other origins and schemes as external', () => {
		expect(hrefKind('https://example.com')).toBe('external');
		expect(hrefKind('HTTP://example.com')).toBe('external');
		expect(hrefKind('//cdn.example.com/asset')).toBe('external');
		expect(hrefKind('ftp://files.example.com')).toBe('external');
	});

	it('classifies mailto and tel separately', () => {
		expect(hrefKind('mailto:hello@example.com')).toBe('mailto');
		expect(hrefKind('MAILTO:hello@example.com')).toBe('mailto');
		expect(hrefKind('tel:+15550100')).toBe('tel');
		expect(hrefKind('sms:+15550100')).toBe('tel');
	});
});

describe('isExternalHref', () => {
	it('is true for anything that leaves the app', () => {
		expect(isExternalHref('https://example.com')).toBe(true);
		expect(isExternalHref('mailto:hello@example.com')).toBe(true);
		expect(isExternalHref('tel:+15550100')).toBe(true);
	});

	it('is false for app paths and same-document targets', () => {
		expect(isExternalHref('/about')).toBe(false);
		expect(isExternalHref('#top')).toBe(false);
	});
});

describe('linkHref', () => {
	it('reads href, to or url', () => {
		expect(linkHref({ href: '/a' })).toBe('/a');
		expect(linkHref({ to: '/b' })).toBe('/b');
		expect(linkHref({ url: '/c' })).toBe('/c');
	});

	it('prefers href, then to, then url', () => {
		expect(linkHref({ href: '/a', to: '/b', url: '/c' })).toBe('/a');
		expect(linkHref({ to: '/b', url: '/c' })).toBe('/b');
	});

	it('falls back when no usable target was given', () => {
		expect(linkHref({})).toBe(FALLBACK_HREF);
		expect(linkHref({ href: true })).toBe(FALLBACK_HREF);
	});
});

describe('anchorAttributes', () => {
	it('localizes internal paths and stays in the same tab', () => {
		expect(anchorAttributes({ options: { to: '/docs' }, attributes: {}, localizeHref })).toEqual({
			href: '/es/docs',
			target: undefined,
			rel: undefined
		});
	});

	it('leaves internal paths alone when no localizer is configured', () => {
		expect(anchorAttributes({ options: { to: '/docs' }, attributes: {} })).toEqual({
			href: '/docs',
			target: undefined,
			rel: undefined
		});
	});

	it('never localizes same-document targets', () => {
		expect(anchorAttributes({ options: { href: '#top' }, attributes: {}, localizeHref })).toEqual({
			href: '#top',
			target: undefined,
			rel: undefined
		});
	});

	it('opens external links in a new tab with a safe rel', () => {
		expect(
			anchorAttributes({
				options: { href: 'https://example.com/pricing' },
				attributes: {},
				localizeHref
			})
		).toEqual({
			href: 'https://example.com/pricing',
			target: '_blank',
			rel: 'noopener noreferrer'
		});
	});

	it('treats protocol-relative urls as external', () => {
		expect(
			anchorAttributes({ options: { href: '//cdn.example.com/a' }, attributes: {}, localizeHref })
		).toEqual({
			href: '//cdn.example.com/a',
			target: '_blank',
			rel: 'noopener noreferrer'
		});
	});

	it('keeps mailto links in the same tab', () => {
		expect(
			anchorAttributes({
				options: { href: 'mailto:hello@example.com' },
				attributes: {},
				localizeHref
			})
		).toEqual({
			href: 'mailto:hello@example.com',
			target: undefined,
			rel: undefined
		});
	});

	it('keeps tel links in the same tab', () => {
		expect(
			anchorAttributes({ options: { href: 'tel:+15550100' }, attributes: {}, localizeHref })
		).toEqual({
			href: 'tel:+15550100',
			target: undefined,
			rel: undefined
		});
	});

	it('honours @external on an internal-looking path', () => {
		expect(
			anchorAttributes({
				options: { href: '/partner' },
				attributes: { external: true },
				localizeHref
			})
		).toEqual({
			href: '/partner',
			target: '_blank',
			rel: 'noopener noreferrer'
		});
	});

	it('honours @newtab on an internal path without dropping localization', () => {
		expect(
			anchorAttributes({ options: { to: '/terms' }, attributes: { newtab: true }, localizeHref })
		).toEqual({
			href: '/es/terms',
			target: '_blank',
			rel: 'noopener noreferrer'
		});
	});

	it('adds nofollow alongside the new-tab rel', () => {
		expect(
			anchorAttributes({
				options: { href: '/terms' },
				attributes: { newtab: true, nofollow: true },
				localizeHref
			})
		).toEqual({
			href: '/es/terms',
			target: '_blank',
			rel: 'noopener noreferrer nofollow'
		});
	});

	it('adds nofollow on its own', () => {
		expect(
			anchorAttributes({ options: { href: '/terms' }, attributes: { nofollow: true } })
		).toEqual({
			href: '/terms',
			target: undefined,
			rel: 'nofollow'
		});
	});

	it('falls back to # when the message gave no target, without localizing it', () => {
		expect(anchorAttributes({ options: {}, attributes: {}, localizeHref })).toEqual({
			href: FALLBACK_HREF,
			target: undefined,
			rel: undefined
		});
	});
});
