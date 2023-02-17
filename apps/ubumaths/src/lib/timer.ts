import type { Time } from './type'
import { convertToTime } from './utils'

export function createTimer(
	delay: number,
	tick: (remaining: number) => any,
	timeout: () => void,
) {
	let ticker: NodeJS.Timer | null
	let status = 'done'
	let remaining = delay
	let time = convertToTime(remaining)

	const callback = () => {
		remaining -= 1
		if (remaining < 0) {
			status = 'done'
			if (ticker) clearInterval(ticker)
			timeout()
		} else {
			time = convertToTime(remaining)
			tick(remaining)
		}
	}

	const timer = {
		status() {
			return status
		},
		start() {
			remaining = delay
			time = convertToTime(remaining)
			if (ticker) clearInterval(ticker)
			ticker = setInterval(callback, 1000)
			status = 'running'
		},
		pause() {
			if (status === 'running') {
				status = 'paused'
				clearInterval(ticker!)
				ticker = null
			}
		},
		stop() {
			if (status === 'running') {
				clearInterval(ticker!)
				ticker = null
				status = 'done'
			}
		},
		resume() {
			if (status === 'paused') {
				ticker = setInterval(callback, 1000)
				status = 'running'
			}
		},
		changeDelay(newDelay: number) {
			remaining = remaining + newDelay - delay
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
