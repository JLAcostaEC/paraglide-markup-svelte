<script lang="ts" module>
	import { configureI18nMarkup } from '$lib/index.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	/*
		Paraglide generates `localizeHref` into this project, so the library cannot
		import it. Wiring it up once makes every internal link rendered from a
		message locale-aware.
	*/
	configureI18nMarkup({ localizeHref });
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { I18nMarkupMessage, optionText } from '$lib/index.js';
	import { I18nMarkupMessage as TailwindMarkupMessage } from '$lib/tailwindcss/index.js';
	import type { I18nMarkupRendererProps } from '$lib/index.js';
	import { m } from '$lib/paraglide/messages.js';

	const REPO = 'https://github.com/JLAcostaEC/paraglide-markup-svelte';

	const activeLocale = $derived.by(() => {
		// Re-read the locale after a navigation changes the URL.
		void page.url.pathname;
		return getLocale();
	});

	const SECTIONS = [
		{ id: 'problem', label: 'The problem' },
		{ id: 'install', label: 'Quick start' },
		{ id: 'variants', label: 'CSS vs Tailwind' },
		{ id: 'tags', label: 'Default tags' },
		{ id: 'aliases', label: 'Aliases & merge order' },
		{ id: 'links', label: 'Link handling' },
		{ id: 'lists', label: 'Lists' },
		{ id: 'classes', label: 'Classes' },
		{ id: 'custom', label: 'Custom renderers' },
		{ id: 'inputs', label: 'Inputs & options' },
		{ id: 'typescript', label: 'TypeScript' },
		{ id: 'tailwind-setup', label: 'Tailwind setup' },
		{ id: 'architecture', label: 'Architecture' }
	];

	/* Message sources, kept as data so `{#tag}` never hits Svelte's parser. */
	const SRC = {
		naive: `{
  "terms_a": "Hi {name}, please read the ",
  "terms_b": "terms",
  "terms_c": " before continuing."
}`,
		good: `{
  "terms_notice": "Hi {name}, please read the {#link to=|/terms|}terms{/link} before continuing."
}`,
		docsLink: `"docs_link": "{#link to=|/docs|}Read the docs{/link}"`,
		inline: `"inline_styles": "{#strong}bold{/strong} {#b}alias-bold{/b} {#em}emph{/em} {#i}alias-emph{/i} {#u}under{/u} {#s}struck{/s} {#mark}marked{/mark} {#code}code{/code} {#small}small{/small} {#sup}sup{/sup} {#sub}sub{/sub} {#muted}muted{/muted} {#nowrap}no wrap{/nowrap}"`,
		links: `"external_link": "{#link href=|https://example.com/pricing|}Pricing{/link}",
"mail_link":     "{#link href=|mailto:hello@example.com|}Email us{/link}",
"tel_link":      "{#link href=|tel:+15550100|}Call us{/link}",
"newtab_link":   "{#link href=|/terms| @newtab @nofollow}Terms{/link}",
"forced":        "{#link href=|/partner| @external}Partner{/link}"`,
		lists: `"bullet_list":   "{#ul}{#li}One{/li}{#li}Two{/li}{/ul}",
"numbered_list": "{#ol start=|3| type=|a| @reversed}{#li value=|5|}Five{/li}{#li}Six{/li}{/ol}"`,
		invalidOl: `"invalid_ol": "{#ol start=|abc| type=|z|}{#li value=|not-a-number|}Item{/li}{/ol}"`,
		classes: `"span_with_class": "{#span class=|extra-class|}Styled span{/span}",
"url_option_link": "{#link url=|/pricing| class=|cta-link|}Pricing{/link}",
"paragraphs":      "{#p}First paragraph{/p}{#p class=|lead|}Second paragraph{/p}"`,
		badge: `"custom_badge": "Status: {#badge level=|new|}New{/badge}"`,
		unknown: `"unknown_tag": "Hello {#unregistered}stranger{/unregistered}!"`,
		withInput: `"greeting_rich":     "Hello {name}, welcome to {#strong}our site{/strong}!",
"markup_with_input": "{#link to=|/users|}{name}'s profile{/link}"`
	};

	/*
		Assembled from pieces so the raw file never contains a literal script or
		style tag inside a code sample. Tooling that slices .svelte files by
		scanning for those tags — svelte-check among it — matches them even inside
		a string or a comment, and then mis-reads where the real blocks end.
	*/
	const SCRIPT_OPEN = `<${'script'} lang="ts">`;
	const SCRIPT_CLOSE = `<${'/'}script>`;

	const CODE = {
		install: 'npm install paraglide-markup-svelte',
		configure: `// once, while your app starts up
import { configureI18nMarkup } from 'paraglide-markup-svelte';
import { localizeHref } from '$lib/paraglide/runtime.js';

configureI18nMarkup({ localizeHref });`,
		use: `${SCRIPT_OPEN}
  import { I18nMarkupMessage } from 'paraglide-markup-svelte';
  import { m } from '$lib/paraglide/messages.js';
${SCRIPT_CLOSE}

<I18nMarkupMessage message={m.terms_notice} inputs={{ name: 'Ada' }} />`,
		imports: `import { I18nMarkupMessage } from 'paraglide-markup-svelte';             // scoped CSS
import { I18nMarkupMessage } from 'paraglide-markup-svelte/tailwindcss'; // Tailwind`,
		custom: `${SCRIPT_OPEN}
  import { I18nMarkupMessage, optionText } from 'paraglide-markup-svelte';
  import type { I18nMarkupRendererProps } from 'paraglide-markup-svelte';
  import { m } from '$lib/paraglide/messages.js';
${SCRIPT_CLOSE}

{#snippet badge({ children, options }: I18nMarkupRendererProps)}
  <span class="badge" data-level={optionText(options.level)}>
    {@render children?.()}
  </span>
{/snippet}

<I18nMarkupMessage message={m.custom_badge} {badge} />`,
		override: `{#snippet strong({ children }: I18nMarkupRendererProps)}
  <b class="shouty">{@render children?.()}</b>
{/snippet}

<!-- replaces the default \`strong\`, and its \`b\` alias follows -->
<I18nMarkupMessage message={m.inline_styles} {strong} />`,
		types: `<!-- inputs optional: the message declares none -->
<I18nMarkupMessage message={m.plain_text} />

<!-- inputs required, and typed as { name: … } -->
<I18nMarkupMessage message={m.hello_world} inputs={{ name: 'Ada' }} />

<!-- options narrowed to the project locales -->
<I18nMarkupMessage message={m.hello_world} inputs={{ name: 'Ada' }} options={{ locale: 'es' }} />`,
		typeErrors: `<!-- Error: 'de' is not assignable to 'en' | 'es' -->
<I18nMarkupMessage message={m.hello_world} inputs={{ name: 'Ada' }} options={{ locale: 'de' }} />

<!-- Error: Property 'inputs' is missing -->
<I18nMarkupMessage message={m.hello_world} />

<!-- Error: 'badge' does not exist on this message's props -->
<I18nMarkupMessage message={m.plain_text} {badge} />`,
		tailwind: `@import 'tailwindcss';

/* the utility classes this package's renderers emit */
@source '../node_modules/paraglide-markup-svelte/dist';

/* only needed if your messages use class=|…| */
@source '../messages';`,
		tree: `src/lib/
├─ index.ts                          → paraglide-markup-svelte
├─ tailwindcss/index.ts              → …/tailwindcss
├─ css/I18nMarkupMessage.svelte        presentation: scoped style block
├─ tailwindcss/I18nMarkupMessage.svelte presentation: utility classes
└─ internal/
   ├─ MarkupMessageBase.svelte         shared behaviour, no styling
   ├─ renderers.ts                     tags, aliases, override merging
   ├─ link.ts                          URL classification, <a> attributes
   ├─ markup.ts                        option / class / flag / int parsing
   ├─ types.ts                         the type system
   ├─ paraglide.ts                     the one boundary with an assertion
   └─ config.ts                        localizeHref configuration`
	};

	const TAGS = [
		{
			tag: '{#link}',
			alias: '{#a}',
			el: '<a>',
			opt: 'href / to / url, class',
			at: '@external @newtab @nofollow'
		},
		{ tag: '{#strong}', alias: '{#b}', el: '<strong>', opt: 'class', at: '' },
		{ tag: '{#em}', alias: '{#i}', el: '<em>', opt: 'class', at: '' },
		{ tag: '{#u}', alias: '', el: '<u>', opt: 'class', at: '' },
		{ tag: '{#s}', alias: '', el: '<s>', opt: 'class', at: '' },
		{ tag: '{#mark}', alias: '', el: '<mark>', opt: 'class', at: '' },
		{ tag: '{#code}', alias: '', el: '<code>', opt: 'class', at: '' },
		{ tag: '{#small}', alias: '', el: '<small>', opt: 'class', at: '' },
		{ tag: '{#sup}', alias: '', el: '<sup>', opt: 'class', at: '' },
		{ tag: '{#sub}', alias: '', el: '<sub>', opt: 'class', at: '' },
		{ tag: '{#muted}', alias: '', el: '<span> dimmed', opt: 'class', at: '' },
		{ tag: '{#nowrap}', alias: '', el: '<span> no wrap', opt: 'class', at: '' },
		{ tag: '{#span}', alias: '', el: '<span>', opt: 'class', at: '' },
		{ tag: '{#p}', alias: '', el: '<p>', opt: 'class', at: '' },
		{ tag: '{#ul}', alias: '', el: '<ul>', opt: 'class', at: '' },
		{ tag: '{#ol}', alias: '', el: '<ol>', opt: 'start, type, class', at: '@reversed' },
		{ tag: '{#li}', alias: '', el: '<li>', opt: 'value, class', at: '' },
		{ tag: '{#br/}', alias: '', el: '<br>', opt: '', at: 'standalone' }
	];

	const RENDERER_PROPS = [
		['children', 'Snippet | undefined', 'content between the tags; absent for a standalone tag'],
		['options', 'MessageMarkupOptions', 'values written as name=|value|'],
		['attributes', 'MessageMarkupAttributes', 'flags written as @name'],
		['inputs', "the message's inputs", 'for renderers that need message context'],
		['messageOptions', "the message's options", 'e.g. the locale in use']
	];

	let copied = $state('');

	async function copy(text: string, key: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = key;
			setTimeout(() => (copied = copied === key ? '' : copied), 1600);
		} catch {
			// Clipboard blocked (no permission, insecure context) — nothing to do.
		}
	}
