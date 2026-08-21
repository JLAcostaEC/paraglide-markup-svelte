<!--
	@component
	A custom renderer for a tag the defaults do not know (`{#badge}`), in both
	presentation variants. Reads children and markup options.
-->
<script lang="ts">
	import { I18nMarkupMessage as CssMessage } from '$lib/index.js';
	import { I18nMarkupMessage as TailwindMessage } from '$lib/tailwindcss/index.js';
	import { optionText } from '$lib/index.js';
	import type { I18nMarkupRendererProps } from '$lib/index.js';
	import { m } from '$lib/paraglide/messages.js';

	let { variant }: { variant: 'css' | 'tailwind' } = $props();
</script>

{#snippet badge({ children, options, attributes }: I18nMarkupRendererProps)}
	<span
		data-testid="badge"
		data-level={optionText(options.level)}
		data-flags={Object.keys(attributes).join(',')}
	>
		{@render children?.()}
	</span>
{/snippet}

{#if variant === 'css'}
	<CssMessage message={m.custom_badge} {badge} />
{:else}
	<TailwindMessage message={m.custom_badge} {badge} />
{/if}
