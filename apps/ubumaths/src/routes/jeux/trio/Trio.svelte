<script lang="ts">
	import Tile from './Tile.svelte'
	import IconMult from '$lib/icones/IconMult.svelte'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'
	import IconQuestion from '../../../lib/icones/IconQuestion.svelte'

	export let size = 6

	type Cell = {
		n: number
		status: string
	}

	type Position = {
		i: number
		j: number
	}

	type Grid = Cell[][]
	type Target = {
		op: string
		value: number
		positions: Position[]
	}

	let classCorrection =
		'flex justify-center items-center mx-4 my-2 w-20 h-20 text-3xl '
	let classWin =
		'flex justify-center items-center mx-4 my-2 w-20 h-20 variant-filled-success text-3xl '
	let classLost =
		'flex justify-center items-center mx-4 my-2 w-20 h-20 variant-filled-error text-3xl '
	let tileClass = `w-max grid grid-cols-6 gap-4 my-6`
	let grid: Grid = []
	let target: Target = {
		positions: [],
		op: Math.random() < 0.5 ? '+' : '-',
		value: -1,
	}
	let result
	let op = '+'
	let win = false
	let selecteds: Position[] = []

	for (let n = 0; n < size * size; n++) {
		const i = Math.floor(n / size) // la ligne
		const j = n % size // la colonne

		if (j === 0) {
			grid[i] = []
		}
		grid[i][j] = {
			status: '',
			n: Math.floor(Math.random() * 9 + 1),
		}
	}

	choseTarget()

	function showSolution() {
		win = true
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				grid[i][j].status = 'not_available'
			}
		}
		selecteds = [...target.positions]
		selecteds.forEach((selected) => {
			grid[selected.i][selected.j].status = 'selected'
		})
		op = target.op
	}

	function toggleOp() {
		op = op === '+' ? '-' : '+'
	}

	function handleClick(i: number, j: number) {
		result = null
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				grid[i][j].status = ''
			}
		}

		// si on clique sur une case déjà sélectionnée
		if (selecteds.some((selected) => selected.j === j && selected.i === i)) {
			selecteds = selecteds.filter(
				(selected) => !(selected.j === j && selected.i === i),
			)
		} else if (selecteds.length < 3) {
			selecteds.push({ i, j })
			selecteds = selecteds
		}

		if (selecteds.length === 2) {
			const min_i = Math.min(selecteds[0].i, selecteds[1].i)
			const max_i = Math.max(selecteds[0].i, selecteds[1].i)
			const min_j = Math.min(selecteds[0].j, selecteds[1].j)
			const max_j = Math.max(selecteds[0].j, selecteds[1].j)

			for (let i = 0; i < size; i++) {
				for (let j = 0; j < size; j++) {
					if (
						!(
							// il y a un trou
							(
								(min_j < j && j < max_j && min_i < i && i < max_i) ||
								(min_j === max_j && j === min_j && min_i < i && i < max_i) ||
								(min_i === max_i && i === min_i && min_j < j && j < max_j) ||
								// pas de trou
								// les éléments se suivent sous la même progression

								(max_j - min_j <= 1 &&
									max_i - min_i <= 1 &&
									((selecteds[0].j - j === selecteds[1].j - selecteds[0].j &&
										selecteds[0].i - i === selecteds[1].i - selecteds[0].i) ||
										(j - selecteds[1].j === selecteds[1].j - selecteds[0].j &&
											i - selecteds[1].i === selecteds[1].i - selecteds[0].i)))
							)
						)
					) {
						grid[i][j].status = 'not_available'
					}
				}
			}
		} else if (selecteds.length === 1) {
			const selected = selecteds[0]
			for (let i = 0; i < size; i++) {
				for (let j = 0; j < size; j++) {
					if (
						!(
							Math.abs(selected.i - i) <= 2 &&
							Math.abs(selected.j - j) <= 2 &&
							(selected.j === j ||
								selected.i === i ||
								Math.abs(selected.j - j) === Math.abs(selected.i - i))
						)
					) {
						grid[i][j].status = 'not_available'
					}
				}
			}
		} else if (selecteds.length === 3) {
			for (let i = 0; i < size; i++) {
				for (let j = 0; j < size; j++) {
					grid[i][j].status = 'not_available'
				}
			}
			const number1 = grid[selecteds[0].i][selecteds[0].j].n
			const number2 = grid[selecteds[1].i][selecteds[1].j].n
			const number3 = grid[selecteds[2].i][selecteds[2].j].n
			result =
				op === '+' ? number1 * number2 + number3 : number1 * number2 - number3
		}

		selecteds.forEach((selected) => {
			grid[selected.i][selected.j].status = 'selected'
		})

		if (result && result === target.value) {
			win = true
		}
	}

	function choseTarget() {
		win = false

		do {
			target = {
				positions: [],
				op: Math.random() < 0.5 ? '+' : '-',
				value: -1,
			}
			let i = Math.floor(Math.random() * size)
			let j = Math.floor(Math.random() * size)
			target.positions.push({ i, j })
			let direction
			for (let count = 0; count < 2; count++) {
				const directions = []
				if (i > 0 && j > 0) {
					directions.push('up-left')
				}
				if (i > 0) {
					directions.push('up')
				}
				if (i > 0 && j < size - 1) {
					directions.push('up-right')
				}
				if (j > 0) {
					directions.push('left')
				}
				if (j < size - 1) {
					directions.push('right')
				}
				if (i < size - 1 && j > 0) {
					directions.push('down-left')
				}
				if (i < size - 1) {
					directions.push('down')
				}
				if (i < size - 1 && j < size - 1) {
					directions.push('down-right')
				}
				if (directions.length !== 0) {
					direction =
						direction ||
						directions[Math.floor(Math.random() * directions.length)]

					//  il faut vérifier que la dernière direction est toujours possible
					if (directions.includes(direction)) {
						switch (direction) {
							case 'up-left':
								i--
								j--
								break
							case 'up':
								i--
								break
							case 'up-right':
								i--
								j++
								break
							case 'left':
								j--
								break
							case 'right':
								j++
								break
							case 'down-left':
								i++
								j--
								break
							case 'down':
								i++
								break
							case 'down-right':
								i++
								j++
								break
						}
						target.positions.push({ i, j })
					}
				}
			}
			if (target.positions.length === 3) {
				const number1 = grid[target.positions[0].i][target.positions[0].j].n

				const number2 = grid[target.positions[1].i][target.positions[1].j].n

				const number3 = grid[target.positions[2].i][target.positions[2].j].n

				target.value =
					target.op === '+'
						? number1 * number2 + number3
						: number1 * number2 - number3
			} else {
				target.value = -1
			}
		} while (target.value < 0)
	}
