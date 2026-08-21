import { describe, expect, it } from 'vitest';
import {
	integerOption,
	isFlagSet,
	listItemValue,
	mergeClasses,
	optionClass,
	optionText,
	orderedListAttributes,
	orderedListType,
	ORDERED_LIST_TYPES
} from '$lib/index.js';

describe('optionText', () => {
	it('keeps strings and finite numbers', () => {
		expect(optionText('hello')).toBe('hello');
		expect(optionText('')).toBe('');
		expect(optionText(42)).toBe('42');
		expect(optionText(0)).toBe('0');
	});

	it('discards values that are not usable as text', () => {
		expect(optionText(undefined)).toBeUndefined();
		expect(optionText(null)).toBeUndefined();
		expect(optionText(true)).toBeUndefined();
		expect(optionText(Number.NaN)).toBeUndefined();
		expect(optionText(Number.POSITIVE_INFINITY)).toBeUndefined();
		expect(optionText({ toString: () => 'nope' })).toBeUndefined();
	});
});

describe('optionClass', () => {
	it('reads class and className', () => {
		expect(optionClass({ class: 'cta' })).toBe('cta');
		expect(optionClass({ className: 'cta' })).toBe('cta');
	});

	it('prefers class over className', () => {
		expect(optionClass({ class: 'first', className: 'second' })).toBe('first');
	});

	it('is undefined when the message supplied none', () => {
		expect(optionClass({})).toBeUndefined();
		expect(optionClass({ class: false })).toBeUndefined();
	});
});

describe('mergeClasses', () => {
	it('joins the values it was given', () => {
		expect(mergeClasses('font-semibold', 'cta')).toBe('font-semibold cta');
	});

	it('skips empty parts and collapses whitespace', () => {
		expect(mergeClasses(undefined, '  a   b ', '', 'c')).toBe('a b c');
	});

	it('does not repeat a class', () => {
		expect(mergeClasses('underline', 'underline extra')).toBe('underline extra');
	});

	it('is undefined when nothing is left, so the attribute is omitted', () => {
		expect(mergeClasses()).toBeUndefined();
		expect(mergeClasses(undefined, '   ')).toBeUndefined();
	});
});

describe('isFlagSet', () => {
	it('treats a bare @flag as set', () => {
		expect(isFlagSet({ newtab: true }, 'newtab')).toBe(true);
	});

	it('treats a missing flag as unset', () => {
		expect(isFlagSet({}, 'newtab')).toBe(false);
	});

	it('reads a valued flag as an HTML-style boolean', () => {
		expect(isFlagSet({ newtab: 'yes' }, 'newtab')).toBe(true);
		expect(isFlagSet({ newtab: 'true' }, 'newtab')).toBe(true);
		expect(isFlagSet({ newtab: 'false' }, 'newtab')).toBe(false);
		expect(isFlagSet({ newtab: 'FALSE' }, 'newtab')).toBe(false);
		expect(isFlagSet({ newtab: '0' }, 'newtab')).toBe(false);
		expect(isFlagSet({ newtab: '   ' }, 'newtab')).toBe(false);
	});
});

describe('integerOption', () => {
	it('accepts integers written as text', () => {
		expect(integerOption('3')).toBe(3);
		expect(integerOption('0')).toBe(0);
		expect(integerOption('-7')).toBe(-7);
		expect(integerOption('+5')).toBe(5);
		expect(integerOption(' 12 ')).toBe(12);
	});

	it('accepts numbers interpolated from message inputs', () => {
		expect(integerOption(9)).toBe(9);
	});

	it('rejects anything that is not a safe integer', () => {
		expect(integerOption('abc')).toBeUndefined();
		expect(integerOption('not-a-number')).toBeUndefined();
		expect(integerOption('3.5')).toBeUndefined();
		expect(integerOption('3px')).toBeUndefined();
		expect(integerOption(1.5)).toBeUndefined();
		expect(integerOption(Number.NaN)).toBeUndefined();
		expect(integerOption(Number.MAX_SAFE_INTEGER + 2)).toBeUndefined();
		expect(integerOption(undefined)).toBeUndefined();
		expect(integerOption(true)).toBeUndefined();
	});
});

describe('orderedListType', () => {
	it('accepts every numbering type HTML allows', () => {
		expect(ORDERED_LIST_TYPES).toEqual(['1', 'a', 'A', 'i', 'I']);
		for (const type of ORDERED_LIST_TYPES) {
			expect(orderedListType(type)).toBe(type);
		}
	});

	it('rejects values HTML does not allow', () => {
		expect(orderedListType('z')).toBeUndefined();
		expect(orderedListType('2')).toBeUndefined();
		expect(orderedListType('')).toBeUndefined();
		expect(orderedListType(undefined)).toBeUndefined();
	});
});

describe('orderedListAttributes', () => {
	it('reads start, type and @reversed together', () => {
		expect(orderedListAttributes({ start: '3', type: 'a' }, { reversed: true })).toEqual({
			start: 3,
			type: 'a',
			reversed: true
		});
	});

	it('drops invalid values instead of forwarding them to the DOM', () => {
		expect(orderedListAttributes({ start: 'abc', type: 'z' }, {})).toEqual({
			start: undefined,
			type: undefined,
			reversed: false
		});
	});
});

describe('listItemValue', () => {
	it('reads value as a number', () => {
		expect(listItemValue({ value: '5' })).toBe(5);
	});

	it('ignores a value that is not a number', () => {
		expect(listItemValue({ value: 'not-a-number' })).toBeUndefined();
		expect(listItemValue({})).toBeUndefined();
	});
});
