<script lang="ts">
	const radius_wheel = 50
	const thick = radius_wheel - 10
	const radius_pie = radius_wheel - thick / 2

	export let names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
	const size = names.length
	const piece_angle = (2 * Math.PI) / size
	let deg = 0
	let spinning = false
	let wheel: SVGElement

	function onTransitionEnd() {
		spinning = false
		wheel.style.transition = 'none'
		deg = deg % 360
		wheel.style.transform = `rotate(${deg}deg)`
	}
</script>

<button
	class="btn variant-filled-primary"
	on:click={() => {
		deg = 3000 + Math.floor(Math.random() * 360)

		wheel.style.transition = 'all 4s ease-out'
		wheel.style.transform = `rotate(${deg}deg)`
		spinning = true
	}}
>
	spin
</button>
{#if size % 2 === 0}
	<svg
		bind:this={wheel}
		on:transitionend={onTransitionEnd}
		class="spin"
		class:blur={spinning}
		style:--new-position="{deg}deg"
		height={2 * radius_wheel}
		width={2 * radius_wheel}
		viewBox="0 0 {2 * radius_wheel} {2 * radius_wheel}"
	>
		<circle r={radius_wheel} cx={radius_wheel} cy={radius_wheel} fill="white" />
		<circle
			r={radius_pie}
			cx={radius_wheel}
			cy={radius_wheel}
			fill="transparent"
			stroke="red"
			stroke-width={thick}
			stroke-dasharray="{piece_angle * radius_pie} {piece_angle * radius_pie}"
		/>
		{#each names as name, i}
			<text
				x={radius_wheel + 20}
				y="50%"
				dominant-baseline="middle"
				transform="rotate({((i + 1 / 2) * 360) /
					size} {radius_wheel} {radius_wheel} )">{name}</text
			>
		{/each}
	</svg>
{:else}
	ruie
{/if}

<style>
	.blur {
		animation: blur 4s;
	}

	@keyframes blur {
		0% {
			filter: blur(0px);
		}
		10% {
			filter: blur(1px);
		}
		90% {
			filter: blur(0px);
		}
		100% {
			filter: blur(0px);
		}
	}
</style>
