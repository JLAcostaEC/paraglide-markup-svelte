<!--
	@component
	Overrides a default renderer, optionally also overriding its alias, so tests
	can pin down how overrides and aliases interact.
-->
<script lang="ts">
	import { I18nMarkupMessage as CssMessage } from '$lib/index.js';
	import { I18nMarkupMessage as TailwindMessage } from '$lib/tailwindcss/index.js';
	import type { I18nMarkupRendererProps } from '$lib/index.js';
	import { m } from '$lib/paraglide/messages.js';

	type Props = {
		variant: 'css' | 'tailwind';
		/** Also override `b`, the alias of `strong`. */
		overrideAlias?: boolean;
		/** Override only `b`, leaving `strong` on the default renderer. */
		aliasOnly?: boolean;
	};

	let { variant, overrideAlias = false, aliasOnly = false }: Props = $props();
</script>

{#snippet customStrong({ children }: I18nMarkupRendererProps)}
	<span data-testid="custom-strong">{@render children?.()}</span>
{/snippet}

{#snippet customAlias({ children }: I18nMarkupRendererProps)}
	<span data-testid="custom-alias">{@render children?.()}</span>
{/snippet}

{#if variant === 'css'}
	<CssMessage
		message={m.inline_styles}
		strong={aliasOnly ? undefined : customStrong}
		b={overrideAlias || aliasOnly ? customAlias : undefined}
	/>
{:else}
	<TailwindMessage
		message={m.inline_styles}
		strong={aliasOnly ? undefined : customStrong}
		b={overrideAlias || aliasOnly ? customAlias : undefined}
	/>
{/if}
