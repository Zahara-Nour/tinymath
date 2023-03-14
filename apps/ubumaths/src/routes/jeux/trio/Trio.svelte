<script lang="ts">
	import Tile from './Tile.svelte'
	import IconMult from '$lib/icones/IconMult.svelte'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'
	import { beforeUpdate } from 'svelte'
	import IconHelp from '$lib/icones/IconHelp.svelte'

	export let size = 9

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

	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	let classCorrection =
		'flex justify-center items-center  rounded-lg p-6  mx-4  w-20 h-20 text-5xl font-bold '
	let classWin =
		'flex justify-center items-center  rounded-lg mx-4  w-20 h-20 variant-filled-success text-5xl font-bold '
	let classLost =
		'flex justify-center items-center rounded-lg mx-4  w-20 h-20 variant-filled-error text-5xl font-bold '

	let grid: Grid = []
	let target: Target = {
		positions: [],
		op: Math.random() < 0.5 ? '+' : '-',
		value: -1,
	}
	let result: number | null = null
	let op = '+'
	let win = false
	let selecteds: Position[] = []
	let tileClass = ''

	// $: {
	tileClass = `w-max grid grid-cols-10 gap-4 my-6`
	// }
	$: changeGrid(size)
	$: result = calculateValue(selecteds, op)

	function calculateValue(selecteds: Position[], op: string) {
		if (selecteds.length === 3) {
			const values = selecteds.map((selected) => grid[selected.i][selected.j].n)

			const value =
				values[0] * values[1] + (op === '+' ? values[2] : -values[2])
			if (value === target.value) {
				win = true
			}
			return value
		}
		return null
	}

	function changeGrid(size: number) {
		grid = []
		for (let i = 0; i < size; i++) {
			grid[i] = []
			for (let j = 0; j < size; j++) {
				grid[i][j] = {
					status: '',
					n: Math.floor(Math.random() * 9 + 1),
				}
			}
		}
		choseTarget()
	}

	function showSolution() {
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				grid[i][j].status = 'not_available'
			}
		}
		selecteds = [...target.positions]
		selecteds.forEach((selected, i) => {
			grid[selected.i][selected.j].status =
				i === 2 ? 'selected-third' : 'selected'
		})
		op = target.op
		result = target.value
		win = true
	}

	function toggleOp() {
		op = op === '+' ? '-' : '+'
	}

	function handleClick(i: number, j: number) {
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
		}

		selecteds.forEach((selected, i) => {
			grid[selected.i][selected.j].status =
				i === 2 ? 'selected-third' : 'selected'
		})
	}

	function choseTarget() {
		win = false
		result = null
		selecteds = []
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				grid[i][j].status = ''
			}
		}

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

<div class="flex justify-around">
	<div
		class="flex flex-col justify-center mx-12"
		style="font-family:'Baloo 2', sans-serif;"
	>
		<span
			class={classCorrection +
				(selecteds.length >= 1
					? ' variant-filled-primary'
					: ' variant-filled-surface')}
		>
			{#if selecteds.length >= 1}
				{grid[selecteds[0].i][selecteds[0].j].n}
			{:else}
				<IconHelp />
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
				<IconHelp />
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
					? 'variant-filled-secondary'
					: 'variant-filled-surface')}
		>
			{#if selecteds.length === 3}
				{grid[selecteds[2].i][selecteds[2].j].n}
			{:else}
				<IconHelp />
			{/if}
		</span>
		<span class={classCorrection}> = </span>

		{#if result}
			<span class={result === target.value ? classWin : classLost}>
				{result}
			</span>
		{:else}
			<span class={classCorrection + 'variant-filled-surface'}>
				<IconHelp />
			</span>
		{/if}
	</div>
	<div class="flex flex-col items-center">
		<div class={tileClass}>
			<div />
			{#each grid as _, i}
				<div
					class="btn h-20 w-20 size text-4xl flex items-center justify-center "
				>
					{letters[i]}
				</div>
			{/each}
			{#each grid as row, i}
				<div
					class="btn h-20 w-20 size text-4xl flex items-center justify-center "
				>
					{i + 1}
				</div>
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
	<div class="flex flex-col items-center justify-center ml-12">
		<button class="my-4 btn variant-filled-primary" on:click={choseTarget}
			>Nouvelle cible</button
		>

		<button class="my-4 btn variant-filled-primary" on:click={showSolution}
			>Solution</button
		>
		<button
			class="my-4 btn variant-filled-primary"
			on:click={() => changeGrid(size)}>Nouvelle grille</button
		>
		<div class="my-4 flex justify-center items-center">
			<button
				class="mr-2 btn variant-filled-primary"
				on:click={() => {
					if (size > 0) size--
				}}><IconMinus /></button
			>
			Taille
			<button
				class="ml-2 btn variant-filled-primary"
				on:click={() => {
					size++
				}}><IconPlus /></button
			>
		</div>

		{#if target && target.value > 0}
			<span
				class="mt-8 btn h-28 w-28 size text-7xl flex items-center justify-center font-bold variant-filled-primary"
				style="font-family:'Baloo 2', sans-serif;"
			>
				{target.value}
			</span>
		{/if}
	</div>
</div>
