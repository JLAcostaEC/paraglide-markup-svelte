import type { Snippet } from 'svelte';
import type { MessageMarkupSchema, MessageMarkupTag } from '@inlang/paraglide-js';
import type {
	MessageMarkupAttributes,
	MessageMarkupOptions,
	MessageMetadata,
	MessageOptions,
	MessagePart
} from '@inlang/paraglide-js-svelte';
import type { HrefLocalizer } from './link.js';
import type { CanonicalMarkupTag, DefaultMarkupTag } from './renderers.js';

/**
 * Structural upper bound for every message compiled by Paraglide.
 *
 * `MessageLike<any, any, any>` — the bound the Paraglide Svelte adapter uses —
 * is not usable here because it would reintroduce `any`. Substituting `never`
 * or `unknown` for its parameters does not work either: the same parameters
 * appear in a contravariant position (the callable signature) *and* in a
 * covariant one (`MessageMetadata`), so no single substitution satisfies both.
 * This type therefore spells out the shape directly, using `never` for the
 * call parameters and `unknown`/wide types for the metadata payload.
 */
export type ParaglideMessageLike = ((inputs: never, options?: never) => string) & {
	parts?: (inputs: never, options?: never) => MessagePart[];
} & MessageMetadata<unknown, MessageOptions, MessageMarkupSchema>;

/** Type-level metadata the Paraglide compiler attaches to a message. */
type MessageMetadataOf<TMessage extends ParaglideMessageLike> =
	TMessage extends MessageMetadata<infer TInputs, infer TOptions, infer TMarkup>
		? { inputs: TInputs; options: TOptions; markup: TMarkup }
		: never;

/** The `inputs` object a message expects, e.g. `{ name: string }`. */
export type MessageInputsOf<TMessage extends ParaglideMessageLike> =
	MessageMetadataOf<TMessage> extends { inputs: infer TInputs } ? TInputs : Record<string, never>;

type NormalizedMessageOptions<TOptions> = [TOptions] extends [undefined]
	? MessageOptions
	: NonNullable<TOptions> extends MessageOptions
		? NonNullable<TOptions>
		: MessageOptions;

/** The `options` a message accepts, e.g. `{ locale?: 'en' | 'es' }`. */
export type MessageOptionsOf<TMessage extends ParaglideMessageLike> = NormalizedMessageOptions<
	MessageMetadataOf<TMessage> extends { options: infer TOptions } ? TOptions : MessageOptions
>;

type MessageMarkupOf<TMessage extends ParaglideMessageLike> =
	MessageMetadataOf<TMessage> extends { markup: infer TMarkup }
		? TMarkup extends MessageMarkupSchema
			? TMarkup
			: MessageMarkupSchema
		: MessageMarkupSchema;

/**
 * The markup tag names a message actually contains.
 *
 * Resolves to `never` for a message whose schema was widened to the generic
 * `MessageMarkupSchema`, so that a widened message never degrades the props
 * type into a bare `string` index signature.
 */
export type MessageMarkupTagsOf<TMessage extends ParaglideMessageLike> =
	string extends keyof MessageMarkupOf<TMessage> ? never : keyof MessageMarkupOf<TMessage> & string;

/**
 * Props every markup renderer snippet receives.
 *
 * Use this type when writing a custom renderer:
 *
 * ```svelte
 * {#snippet badge({ children, options }: I18nMarkupRendererProps)}
 * 	<span class="badge">{@render children?.()}</span>
 * {/snippet}
 * ```
 */
export type I18nMarkupRendererProps<TTag extends MessageMarkupTag = MessageMarkupTag> = {
	/** Content between the opening and closing tag. Absent for standalone tags. */
	children?: Snippet;
	/** Values passed as `name=|value|` on the tag. */
	options: TTag['options'];
	/** Flags passed as `@name` on the tag. */
	attributes: TTag['attributes'];
	/** The inputs the surrounding message was rendered with. */
	inputs?: Record<string, unknown>;
	/** The options the surrounding message was rendered with. */
	messageOptions?: MessageOptions;
};

/** A snippet that renders one markup tag. */
export type I18nMarkupRenderer<TTag extends MessageMarkupTag = MessageMarkupTag> = Snippet<
	[I18nMarkupRendererProps<TTag>]
>;

/** The complete set of renderers a presentation variant must provide. */
export type CanonicalRendererSet = Readonly<Record<CanonicalMarkupTag, I18nMarkupRenderer>>;

/** Untyped view of the renderer snippets handed to `ParaglideMessage`. */
export type MarkupRendererBag = Readonly<Record<string, unknown>>;

/**
 * Renderer snippets a consumer may pass.
 *
 * Every default tag can be overridden, and every tag the message itself
 * contains can be added, which makes typos and dead renderers a type error.
 */
export type MarkupRendererOverrides<TMessage extends ParaglideMessageLike> = {
	[TTag in DefaultMarkupTag | MessageMarkupTagsOf<TMessage>]?: I18nMarkupRenderer;
};

/** `inputs` is required only when the message declares at least one input. */
type MessageInputsProp<TInputs> = [keyof TInputs] extends [never]
	? { inputs?: TInputs }
	: { inputs: TInputs };

/** Props shared by both presentation variants of `I18nMarkupMessage`. */
export type I18nMarkupMessageProps<TMessage extends ParaglideMessageLike> = {
	/** The message reference itself, not a call: `m.home_title`. */
	message: TMessage;
	/** Message options, e.g. `{ locale: 'es' }`. */
	options?: MessageOptionsOf<TMessage>;
	/** Localizes internal link hrefs. Defaults to the configured localizer. */
	localizeHref?: HrefLocalizer;
} & MessageInputsProp<MessageInputsOf<TMessage>> &
	MarkupRendererOverrides<TMessage>;

/**
 * Props of the shared base component. Presentation is supplied by `renderers`.
 *
 * Spelled out instead of derived with `Omit` from `I18nMarkupMessageProps`:
 * taking `keyof` an intersection that still contains an unresolved renderer key
 * union widens the key set to `string`, which makes every reserved prop look
 * like it might also be a renderer snippet.
 */
export type MarkupMessageBaseProps<TMessage extends ParaglideMessageLike> = {
	/** The message reference itself, not a call: `m.home_title`. */
	message: TMessage;
	/**
	 * Message variables. Always optional here — the public props type is what
	 * makes them required for messages that declare inputs, and a variant
	 * forwards whatever it received.
	 */
	inputs?: MessageInputsOf<TMessage>;
	/** Message options, e.g. `{ locale: 'es' }`. */
	options?: MessageOptionsOf<TMessage>;
	/** The presentation variant's canonical renderer set. */
	renderers: CanonicalRendererSet;
} & MarkupRendererOverrides<TMessage>;

export type { MessageMarkupAttributes, MessageMarkupOptions, MessageOptions, MessageMarkupTag };
