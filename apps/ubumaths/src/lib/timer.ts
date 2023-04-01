import type { Time } from '../types/type'
import { convertToTime } from './utils'

export function createTimer({
	delay, // en secondes
	tick, // tick toutes les 10 ms
	top, //donne le top toutes les secondes
	timeout,
}: {
	delay: number
	tick?: (remaining: number) => void // en ms
	top?: (remaining: number) => any // en s
	timeout: () => any
}) {
	let ticker_10ms: NodeJS.Timer | null
	let ticker_1s: NodeJS.Timer | null
	let status = 'done'
	let remaining = delay * 1000 // en ms
	let remainingSeconds = delay
	let time = convertToTime(remaining)

	function tick_1s() {
		remainingSeconds -= 1
		if (remainingSeconds < 0) {
			status = 'done'
			if (ticker_10ms) clearInterval(ticker_10ms)
			if (ticker_1s) clearInterval(ticker_1s)
			timeout()
		} else {
			if (top) top(remainingSeconds)
		}
	}

	function tick_10ms() {
		remaining -= 10
		if (remaining < 0) {
			status = 'done'
			if (ticker_10ms) clearInterval(ticker_10ms)
			if (ticker_1s) clearInterval(ticker_1s)
			timeout()
		} else {
			time = convertToTime(remaining)
			if (tick) tick(remaining)
		}
	}

	const timer = {
		status() {
			return status
		},
		start() {
			if (status === 'done') {
				remaining = delay * 1000
				time = convertToTime(remaining)
				if (ticker_10ms) clearInterval(ticker_10ms)
				ticker_10ms = setInterval(tick_10ms, 10)
				if (ticker_1s) clearInterval(ticker_1s)
				ticker_1s = setInterval(tick_1s, 1000)
				status = 'running'
			}
		},
		pause() {
			if (status === 'running') {
				status = 'paused'
				if (ticker_10ms) clearInterval(ticker_10ms)
				if (ticker_1s) clearInterval(ticker_1s)
				ticker_10ms = null
				ticker_1s = null
			}
		},
		stop() {
			if (status === 'running') {
				if (ticker_10ms) clearInterval(ticker_10ms)
				if (ticker_1s) clearInterval(ticker_1s)
				ticker_10ms = null
				ticker_1s = null
				status = 'done'
			}
		},
		resume() {
			if (status === 'paused') {
				ticker_10ms = setInterval(tick_10ms, 10)
				ticker_1s = setInterval(tick_1s, 1000)
				status = 'running'
			}
		},
		changeDelay(newDelay: number) {
			remainingSeconds = remainingSeconds + newDelay - delay
			remaining = remaining + (newDelay - delay) * 1000
			delay = newDelay
		},

		getTime() {
			return time
		},

		getSeconds() {
			return remaining
		},
	}
	return timer
}
