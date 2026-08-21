import { describe, expectTypeOf, it } from 'vitest';
import type { Snippet } from 'svelte';
import { m } from '$lib/paraglide/messages.js';
import type {
	I18nMarkupMessageProps,
	I18nMarkupRenderer,
	I18nMarkupRendererProps,
	MessageInputsOf,
	MessageMarkupAttributes,
	MessageMarkupOptions,
	MessageMarkupTagsOf,
	MessageOptionsOf,
	ParaglideMessageLike
} from '$lib/index.js';
import type {
	I18nMarkupMessageProps as TailwindMessageProps,
	I18nMarkupRenderer as TailwindRenderer,
	I18nMarkupRendererProps as TailwindRendererProps
} from '$lib/tailwindcss/index.js';

/** True when `K` may be left out of `T`. */
type IsOptional<T, K extends keyof T> = Record<never, never> extends Pick<T, K> ? true : false;

type HelloProps = I18nMarkupMessageProps<typeof m.hello_world>;
type DocsLinkProps = I18nMarkupMessageProps<typeof m.docs_link>;
type BadgeProps = I18nMarkupMessageProps<typeof m.custom_badge>;
type PlainProps = I18nMarkupMessageProps<typeof m.plain_text>;

describe('generated messages', () => {
	it('satisfy the message bound without any', () => {
		expectTypeOf(m.plain_text).toExtend<ParaglideMessageLike>();
		expectTypeOf(m.hello_world).toExtend<ParaglideMessageLike>();
		expectTypeOf(m.docs_link).toExtend<ParaglideMessageLike>();
		expectTypeOf(m.numbered_list).toExtend<ParaglideMessageLike>();
		expectTypeOf(m.custom_badge).toExtend<ParaglideMessageLike>();
		expectTypeOf(m.markup_with_input).toExtend<ParaglideMessageLike>();
	});

	it('can be passed as the message prop with no cast', () => {
		expectTypeOf(m.hello_world).toExtend<HelloProps['message']>();
		expectTypeOf(m.docs_link).toExtend<DocsLinkProps['message']>();
		expectTypeOf(m.plain_text).toExtend<PlainProps['message']>();
	});
});

describe('message inputs', () => {
	it('keep the shape the compiler generated', () => {
		expectTypeOf<MessageInputsOf<typeof m.hello_world>>().toEqualTypeOf<{
			name: NonNullable<unknown>;
		}>();
		expectTypeOf<MessageInputsOf<typeof m.markup_with_input>>().toEqualTypeOf<{
			name: NonNullable<unknown>;
		}>();
	});

	it('are empty for a message that declares none', () => {
		expectTypeOf<keyof MessageInputsOf<typeof m.docs_link>>().toBeNever();
		expectTypeOf<keyof MessageInputsOf<typeof m.plain_text>>().toBeNever();
	});

	it('are required only when the message declares them', () => {
		expectTypeOf<IsOptional<HelloProps, 'inputs'>>().toEqualTypeOf<false>();
		expectTypeOf<IsOptional<DocsLinkProps, 'inputs'>>().toEqualTypeOf<true>();
		expectTypeOf<IsOptional<PlainProps, 'inputs'>>().toEqualTypeOf<true>();
	});

	it('type the inputs prop against the message', () => {
		expectTypeOf<HelloProps['inputs']>().toEqualTypeOf<{ name: NonNullable<unknown> }>();
	});

	it('reject an input the message does not declare', () => {
		const inputs: HelloProps['inputs'] = {
			name: 'Ada',
			// @ts-expect-error `surname` is not an input of `hello_world`
			surname: 'Lovelace'
		};
		expectTypeOf(inputs).toExtend<{ name: NonNullable<unknown> }>();
	});
});

describe('message options', () => {
	it('narrow to the locales the project declares', () => {
		expectTypeOf<MessageOptionsOf<typeof m.hello_world>>().toEqualTypeOf<{
			locale?: 'en' | 'es';
		}>();
		expectTypeOf<DocsLinkProps['options']>().toEqualTypeOf<{ locale?: 'en' | 'es' } | undefined>();
	});

	it('are always optional', () => {
		expectTypeOf<IsOptional<HelloProps, 'options'>>().toEqualTypeOf<true>();
	});

	it('reject a locale the project does not declare', () => {
		// @ts-expect-error `de` is not one of the project locales
		const options: DocsLinkProps['options'] = { locale: 'de' };
		expectTypeOf(options).toExtend<{ locale?: 'en' | 'es' } | undefined>();
	});
});

