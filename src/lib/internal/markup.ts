import type { MessageMarkupAttributes, MessageMarkupOptions } from '@inlang/paraglide-js-svelte';

/**
 * Reads a markup option as text.
 *
 * Option values are `unknown` because a message may interpolate an input into
 * them (`{#link href=$target}`). Anything that is not usable as text is
 * discarded rather than stringified.
 */
export function optionText(value: unknown): string | undefined {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		return String(value);
	}
	return undefined;
}

/** Classes a message supplied through `class=|...|` (or `className=|...|`). */
export function optionClass(options: MessageMarkupOptions): string | undefined {
	return optionText(options.class) ?? optionText(options.className);
}

/**
 * Combines a variant's own presentation classes with consumer classes.
 *
 * Returns `undefined` when nothing is left, so the `class` attribute is omitted
 * entirely instead of being rendered empty.
 */
export function mergeClasses(...values: readonly (string | undefined)[]): string | undefined {
	const classes = new Set<string>();

	for (const value of values) {
		if (!value) {
			continue;
		}
		for (const entry of value.trim().split(/\s+/)) {
			if (entry) {
				classes.add(entry);
			}
		}
	}

	return classes.size > 0 ? [...classes].join(' ') : undefined;
}

/**
 * Whether a markup flag such as `@newtab` is set.
 *
 * `@flag` compiles to `true`; `@flag=|value|` compiles to a string, so an
 * explicit `false`, `0` or empty value opts out and anything else opts in.
 */
export function isFlagSet(attributes: MessageMarkupAttributes, name: string): boolean {
	const value = attributes[name];

	if (value === true) {
		return true;
	}
	if (typeof value !== 'string') {
		return false;
	}

	const normalized = value.trim().toLowerCase();
	return normalized !== '' && normalized !== 'false' && normalized !== '0';
}

/**
 * Reads a markup option as an integer, or `undefined` when it is not one.
 *
 * Keeps non-numeric values out of numeric HTML attributes such as `<ol start>`
 * and `<li value>` instead of letting `NaN` reach the DOM.
 */
export function integerOption(value: unknown): number | undefined {
	if (typeof value === 'number') {
		return Number.isSafeInteger(value) ? value : undefined;
	}

	const text = optionText(value);
	if (text === undefined || !/^[+-]?\d+$/.test(text.trim())) {
		return undefined;
	}

	const parsed = Number(text.trim());
	return Number.isSafeInteger(parsed) ? parsed : undefined;
}

/** The numbering types HTML allows on `<ol type>`. */
export const ORDERED_LIST_TYPES = ['1', 'a', 'A', 'i', 'I'] as const;

/** A valid `<ol type>` value. */
export type OrderedListType = (typeof ORDERED_LIST_TYPES)[number];

/** Reads `type=|...|`, keeping only values HTML actually accepts. */
export function orderedListType(value: unknown): OrderedListType | undefined {
	const text = optionText(value);
	return ORDERED_LIST_TYPES.find((candidate) => candidate === text);
}

/** Attributes for an `<ol>`, derived from its markup options and flags. */
export type OrderedListAttributes = {
	start: number | undefined;
	type: OrderedListType | undefined;
	reversed: boolean;
};

/** Builds the `<ol>` attributes from `start=|..|`, `type=|..|` and `@reversed`. */
export function orderedListAttributes(
	options: MessageMarkupOptions,
	attributes: MessageMarkupAttributes
): OrderedListAttributes {
	return {
		start: integerOption(options.start),
		type: orderedListType(options.type),
		reversed: isFlagSet(attributes, 'reversed')
	};
}

/** Reads `value=|..|` for an `<li>` as a number. */
export function listItemValue(options: MessageMarkupOptions): number | undefined {
	return integerOption(options.value);
}
