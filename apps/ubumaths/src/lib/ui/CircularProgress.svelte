<script lang="ts">
	import { mdc_colors } from '$lib/colors'
	import { modeCurrent } from '@skeletonlabs/skeleton'
	import { get } from 'svelte/store'

	export let number: number
	export let percentage: number
	export let pulse = false
	export let size = 5

	let dashArray: number
	let dashOffset: number

	let gradient = [
		'#71db3f',
		'#79d837',
		'#81d52e',
		'#88d225',
		'#8ecf1b',
		'#95cc0d',
		'#9ac900',
		'#a0c600',
		'#a5c300',
		'#abbf00',
		'#b0bc00',
		'#b4b900',
		'#b9b500',
		'#bdb200',
		'#c2ae00',
		'#c6ab00',
		'#caa700',
		'#cea300',
		'#d19f00',
		'#d59c00',
		'#d89800',
		'#db9400',
		'#de9000',
		'#e18c00',
		'#e48700',
		'#e68300',
		'#e87f00',
		'#eb7b00',
		'#ed7601',
		'#ee720c',
		'#f06d15',
		'#f2691c',
		'#f36422',
		'#f46027',
		'#f55b2c',
		'#f55631',
		'#f65236',
		'#f64d3a',
		'#f6483f',
		'#f64343',
	]
	let color = gradient[0]

	$: radius = size / 3.5
	// Size of the enclosing square
	// SVG centers the stroke width on the radius, subtract out so circle fits in square
	//   const sqSize = sqSize

	// Arc length at 100% coverage is the circle circumference
	$: dashArray = radius * Math.PI * 2
	// Scale 100% coverage overlay with the actual percent
	$: dashOffset = dashArray - (dashArray * percentage) / 100

	$: color = gradient[Math.floor(((100 - percentage) / 100) * 40)]
	$: strokeWidth = size / 9

	$: pulseColor = $modeCurrent ? mdc_colors['red-500'] : mdc_colors['red-100']
</script>

<div
	style="position: relative;display: inline-block;text-align: center;color:black;--pulse-color:{pulseColor};"
>
	<svg width={`${size}em`} height={`${size}em`}>
		<circle
			class={pulse ? 'pulse' : 'nopulse'}
			cx="50%"
			cy="50%"
			r={`${radius}em`}
		/>
		<circle
			cx="50%"
			cy="50%"
			r={`${radius}em`}
			stroke="#ddd"
			fill="white"
			stroke-width={`${strokeWidth}em`}
		/>
		<circle
			class="circle-progress"
			cx="50%"
			cy="50%"
			r={`${radius}em`}
			fill="none"
			stroke={color}
			stroke-width={`${strokeWidth}em`}
			stroke-dasharray={`${dashArray}em`}
			stroke-dashoffset={`${dashOffset}em`}
		/>
	</svg>
	<div
		class="font-bold"
		style={`font-size:${
			size / 3
		}em;position: absolute;left: 50%;top: 50%;transform: translate(-50%, -60%);font-family:'pacifico'`}
	>
		{number}
	</div>
</div>

<style>
	.circle-progress {
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.nopulse {
		fill: none;
		opacity: 0;
	}

	.pulse {
		fill: var(--pulse-color);
		animation: pulse 1.5s infinite cubic-bezier(0.66, 0, 0, 1);
		transform-origin: 50% 50%;
		/*animation-duration: 1.5s;
  animation-name: pulse;
  animation-iteration-count: infinite; */
		/* border: 5px solid red */
	}

	@keyframes pulse {
		from {
			fill-opacity: 1;
			transform: scale(1);
			/* box-shadow: 0 0 0 0 rgba(232, 76, 61, 0.7); */
			/* stroke : blue */
		}
		to {
			fill-opacity: 0;
			transform: scale(1.8);
			/* box-shadow: 0 0 0 45px rgba(232, 76, 61, 0); */
			/* stroke: red */
		}
	}
	/* @keyframes pulse {to {box-shadow: 0 0 0 45px rgba(232, 76, 61, 0);}} */
</style>
