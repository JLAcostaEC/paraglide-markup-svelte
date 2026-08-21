<!--
	@component
	Ordinary consumer usage of both entry points, with no casts anywhere.

	This file is a type test as much as a render test: if any of the usages below
	needed `as any`, a cast or a widened message type, `svelte-check` would fail.
-->
<script lang="ts">
	import { I18nMarkupMessage } from '$lib/index.js';
	import { I18nMarkupMessage as TailwindMarkupMessage } from '$lib/tailwindcss/index.js';
	import { optionText } from '$lib/index.js';
	import type { I18nMarkupRendererProps } from '$lib/index.js';
	import { m } from '$lib/paraglide/messages.js';
</script>

{#snippet badge({ children, options }: I18nMarkupRendererProps)}
	<span data-level={optionText(options.level)}>{@render children?.()}</span>
{/snippet}

{#snippet strong({ children }: I18nMarkupRendererProps)}
	<b>{@render children?.()}</b>
{/snippet}

<section data-testid="css-usage">
	<!-- A message with neither inputs nor markup. -->
	<I18nMarkupMessage message={m.plain_text} />

	<!-- Inputs are required, and typed against the message. -->
	<I18nMarkupMessage message={m.hello_world} inputs={{ name: 'Ada' }} />

	<!-- Options are narrowed to the project's locales. -->
	<I18nMarkupMessage message={m.hello_world} inputs={{ name: 'Ada' }} options={{ locale: 'es' }} />

	<!-- Markup only. -->
	<I18nMarkupMessage message={m.docs_link} />

	<!-- Inputs combined with markup. -->
	<I18nMarkupMessage message={m.markup_with_input} inputs={{ name: 'Ada' }} />

	<!-- A custom renderer for a tag the defaults do not know. -->
	<I18nMarkupMessage message={m.custom_badge} {badge} />

	<!-- An override of a default renderer. -->
	<I18nMarkupMessage message={m.greeting_rich} inputs={{ name: 'Ada' }} {strong} />
</section>

<section data-testid="tailwind-usage">
	<TailwindMarkupMessage message={m.plain_text} />
	<TailwindMarkupMessage message={m.hello_world} inputs={{ name: 'Ada' }} />
	<TailwindMarkupMessage message={m.docs_link} />
	<TailwindMarkupMessage message={m.custom_badge} {badge} />
	<TailwindMarkupMessage message={m.greeting_rich} inputs={{ name: 'Ada' }} {strong} />
</section>
