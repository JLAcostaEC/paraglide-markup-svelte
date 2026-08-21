# paraglide-markup-svelte

Type-safe Svelte 5 renderers for [Paraglide JS](https://paraglidejs.com) messages that contain
markup.

Paraglide lets a message carry markup instead of forcing translators to split a sentence apart:

```json
{
	"terms_notice": "Hi {name}, please read the {#link to=|/terms|}terms{/link} before continuing."
}
```

`@inlang/paraglide-js-svelte` renders that with `<ParaglideMessage>`, but it expects you to declare a
snippet for every tag, on every usage. `I18nMarkupMessage` wraps it with a ready-made set of
renderers for the markup that shows up in real messages — links, emphasis, code, lists, line
breaks — so most usages are a single line:

```svelte
<script lang="ts">
	import { I18nMarkupMessage } from 'paraglide-markup-svelte';
	import { m } from '$lib/paraglide/messages.js';
</script>

<I18nMarkupMessage message={m.terms_notice} inputs={{ name: 'Ada' }} />
```

## Two implementations, one behaviour

The library ships one implementation with two presentation variants. They share the same base
component, the same renderer resolution, the same link handling and the same types — only the
styling strategy differs.

| Import                                | Styling                     | Needs Tailwind |
| ------------------------------------- | --------------------------- | -------------- |
| `paraglide-markup-svelte`             | component-scoped Svelte CSS | no             |
| `paraglide-markup-svelte/tailwindcss` | Tailwind utility classes    | yes            |

Both expose the same `I18nMarkupMessage` and the same public types, so switching is a one-line
change.

```svelte
import {I18nMarkupMessage} from 'paraglide-markup-svelte'; // default CSS import {I18nMarkupMessage} from
'paraglide-markup-svelte/tailwindcss'; // Tailwind
```

`MarkupMessage` is **not** part of the public API — there is no alias, and the shared base component
is internal.

### Default CSS implementation

`paraglide-markup-svelte` styles its output with Svelte's own `<style>` block, scoped to the
component. There is no stylesheet to import, no global CSS, no class names to keep in sync, and
nothing to configure. It styles the semantic elements it renders (`a`, `strong`, `em`, `code`, `ul`,
`ol`, `li`, …) so a message can never restyle the surrounding app.

### Tailwind implementation

`paraglide-markup-svelte/tailwindcss` renders the same elements with Tailwind utility classes and no
`<style>` block. It uses only Tailwind's default theme, so it works in any Tailwind v4 project
without extra tokens.

Tailwind finds classes by scanning source files, and both this package and your message files sit
outside the default scan. Add them:

```css
@import 'tailwindcss';

/* the utility classes this package's renderers emit */
@source '../node_modules/paraglide-markup-svelte/dist';

/* only needed if your messages use class=|...| */
@source '../messages';
```

Without the first `@source`, the renderers' classes are purged. Without the second, classes that a
translator wrote inside a message are purged.

## Installation

```sh
npm install paraglide-markup-svelte
```

`@inlang/paraglide-js`, `@inlang/paraglide-js-svelte` and `svelte` are peer dependencies; a project
already using Paraglide with Svelte has all three.

## Localizing links

Paraglide generates `localizeHref` **into your project**, so a published library cannot import it.
Hand it over once while your app starts up:

```ts
import { configureI18nMarkup } from 'paraglide-markup-svelte';
import { localizeHref } from '$lib/paraglide/runtime.js';

configureI18nMarkup({ localizeHref });
```

A good place for this is a `<script module>` block in your root layout, or any module your app
imports at startup. It is module state, so set it once — do not change it per request on the server.

To override it for a single message, pass the prop:

```svelte
<I18nMarkupMessage message={m.docs_link} localizeHref={myLocalizer} />
```

Without a localizer, internal hrefs are rendered exactly as the message wrote them.

## Component API

```svelte
<I18nMarkupMessage
	message={m.some_message}
	inputs={{ name: 'Ada' }}
	options={{ locale: 'es' }}
	localizeHref={optional}
>
	<!-- optional custom renderers -->
</I18nMarkupMessage>
```

| Prop           | Type                          | Notes                                                          |
| -------------- | ----------------------------- | -------------------------------------------------------------- |
| `message`      | a generated Paraglide message | the reference, not a call: `m.title`, never `m.title()`        |
| `inputs`       | the message's own input type  | **required** when the message declares inputs, optional if not |
| `options`      | the message's own option type | e.g. `{ locale: 'es' }`, narrowed to your project's locales    |
| `localizeHref` | `(href: string) => string`    | overrides the configured localizer for this message            |
| _any tag name_ | `I18nMarkupRenderer`          | a snippet that overrides a default tag or adds a new one       |

Messages containing plain text, interpolation, markup, or interpolation combined with markup all
work through the same component.

## Default markup tags

| Tag                        | Renders               | Options                        | Attributes                          |
| -------------------------- | --------------------- | ------------------------------ | ----------------------------------- |
| `{#link}` · alias `{#a}`   | `<a>`                 | `href` / `to` / `url`, `class` | `@external`, `@newtab`, `@nofollow` |
| `{#strong}` · alias `{#b}` | `<strong>`            | `class`                        |                                     |
| `{#em}` · alias `{#i}`     | `<em>`                | `class`                        |                                     |
| `{#u}`                     | `<u>`                 | `class`                        |                                     |
| `{#s}`                     | `<s>`                 | `class`                        |                                     |
| `{#mark}`                  | `<mark>`              | `class`                        |                                     |
| `{#code}`                  | `<code>`              | `class`                        |                                     |
| `{#small}`                 | `<small>`             | `class`                        |                                     |
| `{#sup}` / `{#sub}`        | `<sup>` / `<sub>`     | `class`                        |                                     |
| `{#muted}`                 | dimmed `<span>`       | `class`                        |                                     |
| `{#nowrap}`                | non-wrapping `<span>` | `class`                        |                                     |
| `{#span}`                  | `<span>`              | `class`                        |                                     |
| `{#p}`                     | `<p>`                 | `class`                        |                                     |
| `{#ul}`                    | `<ul>`                | `class`                        |                                     |
| `{#ol}`                    | `<ol>`                | `start`, `type`, `class`       | `@reversed`                         |
| `{#li}`                    | `<li>`                | `value`, `class`               |                                     |
| `{#br/}`                   | `<br>`                |                                | standalone, no children             |

Every tag accepts `class=|...|`, which is appended to whatever the variant already applies.

A tag with no renderer is not an error: its children are rendered without a wrapper, so adding
markup to a message never breaks a page that has not been updated yet.

### Aliases

`{#a}`, `{#b}` and `{#i}` are aliases of `{#link}`, `{#strong}` and `{#em}`. They reuse the same
renderer rather than a copy of it, so an override follows the alias:

- overriding `strong` also changes `b`,
- unless you override `b` too, which always wins,
- overriding `b` alone leaves `strong` on the default.

### Ordered lists

`start` and `value` are parsed as integers and `type` is checked against the values HTML allows
(`1`, `a`, `A`, `i`, `I`). Anything else is dropped instead of being written to the DOM, so a typo
in a translation cannot produce `start="NaN"`.

```json
{ "steps": "{#ol start=|3| type=|a| @reversed}{#li value=|5|}Five{/li}{#li}Six{/li}{/ol}" }
```

### Links

The link renderer reads its target from `href`, `to` or `url`, in that order, and then:

- localizes app paths such as `/about` with your `localizeHref`,
- leaves `#hash` and `?query` targets untouched,
- treats other origins and schemes as external — never localized, opened in a new tab with
  `rel="noopener noreferrer"`,
- keeps `mailto:` and `tel:` links in the same tab, since sending them to a new tab leaves an empty
  window behind,
- honours `@external`, `@newtab` and `@nofollow` explicitly, whatever the target looks like.

## Custom renderers

Any snippet passed as a prop is a renderer. Name it after a default tag to replace that default, or
after a new tag to add one. Use the exported `I18nMarkupRendererProps` to type it:

```svelte
<script lang="ts">
	import { I18nMarkupMessage, optionText } from 'paraglide-markup-svelte';
	import type { I18nMarkupRendererProps } from 'paraglide-markup-svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Badge from './Badge.svelte';
</script>

{#snippet badge({ children, options, attributes }: I18nMarkupRendererProps)}
	<Badge level={optionText(options.level)} muted={attributes.muted === true}>
		{@render children?.()}
	</Badge>
{/snippet}

<I18nMarkupMessage message={m.release_notice} {badge} />
```

A renderer receives:

| Prop             | Type                              | Meaning                                        |
| ---------------- | --------------------------------- | ---------------------------------------------- |
| `children`       | `Snippet \| undefined`            | content between the tags; absent for `{#tag/}` |
| `options`        | `MessageMarkupOptions`            | values written as `name=\|value\|`             |
| `attributes`     | `MessageMarkupAttributes`         | flags written as `@name`                       |
| `inputs`         | the surrounding message's inputs  | for renderers that need message context        |
| `messageOptions` | the surrounding message's options | e.g. the locale in use                         |

`options` values are `unknown`, because a message may interpolate an input into them. The exported
helpers turn them into something usable without casting: `optionText`, `optionClass`,
`integerOption`, `isFlagSet`, `orderedListType`, `orderedListAttributes`, `listItemValue`,
`mergeClasses`, plus `anchorAttributes`, `hrefKind`, `isExternalHref` and `linkHref` for links.

### Merge order

Renderers resolve in a fixed order, so the result never depends on prop order:

1. the variant's own renderers,
2. aliases, pointing at the renderer they reuse,
3. your overrides, replacing a default or adding a new tag,
4. aliases of an overridden tag, unless that alias was overridden itself.

## TypeScript

The component is generic over the message you give it, and everything else follows from the message:

```svelte
<I18nMarkupMessage message={m.plain_text} />
<!-- no inputs needed -->
<I18nMarkupMessage message={m.greeting} inputs={{ name: 'Ada' }} />
<!-- inputs required -->
<I18nMarkupMessage message={m.greeting} inputs={{ name: 'Ada' }} options={{ locale: 'es' }} />
```

- `inputs` is **required** when the message declares inputs and optional when it does not, with the
  exact shape the Paraglide compiler generated.
- `options` is narrowed to your project's locales, so `{ locale: 'de' }` is a type error in a
  two-locale project.
- Renderer prop names are checked: you may override any default tag, and add any tag the message
  actually contains. A typo, or a renderer for a tag that message will never use, is a type error.
- Generated messages are accepted as-is. Normal usage needs no casts.
- The public API contains no `any`.

Useful exported types: `I18nMarkupMessageProps`, `I18nMarkupRenderer`, `I18nMarkupRendererProps`,
`MarkupRendererOverrides`, `MessageInputsOf`, `MessageOptionsOf`, `MessageMarkupTagsOf`,
`ParaglideMessageLike`, `HrefLocalizer`, `OrderedListType`, plus `MessageMarkupOptions`,
`MessageMarkupAttributes` and `MessageOptions` re-exported from Paraglide.

## Architecture

```
src/lib/
	index.ts                        → paraglide-markup-svelte      (CSS variant)
	tailwindcss/index.ts            → …/tailwindcss                (Tailwind variant)
	css/I18nMarkupMessage.svelte      presentation: scoped <style>
	tailwindcss/I18nMarkupMessage.svelte  presentation: utility classes
	internal/
		MarkupMessageBase.svelte      shared behaviour, no styling
		renderers.ts                  tags, aliases, override merging
		link.ts                       URL classification, <a> attributes
		markup.ts                     option / class / flag / integer parsing
		types.ts                      the type system
		paraglide.ts                  the one boundary with an assertion
		config.ts                     localizeHref configuration
```

Behaviour lives in the shared layer; the two variants only declare the renderer snippets. Paraglide
integration exists in exactly one place.

`internal/paraglide.ts` holds the library's single type assertion, and documents why it cannot be
avoided: `MessageProps<TMessage>` derives one **required** renderer prop per markup tag that a
specific message contains, typed against that message's own schema, and rejects every other prop —
so a wrapper that always supplies the same renderer set is unrepresentable in those types. Widening
happens there and nowhere else; the public API stays fully typed.

## Development

```sh
pnpm dev          # showcase app, renders src/lib/example.svelte
pnpm check        # svelte-check
pnpm test:unit    # unit, component and type-level tests
pnpm lint         # prettier + eslint
pnpm build        # showcase build + svelte-package + publint
```

Everything inside `src/lib` is the library; `src/routes` is the showcase app. Read more about
packaging [in the SvelteKit docs](https://svelte.dev/docs/kit/packaging).
