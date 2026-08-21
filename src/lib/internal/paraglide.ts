import type { Component } from 'svelte';
import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
import type { MarkupRendererBag, MessageOptions, ParaglideMessageLike } from './types.js';

/**
 * Props accepted by the untyped view of `ParaglideMessage` below.
 *
 * The renderer snippets have to be spread as individual props, so the tag names
 * cannot be enumerated at this boundary.
 */
type UntypedParaglideMessageProps = {
	message: ParaglideMessageLike;
	inputs: Record<string, unknown>;
	options?: MessageOptions;
} & MarkupRendererBag;

/**
 * `ParaglideMessage` with its markup props widened — the library's single type
 * assertion.
 *
 * `MessageProps<TMessage>` derives one **required** renderer prop per markup tag
 * that a specific message contains, typed against that message's own schema,
 * and rejects every other prop (a message without markup accepts
 * `Record<string, never>`). A wrapper that always supplies the same renderer set
 * is therefore unrepresentable in those types: passing all default renderers to
 * `m.plain_text` is an excess-property error, and passing the generic renderer
 * signature to `m.docs_link` mismatches its narrowed option types.
 *
 * Widening here keeps the assertion in one place. `I18nMarkupMessage` stays
 * fully typed against the real `MessageProps` machinery, so consumers still get
 * per-message `inputs`, `options` and tag-name checking.
 */
export const UntypedParaglideMessage = ParaglideMessage as unknown as Component<
	UntypedParaglideMessageProps,
	Record<string, never>
>;
