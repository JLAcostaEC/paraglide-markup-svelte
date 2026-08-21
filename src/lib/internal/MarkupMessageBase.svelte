<!--
	@component
	Shared, presentation-agnostic implementation behind `I18nMarkupMessage`.

	Owns everything that does not depend on styling: the Paraglide integration,
	message inputs and options, alias expansion, override merging and renderer
	resolution. The `renderers` prop supplies the presentation.

	Internal — consumers import `I18nMarkupMessage` from `paraglide-markup-svelte`
	or `paraglide-markup-svelte/tailwindcss` instead.
-->
<script lang="ts" generics="TMessage extends ParaglideMessageLike">
	import { UntypedParaglideMessage } from './paraglide.js';
	import { resolveRenderers } from './renderers.js';
	import type { MarkupMessageBaseProps, ParaglideMessageLike } from './types.js';

	let { message, inputs, options, renderers, ...overrides }: MarkupMessageBaseProps<TMessage> =
		$props();

	const resolved = $derived(resolveRenderers(renderers, overrides));
	const messageInputs = $derived(inputs ?? {});
</script>

<UntypedParaglideMessage {message} inputs={messageInputs} {options} {...resolved} />
