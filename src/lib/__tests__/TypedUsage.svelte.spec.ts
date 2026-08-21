import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TypedUsage from './fixtures/TypedUsage.svelte';

/**
 * `TypedUsage.svelte` is checked by `svelte-check` for the absence of casts.
 * Rendering it here keeps those usages honest at runtime too.
 */
describe('ordinary consumer usage', () => {
	it('renders every documented shape through the root entry point', async () => {
		const { container } = await render(TypedUsage);
		const section = container.querySelector('[data-testid="css-usage"]');
		const text = (section?.textContent ?? '').replace(/\s+/g, ' ').trim();

		expect(text).toContain('Plain text without markup.');
		expect(text).toContain('Hello, Ada from en!');
		expect(text).toContain('Hola, Ada desde es!');
		expect(text).toContain('Read the docs');
		expect(text).toContain("Ada's profile");
		expect(text).toContain('New');
		expect(section?.querySelector('a[href="/docs"]')).not.toBeNull();
		expect(section?.querySelector('[data-level="new"]')?.textContent?.trim()).toBe('New');
	});

	it('renders the same shapes through the tailwindcss entry point', async () => {
		const { container } = await render(TypedUsage);
		const section = container.querySelector('[data-testid="tailwind-usage"]');
		const text = (section?.textContent ?? '').replace(/\s+/g, ' ').trim();

		expect(text).toContain('Plain text without markup.');
		expect(text).toContain('Hello, Ada from en!');
		expect(text).toContain('Read the docs');
		expect(section?.querySelector('a[href="/docs"]')?.classList.contains('underline')).toBe(true);
		expect(section?.querySelector('[data-level="new"]')?.textContent?.trim()).toBe('New');
	});

	it('applies an overriding renderer at both entry points', async () => {
		const { container } = await render(TypedUsage);

		// `strong` was overridden with a snippet that renders <b>.
		expect(container.querySelectorAll('b')).toHaveLength(2);
		expect(container.querySelectorAll('strong')).toHaveLength(0);
	});
});