</script>

<div class="flex">
	<div class="flex flex-col justify-center mx-12">
		<span
			class={classCorrection +
				(selecteds.length >= 1
					? ' variant-filled-primary'
					: ' variant-filled-surface')}
		>
			{#if selecteds.length >= 1}
				{grid[selecteds[1].i][selecteds[1].j].n}
			{:else}
				<IconQuestion />
			{/if}
		</span>
		<span class={classCorrection}>
			<IconMult />
		</span>

		<span
			class={classCorrection +
				(selecteds.length >= 2
					? 'variant-filled-primary'
					: 'variant-filled-surface')}
		>
			{#if selecteds.length >= 2}
				{grid[selecteds[1].i][selecteds[1].j].n}
			{:else}
				<IconQuestion />
			{/if}
		</span>
		<span on:keydown={() => {}} on:click={toggleOp} class={classCorrection}>
			{#if op === '+'}
				<IconPlus />
			{:else}
				<IconMinus />
			{/if}
		</span>
		<span
			class={classCorrection +
				(selecteds.length >= 3
					? 'variant-filled-primary'
					: 'variant-filled-surface')}
		>
			{#if selecteds.length === 3}
				{grid[selecteds[2].i][selecteds[2].j].n}
			{:else}
				<IconQuestion />
			{/if}
		</span>
		<span class={classCorrection}> = </span>
		<span class={win ? classWin : classLost}>
			{target && target.value}
		</span>
	</div>
	<div class="flex flex-col items-center">
		<div class={tileClass}>
			{#each grid as row, i}
				{#each row as cell, j}
					<Tile
						n={cell.n}
						on:click={() => handleClick(i, j)}
						status={cell.status}
					/>
				{/each}
			{/each}
		</div>
	</div>
	<div class="flex flex-col justify-center ml-12">
		<button class="my-4 btn variant-filled-primary" on:click={choseTarget}
			>Nouvelle cible</button
		>

		<button class="my-4 btn variant-filled-primary" on:click={showSolution}
			>Solution</button
		>
	</div>
</div>
