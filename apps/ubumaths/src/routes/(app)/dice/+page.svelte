<script lang="ts">
	import { Canvas } from '@threlte/core'
	import Scene from './Scene.svelte'
	import { spring } from 'svelte/motion'

	let k = { kx: 0, ky: 0, kz: 0 }

	function draw() {
		// random number between 1 and 6
		// const random = 3
		const random = Math.floor(Math.random() * 6) + 1
		console.log('random', random)
		if (random === 2) {
			return { kx: 0, ky: 0, kz: 0 }
		} else if (random === 1) {
			return { kx: 0, ky: 1, kz: 0 }
		} else if (random === 5) {
			return { kx: 0, ky: 2, kz: 0 }
		} else if (random === 6) {
			return { kx: 0, ky: 3, kz: 0 }
		} else if (random === 3) {
			return { kx: 0, ky: 0, kz: 1 }
		} else {
			return { kx: 0, ky: 0, kz: 3 }
		}
	}
</script>

<button
	class="btn variant-filled-primary"
	on:click={() => {
		k = draw()
	}}
>
	turn
</button>

<Canvas>
	<Scene {...k} />
</Canvas>
