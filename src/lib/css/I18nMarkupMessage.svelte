<!--
	@component
	Renders a Paraglide message that contains markup (`{#tag}...{/tag}`), styled
	with component-scoped Svelte CSS. No stylesheet import and no Tailwind needed.

	Import it from `paraglide-markup-svelte` and hand it a generated message:

	```svelte
	<I18nMarkupMessage message={m.terms_notice} inputs={{ name: 'Ada' }} />
	```

	Behaviour lives in `MarkupMessageBase`; this file only supplies presentation.
	For the Tailwind presentation import from `paraglide-markup-svelte/tailwindcss`.
-->
<script lang="ts" generics="TMessage extends ParaglideMessageLike">
	import MarkupMessageBase from '../internal/MarkupMessageBase.svelte';
	import { configuredHrefLocalizer } from '../internal/config.js';
	import { anchorAttributes } from '../internal/link.js';
	import { listItemValue, optionClass, orderedListAttributes } from '../internal/markup.js';
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
</script>

{#snippet link({ children, options, attributes }: I18nMarkupRendererProps)}
	{@const anchor = anchorAttributes({ options, attributes, localizeHref: localizer })}
	<a href={anchor.href} target={anchor.target} rel={anchor.rel} class={optionClass(options)}>
		{@render children?.()}
	</a>
{/snippet}

{#snippet strong({ children, options }: I18nMarkupRendererProps)}
	<strong class={optionClass(options)}>{@render children?.()}</strong>
{/snippet}

{#snippet em({ children, options }: I18nMarkupRendererProps)}
	<em class={optionClass(options)}>{@render children?.()}</em>
{/snippet}

{#snippet u({ children, options }: I18nMarkupRendererProps)}
	<u class={optionClass(options)}>{@render children?.()}</u>
{/snippet}

{#snippet s({ children, options }: I18nMarkupRendererProps)}
	<s class={optionClass(options)}>{@render children?.()}</s>
{/snippet}

{#snippet mark({ children, options }: I18nMarkupRendererProps)}
	<mark class={optionClass(options)}>{@render children?.()}</mark>
{/snippet}

{#snippet code({ children, options }: I18nMarkupRendererProps)}
	<code class={optionClass(options)}>{@render children?.()}</code>
{/snippet}

{#snippet small({ children, options }: I18nMarkupRendererProps)}
	<small class={optionClass(options)}>{@render children?.()}</small>
{/snippet}

{#snippet sup({ children, options }: I18nMarkupRendererProps)}
	<sup class={optionClass(options)}>{@render children?.()}</sup>
{/snippet}

{#snippet sub({ children, options }: I18nMarkupRendererProps)}
	<sub class={optionClass(options)}>{@render children?.()}</sub>
{/snippet}

{#snippet muted({ children, options }: I18nMarkupRendererProps)}
	<span data-i18n-markup="muted" class={optionClass(options)}>{@render children?.()}</span>
{/snippet}

{#snippet nowrap({ children, options }: I18nMarkupRendererProps)}
	<span data-i18n-markup="nowrap" class={optionClass(options)}>{@render children?.()}</span>
{/snippet}

{#snippet span({ children, options }: I18nMarkupRendererProps)}
	<span class={optionClass(options)}>{@render children?.()}</span>
{/snippet}

{#snippet p({ children, options }: I18nMarkupRendererProps)}
	<p class={optionClass(options)}>{@render children?.()}</p>
{/snippet}

{#snippet ul({ children, options }: I18nMarkupRendererProps)}
	<ul class={optionClass(options)}>{@render children?.()}</ul>
{/snippet}

{#snippet ol({ children, options, attributes }: I18nMarkupRendererProps)}
	{@const list = orderedListAttributes(options, attributes)}
	<ol start={list.start} type={list.type} reversed={list.reversed} class={optionClass(options)}>
		{@render children?.()}
	</ol>
{/snippet}

{#snippet li({ children, options }: I18nMarkupRendererProps)}
	<li value={listItemValue(options)} class={optionClass(options)}>{@render children?.()}</li>
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

<style>
	/*
		Scoped to this component: the selectors below only ever match the elements
		the renderers above produce, so a message never restyles the host app and
		the host app needs no stylesheet import.
	*/
	a {
		color: inherit;
		text-decoration-line: underline;
		text-decoration-thickness: from-font;
		text-underline-offset: 0.25em;
		transition: opacity 150ms ease;
	}

	a:hover {
		opacity: 0.75;
	}

	a:focus-visible {
		border-radius: 0.125rem;
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	strong {
		font-weight: 600;
	}

	em {
		font-style: italic;
	}

	u {
		text-decoration-line: underline;
		text-underline-offset: 0.25em;
	}

	s {
		text-decoration-line: line-through;
	}

	mark {
		border-radius: 0.25rem;
		background-color: color-mix(in oklab, currentColor 18%, transparent);
		padding-inline: 0.25rem;
		color: inherit;
	}

	code {
		border-radius: 0.25rem;
		background-color: color-mix(in oklab, currentColor 10%, transparent);
		padding: 0.125rem 0.375rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.9em;
	}

	small {
		font-size: 0.85em;
	}

	/* Keep super/subscripts from stretching the line they sit on. */
	sup,
	sub {
		position: relative;
		vertical-align: baseline;
		font-size: 0.75em;
		line-height: 0;
	}

	sup {
		top: -0.5em;
	}

	sub {
		bottom: -0.25em;
	}

	[data-i18n-markup='muted'] {
		color: color-mix(in oklab, currentColor 65%, transparent);
	}

	[data-i18n-markup='nowrap'] {
		white-space: nowrap;
	}

	p {
		margin-block: 0.75em;
	}

	p:first-child {
		margin-block-start: 0;
	}

	p:last-child {
		margin-block-end: 0;
	}

	ul,
	ol {
		margin-block: 0.75em;
		padding-inline-start: 1.25rem;
	}

	ul {
		list-style-type: disc;
	}

	/*
		Only supply a numbering style when the message did not ask for one —
		author CSS outranks the `type` attribute, so `{#ol type=|a|}` would
		otherwise silently render as decimal.
	*/
	ol:not([type]) {
		list-style-type: decimal;
	}

	li {
		padding-inline-start: 0.25rem;
	}

	li::marker {
		color: color-mix(in oklab, currentColor 55%, transparent);
	}
</style>