</script>

<svelte:head>
	<title>paraglide-markup-svelte — markup renderers for Paraglide messages</title>
	<meta
		name="description"
		content="Type-safe Svelte 5 renderers for Paraglide JS messages that contain markup. One behaviour, two presentations: component-scoped CSS or Tailwind."
	/>
</svelte:head>

{#snippet code(text: string, label?: string, key?: string)}
	<div class="code">
		{#if label}
			<div class="code-bar">
				<span>{label}</span>
				{#if key}
					<button type="button" onclick={() => copy(text, key)}>
						{copied === key ? 'Copied' : 'Copy'}
					</button>
				{/if}
			</div>
		{/if}
		<pre><code>{text}</code></pre>
	</div>
{/snippet}

<a class="skip" href="#content">Skip to content</a>

<header class="topbar">
	<div class="wrap topbar-inner">
		<a class="brand" href={resolve('/')}>
			<span class="brand-mark" aria-hidden="true">{'{#}'}</span>
			<span class="brand-text">
				<strong>paraglide-markup-svelte</strong>
				<span class="brand-sub">Markup renderers for Paraglide messages</span>
			</span>
		</a>

		<div class="topbar-actions">
			<a class="btn-github" href={REPO} target="_blank" rel="noopener noreferrer">
				<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
					<path
						fill="currentColor"
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38l-.01-1.49c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
					/>
				</svg>
				<span>GitHub</span>
			</a>
		</div>
	</div>
</header>

<main id="content">
	<section class="hero">
		<div class="wrap hero-inner">
			<p class="eyebrow">Svelte 5 · Paraglide JS</p>
			<h1>Let translators write <em>whole sentences</em>.</h1>
			<p class="lede">
				Paraglide messages can carry markup — links, emphasis, lists — instead of being chopped into
				fragments. <code>I18nMarkupMessage</code> renders that markup with a ready-made set of semantic
				renderers, so a message with a link inside is still one line of Svelte.
			</p>

			<div class="hero-code">
				{@render code(CODE.install, 'terminal', 'install')}
			</div>

			<div class="hero-links">
				<a class="btn btn-primary" href="#install">Quick start</a>
				<a class="btn" href={REPO} target="_blank" rel="noopener noreferrer">View on GitHub →</a>
			</div>

			<ul class="pills">
				<li>No <code>any</code>, one type assertion</li>
				<li>21 default tags</li>
				<li>CSS or Tailwind</li>
				<li>172 tests</li>
			</ul>
		</div>
	</section>

	<div class="wrap shell">
		<aside class="toc" aria-label="On this page">
			<p class="toc-title">On this page</p>
			<nav>
				{#each SECTIONS as section (section.id)}
					<a href={`#${section.id}`}>{section.label}</a>
				{/each}
			</nav>
		</aside>

		<article class="doc">
			<!-- ─────────────── the problem ─────────────── -->
			<section id="problem">
				<h2>The problem it solves</h2>
				<p>
					A sentence with a link in the middle is the classic i18n trap. Without markup support you
					end up splitting it into pieces, and every translator has to guess how the fragments get
					glued back together — a word order that works in English and nowhere else.
				</p>

				<div class="split">
					<div class="split-col">
						<p class="split-label bad">Fragmented</p>
						{@render code(SRC.naive, 'messages/en.json')}
						<p class="note">
							Three messages, no context, and the sentence structure is now hard-coded in your
							component.
						</p>
					</div>
					<div class="split-col">
						<p class="split-label good">One message</p>
						{@render code(SRC.good, 'messages/en.json')}
						<p class="note">
							One message, translatable as a sentence. The translator can move the link anywhere.
						</p>
					</div>
				</div>

				<p>
					<code>@inlang/paraglide-js-svelte</code> already renders that markup, but it asks you to
					declare a snippet for <em>every</em> tag, on <em>every</em> usage. This library supplies those
					snippets once, for the markup that actually shows up in real messages.
				</p>
			</section>

			<!-- ─────────────── quick start ─────────────── -->
			<section id="install">
				<h2>Quick start</h2>

				<ol class="steps">
					<li>
						<h3>Install</h3>
						<p>
							<code>@inlang/paraglide-js</code>, <code>@inlang/paraglide-js-svelte</code> and
							<code>svelte</code> are peer dependencies — a project already using Paraglide with Svelte
							has all three.
						</p>
						{@render code(CODE.install, 'terminal', 'install-2')}
					</li>

					<li>
						<h3>Hand over <code>localizeHref</code></h3>
						<p>
							Paraglide generates <code>localizeHref</code> <em>into your project</em>, so a
							published library can never import it. Give it to the library once and every internal
							link a message renders becomes locale-aware. Skip this and hrefs are rendered exactly
							as the message wrote them.
						</p>
						{@render code(CODE.configure, 'src/routes/+layout.svelte', 'configure')}
					</li>

					<li>
						<h3>Render</h3>
						<p>
							Pass the message <em>reference</em> — <code>m.title</code>, never
							<code>m.title()</code>. Everything else is inferred from it.
						</p>
						{@render code(CODE.use, 'Component.svelte', 'use')}
					</li>
				</ol>
			</section>

			<!-- ─────────────── variants ─────────────── -->
			<section id="variants">
				<h2>Two presentations, one behaviour</h2>
				<p>
					The library ships <strong>one</strong> implementation with two presentation variants. They share
					the same base component, the same renderer resolution, the same link handling and the same types.
					Only the styling strategy differs, so switching is a one-line change.
				</p>

				{@render code(CODE.imports, 'pick one', 'imports')}

				<div class="table-scroll">
					<table>
						<thead>
							<tr><th>Import</th><th>Styling</th><th>Needs Tailwind</th></tr>
						</thead>
						<tbody>
							<tr>
								<td><code>paraglide-markup-svelte</code></td>
								<td>component-scoped Svelte CSS</td>
								<td><span class="tick no">no</span></td>
							</tr>
							<tr>
								<td><code>paraglide-markup-svelte/tailwindcss</code></td>
								<td>Tailwind utility classes</td>
								<td><span class="tick yes">yes</span></td>
							</tr>
						</tbody>
					</table>
				</div>

				<p>
					The default build styles the semantic elements it renders inside a Svelte
					<code>&lt;style&gt;</code> block, so there is no stylesheet to import, no global CSS and no
					class names to keep in sync. A message can never restyle the app around it.
				</p>

				<div class="demo">
					{@render code(SRC.inline, 'messages/en.json')}
					<div class="demo-out two">
						<div>
							<span class="demo-tag">CSS variant</span>
							<div class="rendered"><I18nMarkupMessage message={m.inline_styles} /></div>
						</div>
						<div>
							<span class="demo-tag">Tailwind variant</span>
							<div class="rendered">
								<TailwindMarkupMessage message={m.inline_styles} />
							</div>
						</div>
					</div>
				</div>

				<p class="note">
					The Tailwind pane above is unstyled here — this documentation site does not install
					Tailwind, which is precisely the point: the default build needs nothing. The utility
					classes are still on the elements, ready for a project that does have Tailwind.
				</p>

				<aside class="callout">
					<p>
						<strong><code>MarkupMessage</code> is not part of the public API.</strong> There is no
						alias and no second name — both entry points export <code>I18nMarkupMessage</code>, and
						the shared base component stays internal.
					</p>
				</aside>
			</section>

			<!-- ─────────────── tags ─────────────── -->
			<section id="tags">
				<h2>Default markup tags</h2>
				<p>
					Every tag below works out of the box, renders a native HTML element, and accepts
					<code>class=|…|</code> which is appended to whatever the variant already applies.
				</p>

				<div class="table-scroll">
					<table class="tags">
						<thead>
							<tr><th>Tag</th><th>Alias</th><th>Element</th><th>Options</th><th>Attributes</th></tr>
						</thead>
						<tbody>
							{#each TAGS as t (t.tag)}
								<tr>
									<td><code>{t.tag}</code></td>
									<td
										>{#if t.alias}<code>{t.alias}</code>{:else}<span class="dash">—</span>{/if}</td
									>
									<td><code class="el">{t.el}</code></td>
									<td
										>{#if t.opt}<code>{t.opt}</code>{:else}<span class="dash">—</span>{/if}</td
									>
									<td
										>{#if t.at}<code>{t.at}</code>{:else}<span class="dash">—</span>{/if}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<h3>An unknown tag is not an error</h3>
				<p>
					If a message uses a tag nothing renders, its children are rendered <em>without</em> a wrapper.
					Adding markup to a translation can therefore never break a page that has not been updated yet.
				</p>

				<div class="demo">
					{@render code(SRC.unknown, 'messages/en.json')}
					<div class="demo-out">
						<span class="demo-tag">renders</span>
						<div class="rendered"><I18nMarkupMessage message={m.unknown_tag} /></div>
					</div>
				</div>
			</section>

			<!-- ─────────────── aliases ─────────────── -->
			<section id="aliases">
				<h2>Aliases and merge order</h2>
				<p>
					<code>{'{#a}'}</code>, <code>{'{#b}'}</code> and <code>{'{#i}'}</code> are aliases of
					<code>{'{#link}'}</code>, <code>{'{#strong}'}</code> and <code>{'{#em}'}</code>. They
					reuse the same renderer rather than a copy of it, which is why an override follows the
					alias.
				</p>

				<p>Renderers resolve in a fixed order, so the result never depends on prop order:</p>

				<ol class="ordered">
					<li>the variant's own renderers,</li>
					<li>aliases, pointing at the renderer they reuse,</li>
					<li>your overrides, replacing a default or adding a new tag,</li>
					<li>aliases of an overridden tag — unless that alias was overridden itself.</li>
				</ol>

				<p>In practice:</p>
				<ul class="bullets">
					<li>overriding <code>strong</code> also changes <code>b</code>,</li>
					<li>unless you override <code>b</code> too, which always wins,</li>
					<li>overriding <code>b</code> alone leaves <code>strong</code> on the default.</li>
				</ul>
			</section>

			<!-- ─────────────── links ─────────────── -->
			<section id="links">
				<h2>Link handling</h2>
				<p>
					The link renderer reads its target from <code>href</code>, <code>to</code> or
					<code>url</code>, in that order, and then decides what to do with it:
				</p>

				<ul class="bullets">
					<li>app paths such as <code>/about</code> go through your <code>localizeHref</code>;</li>
					<li><code>#hash</code> and <code>?query</code> targets are left untouched;</li>
					<li>
						other origins and schemes are external — never localized, opened in a new tab with
						<code>rel="noopener noreferrer"</code>;
					</li>
					<li>
						<code>mailto:</code> and <code>tel:</code> stay in the same tab, because sending them to a
						new one leaves an empty window behind;
					</li>
					<li>
						<code>@external</code>, <code>@newtab</code> and <code>@nofollow</code> are honoured explicitly,
						whatever the target looks like.
					</li>
				</ul>

				<div class="demo">
					{@render code(SRC.docsLink, 'messages/en.json')}
					<div class="demo-out">
						<span class="demo-tag">renders — href localized to <code>{activeLocale}</code></span>
						<div class="rendered"><I18nMarkupMessage message={m.docs_link} /></div>
					</div>
				</div>

				<p class="note">
					Switch the language in the header and watch that link's <code>href</code> change. Nothing
					in the component changed — only the configured <code>localizeHref</code> did the work.
				</p>

				<div class="demo">
					{@render code(SRC.links, 'messages/en.json')}
					<div class="demo-out">
						<span class="demo-tag">renders</span>
						<div class="rendered link-row">
							<I18nMarkupMessage message={m.external_link} />
							<I18nMarkupMessage message={m.mail_link} />
							<I18nMarkupMessage message={m.tel_link} />
							<I18nMarkupMessage message={m.newtab_link} />
							<I18nMarkupMessage message={m.forced_external_link} />
						</div>
					</div>
				</div>

				<p class="note">
					Inspect those anchors: the external one has <code>target="_blank"</code>, the
					<code>mailto:</code> and <code>tel:</code> ones do not, and
					<code>newtab_link</code> carries <code>rel="noopener noreferrer nofollow"</code>.
				</p>
			</section>

			<!-- ─────────────── lists ─────────────── -->
			<section id="lists">
				<h2>Lists</h2>
				<p>
					<code>start</code> and <code>value</code> are parsed as integers and <code>type</code> is
					checked against the values HTML actually allows — <code>1</code>, <code>a</code>,
					<code>A</code>, <code>i</code>, <code>I</code>.
				</p>

				<div class="demo">
					{@render code(SRC.lists, 'messages/en.json')}
					<div class="demo-out">
						<span class="demo-tag">renders</span>
						<div class="rendered">
							<I18nMarkupMessage message={m.bullet_list} />
							<I18nMarkupMessage message={m.numbered_list} />
						</div>
					</div>
				</div>

				<h3>Bad values are dropped, not forwarded</h3>
				<p>
					A typo in a translation must not reach the DOM as <code>start="NaN"</code>. Anything that
					is not a valid integer or a valid numbering type is discarded, and the list still renders.
				</p>

				<div class="demo">
					{@render code(SRC.invalidOl, 'messages/en.json')}
					<div class="demo-out">
						<span class="demo-tag"
							>renders — no <code>start</code>, <code>type</code> or <code>value</code> attribute</span
						>
						<div class="rendered"><I18nMarkupMessage message={m.invalid_ol} /></div>
					</div>
				</div>
			</section>

			<!-- ─────────────── classes ─────────────── -->
			<section id="classes">
				<h2>Classes from a message</h2>
				<p>
					Any tag accepts <code>class=|…|</code>. The CSS variant combines it with its scoped
					styling; the Tailwind variant merges it with its utility classes. The three classes below
					are styled by <em>this page</em>, not by the library — proof they land on the elements.
				</p>

				<div class="demo">
					{@render code(SRC.classes, 'messages/en.json')}
					<div class="demo-out">
						<span class="demo-tag">renders</span>
						<div class="rendered">
							<p><I18nMarkupMessage message={m.span_with_class} /></p>
							<p><I18nMarkupMessage message={m.url_option_link} /></p>
							<I18nMarkupMessage message={m.paragraphs} />
						</div>
					</div>
				</div>

				<aside class="callout warn">
					<p>
						<strong>Using Tailwind classes inside messages?</strong> Tailwind scans source files,
						and your message files are not source files. Add
						<code>@source '../messages'</code> or they get purged — see
						<a href="#tailwind-setup">Tailwind setup</a>.
					</p>
				</aside>
			</section>

			<!-- ─────────────── custom renderers ─────────────── -->
			<section id="custom">
				<h2>Custom renderers</h2>
				<p>
					Any snippet passed as a prop is a renderer. Name it after a default tag to replace that
					default, or after a new tag to add one. <code>I18nMarkupRendererProps</code> types it, so no
					cast is needed anywhere.
				</p>

				{@render code(CODE.custom, 'Component.svelte', 'custom')}

				<div class="demo">
					{@render code(SRC.badge, 'messages/en.json')}
					<div class="demo-out">
						<span class="demo-tag">renders — <code>badge</code> is not a default tag</span>
						<div class="rendered">
							<I18nMarkupMessage message={m.custom_badge} {badge} />
						</div>
					</div>
				</div>

				<h3>What a renderer receives</h3>
				<div class="table-scroll">
					<table>
						<thead><tr><th>Prop</th><th>Type</th><th>Meaning</th></tr></thead>
						<tbody>
							{#each RENDERER_PROPS as [name, type, meaning] (name)}
								<tr>
									<td><code>{name}</code></td>
									<td><code>{type}</code></td>
									<td>{meaning}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<p>
					<code>options</code> values are <code>unknown</code>, because a message may interpolate an
					input into them. The exported helpers turn them into something usable without casting:
					<code>optionText</code>, <code>optionClass</code>, <code>integerOption</code>,
					<code>isFlagSet</code>, <code>orderedListType</code>, <code>orderedListAttributes</code>,
					<code>listItemValue</code>, <code>mergeClasses</code>, plus
					<code>anchorAttributes</code>, <code>hrefKind</code>, <code>isExternalHref</code> and
					<code>linkHref</code> for links.
				</p>

				<h3>Overriding a default</h3>
				{@render code(CODE.override, 'Component.svelte', 'override')}

				<div class="demo">
					<div class="demo-out two">
						<div>
							<span class="demo-tag">default</span>
							<div class="rendered"><I18nMarkupMessage message={m.inline_styles} /></div>
						</div>
						<div>
							<span class="demo-tag">with <code>strong</code> overridden</span>
							<div class="rendered">
								<I18nMarkupMessage message={m.inline_styles} strong={shouty} />
							</div>
						</div>
					</div>
				</div>

				<p class="note">
					Both <em>bold</em> and <em>alias-bold</em> changed in the right-hand pane: the override of
					<code>strong</code> carried over to its <code>b</code> alias.
				</p>
			</section>

			<!-- ─────────────── inputs & options ─────────────── -->
			<section id="inputs">
				<h2>Inputs and options</h2>
				<p>
					Interpolation, markup, and interpolation <em>inside</em> markup all go through the same
					component. <code>inputs</code> is required exactly when the message declares variables,
					and <code>options</code> is narrowed to your project's locales.
				</p>

				<div class="demo">
					{@render code(SRC.withInput, 'messages/en.json')}
					<div class="demo-out two">
						<div>
							<span class="demo-tag">default locale</span>
							<div class="rendered">
								<p><I18nMarkupMessage message={m.greeting_rich} inputs={{ name: 'Ada' }} /></p>
								<p><I18nMarkupMessage message={m.markup_with_input} inputs={{ name: 'Ada' }} /></p>
							</div>
						</div>
						<div>
							<span class="demo-tag"><code>options={"{{ locale: 'es' }}"}</code></span>
							<div class="rendered">
								<p>
									<I18nMarkupMessage
										message={m.greeting_rich}
										inputs={{ name: 'Ada' }}
										options={{ locale: 'es' }}
									/>
								</p>
								<p>
									<I18nMarkupMessage
										message={m.markup_with_input}
										inputs={{ name: 'Ada' }}
										options={{ locale: 'es' }}
									/>
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- ─────────────── typescript ─────────────── -->
			<section id="typescript">
				<h2>TypeScript</h2>
				<p>
					The component is generic over the message you hand it, and everything else follows from
					that message. Generated messages are accepted as-is — normal usage needs no casts.
				</p>

				{@render code(CODE.types, 'inferred from the message', 'types')}

				<p>And the mistakes that used to be runtime bugs are now compile errors:</p>

				{@render code(CODE.typeErrors, 'rejected at compile time', 'type-errors')}

				<ul class="bullets">
					<li>
						<code>inputs</code> is <strong>required</strong> when the message declares variables and optional
						when it does not, with the exact shape the Paraglide compiler generated.
					</li>
					<li>
						<code>options</code> is narrowed to your locales, so <code>{"{ locale: 'de' }"}</code> is
						an error in a two-locale project.
					</li>
					<li>
						Renderer prop names are checked: you may override any default tag and add any tag the
						message actually contains. A typo, or a renderer for a tag that message will never use,
						is an error.
					</li>
					<li>The public API contains no <code>any</code>.</li>
				</ul>

				<aside class="callout">
					<p>
						<strong>One assertion, on purpose.</strong>
						<code>MessageProps&lt;TMessage&gt;</code> derives one <em>required</em> renderer prop
						per markup tag a specific message contains, typed against that message's own schema, and
						rejects every other prop. A wrapper that always supplies the same renderer set is
						therefore unrepresentable in those types. The widening happens in
						<code>internal/paraglide.ts</code> and nowhere else; the public API stays fully typed.
					</p>
				</aside>
			</section>

			<!-- ─────────────── tailwind setup ─────────────── -->
			<section id="tailwind-setup">
				<h2>Tailwind setup</h2>
				<p>
					The Tailwind build uses only Tailwind's default theme, so it works in any Tailwind v4
					project without extra tokens. What it <em>does</em> need is for Tailwind to see the classes
					— and both this package and your message files sit outside the default scan.
				</p>

				{@render code(CODE.tailwind, 'src/app.css', 'tailwind')}

				<p>
					Without the first <code>@source</code>, the renderers' own classes are purged. Without the
					second, a class a translator wrote inside a message is purged. Only the default CSS build
					needs neither.
				</p>
			</section>

			<!-- ─────────────── architecture ─────────────── -->
			<section id="architecture">
				<h2>Architecture</h2>
				<p>
					Behaviour lives in the shared layer; the two variants only declare renderer snippets.
					Paraglide integration exists in exactly one place, and so does the one type assertion.
				</p>

				{@render code(CODE.tree, 'src/lib')}

				<div class="cards">
					<div class="card">
						<h3>Shared</h3>
						<p>
							Paraglide integration, message handling, renderer resolution and registration,
							overrides, link behaviour, attribute handling, semantic structure, the type system.
						</p>
					</div>
					<div class="card">
						<h3>CSS</h3>
						<p>
							Component-scoped Svelte styles on semantic element selectors. No class names to
							coordinate, no stylesheet to import, no Tailwind.
						</p>
					</div>
					<div class="card">
						<h3>Tailwind</h3>
						<p>
							The same elements and the same behaviour, with utility classes instead of a
							<code>&lt;style&gt;</code> block.
						</p>
					</div>
				</div>

				<div class="cta">
					<p>Source, issues and releases live on GitHub.</p>
					<a class="btn btn-primary" href={REPO} target="_blank" rel="noopener noreferrer">
						JLAcostaEC/paraglide-markup-svelte →
					</a>
				</div>
			</section>
		</article>
	</div>
</main>

<footer class="sitefooter">
	<div class="wrap sitefooter-inner">
		<p>
			<strong>paraglide-markup-svelte</strong> — type-safe Svelte 5 renderers for
			<a href="https://paraglidejs.com" target="_blank" rel="noopener noreferrer">Paraglide JS</a>
			messages that contain markup.
		</p>
		<nav aria-label="Project links">
			<a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
			<a href="{REPO}/issues" target="_blank" rel="noopener noreferrer">Issues</a>
			<a href="https://svelte.dev/docs/kit/packaging" target="_blank" rel="noopener noreferrer">
				SvelteKit packaging
			</a>
		</nav>
	</div>
</footer>

<!-- Custom renderers used by the demos above. -->
{#snippet badge({ children, options }: I18nMarkupRendererProps)}
	<span class="badge" data-level={optionText(options.level)}>{@render children?.()}</span>
{/snippet}

{#snippet shouty({ children }: I18nMarkupRendererProps)}
	<b class="shouty">{@render children?.()}</b>
{/snippet}

<style>
	/* ═══════════ design tokens ═══════════ */
	:global(:root) {
		--bg: oklch(98.5% 0.004 260);
		--bg-raised: oklch(100% 0 0);
		--bg-sunken: oklch(96.2% 0.006 260);
		--border: oklch(90% 0.008 260);
		--border-strong: oklch(83% 0.012 260);
		--text: oklch(24% 0.018 262);
		--text-soft: oklch(45% 0.014 262);
		--text-faint: oklch(57% 0.012 262);
		--accent: oklch(50% 0.18 258);
		--accent-hover: oklch(43% 0.19 258);
		--accent-wash: oklch(96% 0.028 258);
		--good: oklch(52% 0.13 155);
		--bad: oklch(55% 0.17 25);
		--warn-wash: oklch(97% 0.04 95);
		--warn-border: oklch(84% 0.09 88);
		--code-bg: oklch(22% 0.018 264);
		--code-text: oklch(92% 0.008 260);
		--shadow-sm: 0 1px 2px oklch(24% 0.018 262 / 0.07);
		--shadow: 0 1px 2px oklch(24% 0.018 262 / 0.06), 0 10px 28px oklch(24% 0.018 262 / 0.07);
		--radius: 14px;
		--radius-sm: 9px;
		--maxw: 1200px;
		--mono: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace;
		--sans: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: oklch(17.5% 0.014 264);
			--bg-raised: oklch(21.5% 0.016 264);
			--bg-sunken: oklch(14.5% 0.012 264);
			--border: oklch(29% 0.016 264);
			--border-strong: oklch(38% 0.018 264);
			--text: oklch(94% 0.006 260);
			--text-soft: oklch(75% 0.012 260);
			--text-faint: oklch(63% 0.014 260);
			--accent: oklch(79% 0.13 235);
			--accent-hover: oklch(88% 0.1 235);
			--accent-wash: oklch(27% 0.05 250);
			--good: oklch(76% 0.14 155);
			--bad: oklch(72% 0.15 25);
			--warn-wash: oklch(25% 0.04 90);
			--warn-border: oklch(44% 0.08 88);
			--code-bg: oklch(12.5% 0.012 264);
			--code-text: oklch(90% 0.008 260);
			--shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.35);
			--shadow: 0 1px 2px oklch(0% 0 0 / 0.3), 0 10px 28px oklch(0% 0 0 / 0.28);
		}
	}

	/* ═══════════ base ═══════════ */
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
		/* Keep anchored headings clear of the sticky header. */
		scroll-padding-top: 5.5rem;
		-webkit-text-size-adjust: 100%;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		font-family: var(--sans);
		line-height: 1.65;
		-webkit-font-smoothing: antialiased;
	}

	:global(:focus-visible) {
		border-radius: 4px;
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) {
			scroll-behavior: auto;
		}
	}

	/* Classes that arrive from message text — the library only forwards them. */
	:global(.cta-link) {
		font-weight: 700;
	}

	:global(.extra-class) {
		border-radius: 6px;
		background: var(--accent-wash);
		padding: 0.1em 0.45em;
		color: var(--accent);
	}

	:global(.lead) {
		color: var(--text-soft);
		font-size: 1.05em;
	}

	.wrap {
		margin-inline: auto;
		padding-inline: 1.25rem;
		max-width: var(--maxw);
	}

	h1,
	h2,
	h3 {
		margin: 0;
		line-height: 1.22;
		letter-spacing: -0.022em;
		text-wrap: balance;
	}

	p {
		margin: 0 0 1rem;
		max-width: 68ch;
		text-wrap: pretty;
	}

	a {
		color: var(--accent);
		text-decoration-thickness: from-font;
		text-underline-offset: 3px;
	}

	a:hover {
		color: var(--accent-hover);
	}

	code {
		font-family: var(--mono);
		font-size: 0.86em;
	}

	/* Inline code inside prose. */
	.doc p code,
	.doc li code,
	td code,
	.demo-tag code {
		border: 1px solid var(--border);
		border-radius: 5px;
		background: var(--bg-sunken);
		padding: 0.08em 0.34em;
		color: var(--text);
		white-space: nowrap;
	}

	/* ═══════════ skip link ═══════════ */
	.skip {
		position: fixed;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 100;
		transform: translateY(-250%);
		border-radius: var(--radius-sm);
		background: var(--bg-raised);
		box-shadow: var(--shadow);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
	}

	.skip:focus {
		transform: translateY(0);
	}

	/* ═══════════ topbar ═══════════ */
	.topbar {
		position: sticky;
		top: 0;
		z-index: 50;
		border-bottom: 1px solid var(--border);
		background: color-mix(in oklab, var(--bg) 80%, transparent);
		backdrop-filter: blur(12px);
	}

	.topbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 0.7rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		min-width: 0;
		color: inherit;
		text-decoration: none;
	}

	.brand-mark {
		display: grid;
		place-items: center;
		flex: none;
		border: 1px solid var(--border-strong);
		border-radius: 10px;
		background: var(--accent-wash);
		width: 2.1rem;
		height: 2.1rem;
		color: var(--accent);
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.brand-text strong {
		font-family: var(--mono);
		font-size: 0.94rem;
		letter-spacing: -0.01em;
	}

	.brand-sub {
		color: var(--text-faint);
		font-size: 0.77rem;
		line-height: 1.3;
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.locales {
		display: flex;
		gap: 2px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--bg-sunken);
		padding: 3px;
	}

	.locales a {
		border-radius: 999px;
		padding: 0.2rem 0.62rem;
		color: var(--text-soft);
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.locales a:hover {
		background: var(--bg-raised);
		color: var(--text);
	}

	.locales a[aria-current='true'] {
		background: var(--bg-raised);
		box-shadow: var(--shadow-sm);
		color: var(--accent);
	}

	.btn-github {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--bg-raised);
		padding: 0.4rem 0.9rem;
		color: var(--text);
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			border-color 150ms ease,
			transform 150ms ease;
	}

	.btn-github:hover {
		transform: translateY(-1px);
		border-color: var(--accent);
		color: var(--text);
	}

	.btn-github svg {
		width: 1.05rem;
		height: 1.05rem;
	}

	@media (max-width: 640px) {
		.brand-sub,
		.btn-github span {
			display: none;
		}
	}

	/* ═══════════ hero ═══════════ */
	.hero {
		border-bottom: 1px solid var(--border);
		background:
			radial-gradient(70rem 26rem at 15% -20%, var(--accent-wash), transparent 70%), var(--bg);
	}

	.hero-inner {
		padding-block: clamp(3rem, 8vw, 5.5rem) clamp(2.5rem, 6vw, 4rem);
	}

	.eyebrow {
		margin: 0 0 0.9rem;
		color: var(--accent);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	h1 {
		max-width: 22ch;
		font-size: clamp(2.1rem, 5.5vw, 3.4rem);
		font-weight: 800;
	}

	h1 em {
		background: linear-gradient(transparent 62%, var(--accent-wash) 62%);
		font-style: italic;
	}

	.lede {
		margin-top: 1.2rem;
		max-width: 60ch;
		color: var(--text-soft);
		font-size: clamp(1.02rem, 1.6vw, 1.18rem);
	}

	.hero-code {
		margin-top: 1.75rem;
		max-width: 34rem;
	}

	.hero-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 1.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--bg-raised);
		padding: 0.55rem 1.15rem;
		color: var(--text);
		font-size: 0.92rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			transform 150ms ease,
			border-color 150ms ease;
	}

	.btn:hover {
		transform: translateY(-1px);
		border-color: var(--accent);
		color: var(--text);
	}

	.btn-primary {
		border-color: transparent;
		background: var(--accent);
		color: oklch(100% 0 0);
	}

	.btn-primary:hover {
		border-color: transparent;
		background: var(--accent-hover);
		color: oklch(100% 0 0);
	}

	@media (prefers-color-scheme: dark) {
		.btn-primary,
		.btn-primary:hover {
			color: oklch(16% 0.02 264);
		}
	}

	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 2rem 0 0;
		padding: 0;
		list-style: none;
	}

	.pills li {
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--bg-raised);
		padding: 0.28rem 0.8rem;
		color: var(--text-soft);
		font-size: 0.82rem;
	}

	.pills code {
		color: var(--text);
	}

	/* ═══════════ shell / toc ═══════════ */
	.shell {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		padding-block: 3rem;
	}

	.toc {
		display: none;
	}

	@media (min-width: 1040px) {
		.shell {
			grid-template-columns: 15rem minmax(0, 1fr);
			align-items: start;
		}

		.toc {
			display: block;
			position: sticky;
			top: 5.5rem;
		}
	}

	.toc-title {
		margin: 0 0 0.7rem;
		color: var(--text-faint);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.toc nav {
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--border);
	}

	.toc nav a {
		padding: 0.32rem 0 0.32rem 0.85rem;
		margin-left: -1px;
		border-left: 2px solid transparent;
		color: var(--text-soft);
		font-size: 0.88rem;
		text-decoration: none;
	}

	.toc nav a:hover {
		border-left-color: var(--accent);
		color: var(--accent);
	}

	/* ═══════════ doc sections ═══════════ */
	.doc section {
		padding-block: 2.25rem;
		border-top: 1px solid var(--border);
	}

	.doc section:first-child {
		padding-top: 0;
		border-top: 0;
	}

	.doc h2 {
		margin-bottom: 1rem;
		font-size: clamp(1.5rem, 3vw, 1.95rem);
		font-weight: 750;
	}

	.doc h3 {
		margin: 2rem 0 0.7rem;
		font-size: 1.08rem;
		font-weight: 700;
	}

	.bullets,
	.ordered {
		margin: 0 0 1.1rem;
		padding-left: 1.35rem;
		max-width: 68ch;
	}

	.bullets li,
	.ordered li {
		margin-bottom: 0.35rem;
	}

	.bullets li::marker,
	.ordered li::marker {
		color: var(--text-faint);
	}

	.note {
		margin-top: -0.35rem;
		color: var(--text-faint);
		font-size: 0.9rem;
	}

	/* ═══════════ code ═══════════ */
	.code {
		overflow: hidden;
		margin-bottom: 1.15rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--code-bg);
	}

	.code-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid oklch(100% 0 0 / 0.08);
		padding: 0.4rem 0.75rem;
		color: oklch(72% 0.01 260);
		font-family: var(--mono);
		font-size: 0.74rem;
		letter-spacing: 0.02em;
	}

	.code-bar button {
		border: 1px solid oklch(100% 0 0 / 0.16);
		border-radius: 6px;
		background: transparent;
		padding: 0.15rem 0.55rem;
		color: oklch(85% 0.01 260);
		font-family: inherit;
		font-size: 0.72rem;
		cursor: pointer;
		transition: background 120ms ease;
	}

	.code-bar button:hover {
		background: oklch(100% 0 0 / 0.1);
	}

	.code pre {
		overflow-x: auto;
		margin: 0;
		padding: 0.9rem 1rem;
		color: var(--code-text);
		font-family: var(--mono);
		font-size: 0.82rem;
		line-height: 1.62;
		tab-size: 2;
	}

	.code pre code {
		font-size: inherit;
	}

	/* ═══════════ demo cards ═══════════ */
	.demo {
		overflow: hidden;
		margin-bottom: 1.4rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-raised);
		box-shadow: var(--shadow-sm);
	}

	.demo .code {
		margin: 0;
		border: 0;
		border-radius: 0;
	}

	.demo-out {
		border-top: 1px solid var(--border);
		padding: 1rem 1.15rem 1.15rem;
	}

	.demo-out.two {
		display: grid;
		gap: 1.25rem;
	}

	@media (min-width: 720px) {
		.demo-out.two {
			grid-template-columns: 1fr 1fr;
			gap: 1.5rem;
		}
	}

	.demo-tag {
		display: block;
		margin-bottom: 0.5rem;
		color: var(--text-faint);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.demo-tag code {
		font-size: 0.86em;
		letter-spacing: 0;
		text-transform: none;
	}

	.rendered {
		color: var(--text);
	}

	.rendered :global(p:first-child) {
		margin-top: 0;
	}

	.rendered :global(p:last-child) {
		margin-bottom: 0;
	}

	.link-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.1rem;
	}

	/* ═══════════ before / after split ═══════════ */
	.split {
		display: grid;
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}

	@media (min-width: 720px) {
		.split {
			grid-template-columns: 1fr 1fr;
			gap: 1.5rem;
		}
	}

	.split-col {
		min-width: 0;
	}

	.split-label {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-bottom: 0.6rem;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}

	.split-label::before {
		border-radius: 999px;
		width: 0.5rem;
		height: 0.5rem;
		content: '';
	}

	.split-label.bad {
		color: var(--bad);
	}

	.split-label.bad::before {
		background: var(--bad);
	}

	.split-label.good {
		color: var(--good);
	}

	.split-label.good::before {
		background: var(--good);
	}

	/* ═══════════ steps ═══════════ */
	.steps {
		margin: 0;
		padding: 0;
		list-style: none;
		counter-reset: step;
	}

	.steps > li {
		position: relative;
		margin-bottom: 1.75rem;
		padding-left: 2.9rem;
		counter-increment: step;
	}

	.steps > li::before {
		position: absolute;
		top: 0.05rem;
		left: 0;
		display: grid;
		place-items: center;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--accent-wash);
		width: 1.9rem;
		height: 1.9rem;
		color: var(--accent);
		font-size: 0.85rem;
		font-weight: 700;
		content: counter(step);
	}

	.steps h3 {
		margin: 0.1rem 0 0.5rem;
		font-size: 1.05rem;
	}

	/* ═══════════ tables ═══════════ */
	.table-scroll {
		overflow-x: auto;
		margin-bottom: 1.4rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 0.89rem;
	}

	th,
	td {
		padding: 0.55rem 0.8rem;
		text-align: left;
		vertical-align: top;
	}

	thead th {
		position: sticky;
		top: 0;
		border-bottom: 1px solid var(--border);
		background: var(--bg-sunken);
		color: var(--text-soft);
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	tbody tr + tr td {
		border-top: 1px solid var(--border);
	}

	tbody tr:hover td {
		background: var(--bg-sunken);
	}

	.tags td:first-child code {
		color: var(--accent);
		font-weight: 600;
	}

	code.el {
		border: 0;
		background: none;
		padding: 0;
		color: var(--text-soft);
		white-space: nowrap;
	}

	.dash {
		color: var(--text-faint);
	}

	.tick {
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.tick.no {
		background: color-mix(in oklab, var(--good) 16%, transparent);
		color: var(--good);
	}

	.tick.yes {
		background: var(--bg-sunken);
		color: var(--text-soft);
	}

	/* ═══════════ callouts ═══════════ */
	.callout {
		margin: 1.4rem 0;
		border: 1px solid var(--border);
		border-left: 3px solid var(--accent);
		border-radius: var(--radius-sm);
		background: var(--bg-sunken);
		padding: 0.95rem 1.1rem;
	}

	.callout p {
		margin: 0;
	}

	.callout.warn {
		border-color: var(--warn-border);
		border-left-color: var(--warn-border);
		background: var(--warn-wash);
	}

	/* ═══════════ cards ═══════════ */
	.cards {
		display: grid;
		gap: 1rem;
		margin: 1.5rem 0;
	}

	@media (min-width: 720px) {
		.cards {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--bg-raised);
		padding: 1.1rem;
	}

	.card h3 {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.card p {
		margin: 0;
		color: var(--text-soft);
		font-size: 0.9rem;
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 2rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-sunken);
		padding: 1.4rem 1.5rem;
	}

	.cta p {
		margin: 0;
		font-weight: 600;
	}

	/* ═══════════ demo-local renderer styles ═══════════ */
	.badge {
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--accent-wash);
		padding: 0.1em 0.6em;
		color: var(--accent);
		font-size: 0.82em;
		font-weight: 600;
	}

	.shouty {
		color: var(--accent);
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	/* ═══════════ footer ═══════════ */
	.sitefooter {
		border-top: 1px solid var(--border);
		background: var(--bg-sunken);
	}

	.sitefooter-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem 2rem;
		padding-block: 2.5rem 3rem;
		color: var(--text-soft);
		font-size: 0.9rem;
	}

	.sitefooter-inner p {
		margin: 0;
	}

	.sitefooter-inner nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
	}
</style>
