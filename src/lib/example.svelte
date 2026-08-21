<!--
	@component
	Consumer-facing tour of `I18nMarkupMessage`.

	The imports below are relative because this file lives inside the library. In
	an app you would write:

	```ts
	import { I18nMarkupMessage } from 'paraglide-markup-svelte';            // CSS
	import { I18nMarkupMessage } from 'paraglide-markup-svelte/tailwindcss'; // Tailwind
	```

	Both entry points expose the same `I18nMarkupMessage` and the same public
	types. The only difference is how they style what they render.
-->
<script lang="ts" module>
	import { configureI18nMarkup } from './index.js';
	import { localizeHref } from './paraglide/runtime.js';

	/*
		Paraglide generates `localizeHref` into your project, so the library cannot
		import it. Wire it up once, at app startup, and every internal link a
		message renders becomes locale-aware.
	*/
	configureI18nMarkup({ localizeHref });
</script>

<script lang="ts">
	import { I18nMarkupMessage, optionText } from './index.js';
	import { I18nMarkupMessage as TailwindMarkupMessage } from './tailwindcss/index.js';
	import type { I18nMarkupRendererProps } from './index.js';
	import { m } from './paraglide/messages.js';

	let { name = 'Ada' }: { name?: string } = $props();
</script>

<!--
	A custom renderer is just a snippet. `I18nMarkupRendererProps` types its
	children, markup options and markup attributes — no `any` needed.
-->
{#snippet badge({ children, options }: I18nMarkupRendererProps)}
	<span class="badge" data-level={optionText(options.level)}>{@render children?.()}</span>
{/snippet}

<!-- Passing a snippet named after a default tag replaces that default. -->
{#snippet code({ children }: I18nMarkupRendererProps)}
	<code class="shouty">{@render children?.()}</code>
{/snippet}

<article>
	<h2>Default CSS implementation</h2>

	<!-- Plain text: no markup, no inputs. -->
	<p><I18nMarkupMessage message={m.plain_text} /></p>

	<!-- Interpolation: `inputs` is required because the message declares one. -->
	<p><I18nMarkupMessage message={m.hello_world} inputs={{ name }} /></p>

	<!-- Message options are narrowed to the locales the project declares. -->
	<p><I18nMarkupMessage message={m.hello_world} inputs={{ name }} options={{ locale: 'es' }} /></p>

	<!-- Markup: the internal href is localized through `localizeHref`. -->
	<p><I18nMarkupMessage message={m.docs_link} /></p>

	<!-- Interpolation inside markup. -->
	<p><I18nMarkupMessage message={m.markup_with_input} inputs={{ name }} /></p>

	<!-- External links get `target="_blank"` and a safe `rel` automatically. -->
	<p><I18nMarkupMessage message={m.external_link} /></p>

	<!-- `mailto:` and `tel:` stay in the same tab. -->
	<p><I18nMarkupMessage message={m.mail_link} /> · <I18nMarkupMessage message={m.tel_link} /></p>

	<!-- `@newtab` and `@nofollow` are honoured explicitly. -->
	<p><I18nMarkupMessage message={m.newtab_link} /></p>

	<!-- Every inline tag, including the `b`/`i` aliases. -->
	<p><I18nMarkupMessage message={m.inline_styles} /></p>

	<!-- Lists, including `start`, `type` and `@reversed`. -->
	<I18nMarkupMessage message={m.bullet_list} />
	<I18nMarkupMessage message={m.numbered_list} />

	<!-- Paragraphs and a standalone line break. -->
	<I18nMarkupMessage message={m.paragraphs} />
	<p><I18nMarkupMessage message={m.line_break} /></p>

	<!-- A custom renderer adds a tag the defaults do not know. -->
	<p><I18nMarkupMessage message={m.custom_badge} {badge} /></p>

	<!-- An override replaces a default renderer of the same name. -->
	<p><I18nMarkupMessage message={m.inline_styles} {code} /></p>

	<h2>Tailwind implementation</h2>

	<!-- Same props, same behaviour, Tailwind utility classes instead of scoped CSS. -->
	<p><TailwindMarkupMessage message={m.hello_world} inputs={{ name }} /></p>
	<p><TailwindMarkupMessage message={m.docs_link} /></p>
	<p><TailwindMarkupMessage message={m.inline_styles} /></p>
	<p><TailwindMarkupMessage message={m.custom_badge} {badge} /></p>
	<TailwindMarkupMessage message={m.numbered_list} />
</article>

<style>
	article {
		max-width: 44rem;
		font-family: system-ui, sans-serif;
		line-height: 1.6;
	}

	h2 {
		margin-block: 1.5em 0.5em;
		font-size: 1.1rem;
	}

	/* Styles for the custom renderers above — they are the consumer's business. */
	.badge {
		border-radius: 999px;
		background: color-mix(in oklab, currentColor 12%, transparent);
		padding: 0.1em 0.6em;
		font-size: 0.8em;
	}

	.shouty {
		text-transform: uppercase;
	}
</style>