describe('markup tag names', () => {
	it('come from the message schema', () => {
		expectTypeOf<MessageMarkupTagsOf<typeof m.docs_link>>().toEqualTypeOf<'link'>();
		expectTypeOf<MessageMarkupTagsOf<typeof m.custom_badge>>().toEqualTypeOf<'badge'>();
		expectTypeOf<MessageMarkupTagsOf<typeof m.bullet_list>>().toEqualTypeOf<'li' | 'ul'>();
	});

	it('are empty for a message without markup', () => {
		expectTypeOf<MessageMarkupTagsOf<typeof m.plain_text>>().toBeNever();
	});

	it('do not widen to string for a message whose schema was widened', () => {
		expectTypeOf<MessageMarkupTagsOf<ParaglideMessageLike>>().toBeNever();
	});
});

describe('renderer props', () => {
	it('expose children, options and attributes', () => {
		expectTypeOf<I18nMarkupRendererProps['children']>().toEqualTypeOf<Snippet | undefined>();
		expectTypeOf<I18nMarkupRendererProps['options']>().toEqualTypeOf<MessageMarkupOptions>();
		expectTypeOf<I18nMarkupRendererProps['attributes']>().toEqualTypeOf<MessageMarkupAttributes>();
	});

	it('describe a renderer as a snippet of those props', () => {
		expectTypeOf<I18nMarkupRenderer>().toEqualTypeOf<Snippet<[I18nMarkupRendererProps]>>();
	});

	it('are what a custom renderer snippet receives', () => {
		const badge: I18nMarkupRenderer = (() => {}) as unknown as I18nMarkupRenderer;
		expectTypeOf(badge).toExtend<BadgeProps['badge']>();
		expectTypeOf<BadgeProps['badge']>().toEqualTypeOf<I18nMarkupRenderer | undefined>();
	});
});

describe('renderer overrides', () => {
	it('accept every default tag', () => {
		expectTypeOf<PlainProps['strong']>().toEqualTypeOf<I18nMarkupRenderer | undefined>();
		expectTypeOf<PlainProps['link']>().toEqualTypeOf<I18nMarkupRenderer | undefined>();
		expectTypeOf<PlainProps['br']>().toEqualTypeOf<I18nMarkupRenderer | undefined>();
	});

	it('accept aliases as their own override slot', () => {
		expectTypeOf<PlainProps['a']>().toEqualTypeOf<I18nMarkupRenderer | undefined>();
		expectTypeOf<PlainProps['b']>().toEqualTypeOf<I18nMarkupRenderer | undefined>();
		expectTypeOf<PlainProps['i']>().toEqualTypeOf<I18nMarkupRenderer | undefined>();
	});

	it('are always optional', () => {
		expectTypeOf<IsOptional<BadgeProps, 'badge'>>().toEqualTypeOf<true>();
		expectTypeOf<IsOptional<PlainProps, 'strong'>>().toEqualTypeOf<true>();
	});

	it('reject a renderer that is not a snippet', () => {
		// @ts-expect-error a renderer has to be a snippet
		const renderer: BadgeProps['badge'] = 'not-a-snippet';
		expectTypeOf(renderer).toExtend<I18nMarkupRenderer | undefined>();
	});

	it('reject a tag that is neither a default nor present in the message', () => {
		const props: PlainProps = {
			message: m.plain_text,
			// @ts-expect-error `badge` does not appear in `plain_text`
			badge: undefined
		};
		expectTypeOf(props).toExtend<PlainProps>();
	});
});

describe('public types', () => {
	it('are identical at both entry points', () => {
		expectTypeOf<TailwindRendererProps>().toEqualTypeOf<I18nMarkupRendererProps>();
		expectTypeOf<TailwindRenderer>().toEqualTypeOf<I18nMarkupRenderer>();
		expectTypeOf<TailwindMessageProps<typeof m.docs_link>>().toEqualTypeOf<DocsLinkProps>();
		expectTypeOf<TailwindMessageProps<typeof m.hello_world>>().toEqualTypeOf<HelloProps>();
	});
});

describe('the public API', () => {
	it('does not resolve to any', () => {
		expectTypeOf<ParaglideMessageLike>().not.toBeAny();
		expectTypeOf<I18nMarkupRenderer>().not.toBeAny();
		expectTypeOf<I18nMarkupRendererProps>().not.toBeAny();
		expectTypeOf<I18nMarkupRendererProps['options']>().not.toBeAny();
		expectTypeOf<I18nMarkupRendererProps['attributes']>().not.toBeAny();
		expectTypeOf<I18nMarkupRendererProps['children']>().not.toBeAny();
		expectTypeOf<HelloProps>().not.toBeAny();
		expectTypeOf<HelloProps['message']>().not.toBeAny();
		expectTypeOf<HelloProps['inputs']>().not.toBeAny();
		expectTypeOf<HelloProps['options']>().not.toBeAny();
		expectTypeOf<BadgeProps['badge']>().not.toBeAny();
		expectTypeOf<MessageInputsOf<typeof m.hello_world>>().not.toBeAny();
		expectTypeOf<MessageOptionsOf<typeof m.hello_world>>().not.toBeAny();
		expectTypeOf<MessageMarkupTagsOf<typeof m.docs_link>>().not.toBeAny();
	});
});
