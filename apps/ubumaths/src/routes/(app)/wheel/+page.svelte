<script lang="ts">
	import marker from '$lib/images/marker.png'
	const radius_wheel = 20
	const thick = radius_wheel - 3
	const radius_pie = radius_wheel - thick / 2
	let winner = ''

	export let names = [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'i',
		'j',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'q',
		'r',
		's',
		'u',
		'v',
		'w',
		'x',
		'y',
	]
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
	disabled={spinning}
	class="btn variant-filled-primary"
	on:click={() => {
        let number = 0
        do {
            number = Math.floor(Math.random() * 360) + 1
        } while (number % size !== 0)
        }
        const number = Math.floor(Math.random() * 360) + 1
		deg = 360 * 9 + 

		wheel.style.transition = 'all 4s ease-out'
		wheel.style.transform = `rotate(${deg}deg)`
		spinning = true
	}}
>
	spin
</button>
<div class="relative inline-block">
	{#if size % 2 === 0}
		<svg
			bind:this={wheel}
			on:transitionend={onTransitionEnd}
			class="spin"
			class:blur={spinning}
			style:--new-position="{deg}deg"
			height="{2 * radius_wheel + 3}em"
			width="{2 * radius_wheel + 3}em"
		>
			<defs>
				<filter id="shadow">
					<feDropShadow dx="0" dy="0" stdDeviation="10" />
				</filter>
				<filter id="shadow2">
					<feDropShadow dx="0" dy="0" stdDeviation="5" />
				</filter>
			</defs>
			<circle r="{radius_wheel}em" cx="50%" cy="50%" fill="#e7c9de" />
			<circle
				r="{radius_pie}em"
				cx="50%"
				cy="50%"
				fill="transparent"
				stroke="#3a507e"
				stroke-width="{thick}em"
				stroke-dasharray="{piece_angle * radius_pie}em {piece_angle *
					radius_pie}em"
			/>
			<circle
				r="{radius_wheel - 1}em"
				cx="50%"
				cy="50%"
				fill="transparent"
				stroke="#788bb2"
				stroke-width="2em"
				filter="url(#shadow)"
			/>
			<circle r="3em" cx="50%" cy="50%" fill="#788bb2" />
			<circle
				r="3em"
				cx="50%"
				cy="50%"
				fill="transparent"
				stroke="#f9ef69"
				stroke-width="0.5em"
				filter="url(#shadow2)"
			/>
			{#each Array(size * 3).fill(0) as _, i}
				<circle
					r="0.1em"
					cx="{2 * radius_wheel + 0.5}em"
					cy="50%"
					fill="#f9ef69"
					stroke="#f9ef69"
					stroke-width="0.5em"
					transform-origin="50% 50%"
					transform="rotate({(i * 360) / (size * 3)} )"
				/>
			{/each}
			{#each names as name, i}
				<text
					fill="white"
					font-weight="bold"
					x="{radius_wheel + 8}em"
					y="50%"
					dominant-baseline="middle"
					transform-origin="50% 50%"
					transform="rotate({((i + 1 / 2) * 360) / size} )">{name}</text
				>
			{/each}
		</svg>
	{:else}
		ruie
	{/if}
	<span class="absolute top-0 left-1/2" style="translate:-50% 0;">
		<img alt="marker" src={marker} />
	</span>
</div>

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
