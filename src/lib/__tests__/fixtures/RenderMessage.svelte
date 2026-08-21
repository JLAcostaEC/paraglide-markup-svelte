<!--
	@component
	Renders one message through both presentation variants so a single test can
	assert that they behave identically.
-->
<script lang="ts">
	import { I18nMarkupMessage as CssMessage } from '$lib/index.js';
	import { I18nMarkupMessage as TailwindMessage } from '$lib/tailwindcss/index.js';
	import type { HrefLocalizer, MessageOptions, ParaglideMessageLike } from '$lib/index.js';

	type Props = {
		variant: 'css' | 'tailwind';
		message: ParaglideMessageLike;
		inputs?: Record<string, unknown>;
		options?: MessageOptions;
		localizeHref?: HrefLocalizer;
	};

	let { variant, message, inputs, options, localizeHref }: Props = $props();
</script>

{#if variant === 'css'}
	<CssMessage {message} {inputs} {options} {localizeHref} />
{:else}
	<TailwindMessage {message} {inputs} {options} {localizeHref} />
{/if}
