<!--
	@component
	Renders a Paraglide message that contains markup (`{#tag}...{/tag}`), styled
	with Tailwind utility classes.

	Import it from `paraglide-markup-svelte/tailwindcss` and hand it a generated
	message:

	```svelte
	<I18nMarkupMessage message={m.terms_notice} inputs={{ name: 'Ada' }} />
	```

	Tailwind has to scan two places to keep these classes: this package, and your
	message files if they use `class=|...|`.

	```css
	@import 'tailwindcss';
	@source '../node_modules/paraglide-markup-svelte/dist';
	@source '../messages';
	```

	Behaviour lives in `MarkupMessageBase`; this file only supplies presentation.
	For the dependency-free presentation import from `paraglide-markup-svelte`.
-->
<script lang="ts" generics="TMessage extends ParaglideMessageLike">
	import MarkupMessageBase from '../internal/MarkupMessageBase.svelte';
	import { configuredHrefLocalizer } from '../internal/config.js';
	import { anchorAttributes } from '../internal/link.js';
	import {
		listItemValue,
		mergeClasses,
		optionClass,
		orderedListAttributes
	} from '../internal/markup.js';
	import type {
		I18nMarkupMessageProps,
		I18nMarkupRendererProps,
		MessageInputsOf,
		ParaglideMessageLike
	} from '../internal/types.js';

	let {
		message,
		inputs,
		options,
		localizeHref,
		...overrides
	}: I18nMarkupMessageProps<TMessage> & { inputs?: MessageInputsOf<TMessage> } = $props();

	const localizer = $derived(localizeHref ?? configuredHrefLocalizer());

	/*
		Utility classes are kept as plain string literals so Tailwind's source
		scanner finds them, and are combined with the consumer's `class=|...|`
		option at render time.
	*/
	const LIST = 'my-2 space-y-1 ps-5 marker:text-neutral-400 dark:marker:text-neutral-500';
</script>

{#snippet link({ children, options, attributes }: I18nMarkupRendererProps)}
	{@const anchor = anchorAttributes({ options, attributes, localizeHref: localizer })}
	<a
		href={anchor.href}
		target={anchor.target}
		rel={anchor.rel}
		class={mergeClasses(
			'underline decoration-from-font underline-offset-4 transition-colors hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:hover:text-sky-300',
			optionClass(options)
		)}
	>
		{@render children?.()}
	</a>
{/snippet}

{#snippet strong({ children, options }: I18nMarkupRendererProps)}
	<strong class={mergeClasses('font-semibold', optionClass(options))}>
		{@render children?.()}
	</strong>
{/snippet}

{#snippet em({ children, options }: I18nMarkupRendererProps)}
	<em class={mergeClasses('italic', optionClass(options))}>{@render children?.()}</em>
{/snippet}

{#snippet u({ children, options }: I18nMarkupRendererProps)}
	<u class={mergeClasses('underline underline-offset-4', optionClass(options))}>
		{@render children?.()}
	</u>
{/snippet}

{#snippet s({ children, options }: I18nMarkupRendererProps)}
	<s class={mergeClasses('line-through', optionClass(options))}>{@render children?.()}</s>
{/snippet}

{#snippet mark({ children, options }: I18nMarkupRendererProps)}
	<mark
		class={mergeClasses(
			'rounded bg-yellow-200/60 px-1 text-inherit dark:bg-yellow-400/25',
			optionClass(options)
		)}
	>
		{@render children?.()}
	</mark>
{/snippet}

{#snippet code({ children, options }: I18nMarkupRendererProps)}
	<code
		class={mergeClasses(
			'rounded bg-neutral-200/60 px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-neutral-700/60',
			optionClass(options)
		)}
	>
		{@render children?.()}
	</code>
{/snippet}

{#snippet small({ children, options }: I18nMarkupRendererProps)}
	<small class={mergeClasses('text-[0.85em]', optionClass(options))}>
		{@render children?.()}
	</small>
{/snippet}

{#snippet sup({ children, options }: I18nMarkupRendererProps)}
	<sup class={optionClass(options)}>{@render children?.()}</sup>
{/snippet}

{#snippet sub({ children, options }: I18nMarkupRendererProps)}
	<sub class={optionClass(options)}>{@render children?.()}</sub>
{/snippet}

{#snippet muted({ children, options }: I18nMarkupRendererProps)}
	<span
		data-i18n-markup="muted"
		class={mergeClasses('text-neutral-500 dark:text-neutral-400', optionClass(options))}
	>
		{@render children?.()}
	</span>
{/snippet}

{#snippet nowrap({ children, options }: I18nMarkupRendererProps)}
	<span data-i18n-markup="nowrap" class={mergeClasses('whitespace-nowrap', optionClass(options))}>
		{@render children?.()}
	</span>
{/snippet}

{#snippet span({ children, options }: I18nMarkupRendererProps)}
	<span class={optionClass(options)}>{@render children?.()}</span>
{/snippet}

{#snippet p({ children, options }: I18nMarkupRendererProps)}
	<p class={mergeClasses('my-2', optionClass(options))}>{@render children?.()}</p>
{/snippet}

{#snippet ul({ children, options }: I18nMarkupRendererProps)}
	<ul class={mergeClasses('list-disc', LIST, optionClass(options))}>{@render children?.()}</ul>
{/snippet}

{#snippet ol({ children, options, attributes }: I18nMarkupRendererProps)}
	{@const list = orderedListAttributes(options, attributes)}
	<ol
		start={list.start}
		type={list.type}
		reversed={list.reversed}
		class={mergeClasses(
			list.type === undefined ? 'list-decimal' : undefined,
			LIST,
			optionClass(options)
		)}
	>
		{@render children?.()}
	</ol>
{/snippet}

{#snippet li({ children, options }: I18nMarkupRendererProps)}
	<li value={listItemValue(options)} class={mergeClasses('ps-1', optionClass(options))}>
		{@render children?.()}
	</li>
{/snippet}

{#snippet br()}
	<br />
{/snippet}

<MarkupMessageBase
	{message}
	{inputs}
	{options}
	renderers={{
		link,
		strong,
		em,
		u,
		s,
		mark,
		code,
		small,
		sup,
		sub,
		muted,
		nowrap,
		span,
		p,
		ul,
		ol,
		li,
		br
	}}
	{...overrides}
/>
