// global store
import type { MathfieldElement } from 'tinymathlive'
import { writable, type Writable } from 'svelte/store'
import type { FormatToHtml } from './type'

export const touchDevice = writable(false)
export const mathliveReady = writable(false)
export const mathfieldElement: Writable<null | typeof MathfieldElement> =
	writable(null)
export const formatToHtml = writable(
	(o: FormatToHtml): NonNullable<FormatToHtml> => '',
)
export const toMarkup = writable((o: string) => o)
