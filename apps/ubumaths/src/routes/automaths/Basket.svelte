<script lang="ts">
	import generate from '$lib/questions/generateQuestion'
	import datas, { getQuestion } from '$lib/questions/questions'
	import Question from '$lib/ui/Question.svelte'
	import {
		assessItem,
		prepareAnsweredQuestion,
		prepareCorrectedQuestion,
	} from '$lib/questions/correction'
	import type { Basket } from '$lib/type'
	import QuestionCard from '$lib/ui/QuestionCard.svelte'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'

	export let basket: Basket
	export let courseAuxNombres = false
	export let enounceAlone = false

	const ids = datas.ids

	function addItem(i: number) {
		basket[i].count++
		//  pour forcer l'update
		basket = basket
	}

	function toggleEnounceAlone(i: number) {
		basket[i].enounceAlone = enounceAlone
	}

	function removeItem(i: number) {
		if (basket[i].count > 1) {
			basket[i].count--
		} else {
			basket.splice(i, 1)
		}
		basket = basket
	}

	const lessTime = (i: number) => {
		if (basket[i].delay < 5) {
			basket[i].delay = 0
		} else {
			basket[i].delay = basket[i].delay - 5
		}
		basket = basket
	}

	const moreTime = (i: number) => {
		basket[i].delay = basket[i].delay + 5
		basket = basket
	}
</script>

<!-- <TextField filled bind:value="{evalTitle}" rules="{titleRules}">Titre</TextField
> -->

{#if basket.length}
	{#each basket as item, i}
		{@const { theme, domain, subdomain, level } = ids[item.id]}
		{@const card = assessItem(
			prepareCorrectedQuestion(
				prepareAnsweredQuestion(
					generate(getQuestion(theme, domain, subdomain, level)),
				),
			),
		)}
		<div class="my-4 flex flex-col items-center lg:flex-row">
			<QuestionCard class="mx-4 max-w-sm" {card} />

			<div class="my-4 flex flex-row">
				<div class="mx-4 flex flex-row items-start justify-start lg:flex-col">
					<div class="flex flex-col items-center">
						{#if !courseAuxNombres}
							<div class="flex flex-row justify-center">
								répétition: {basket[i].count}
							</div>
						{/if}
						<div class="flex flex-row justify-center">
							<button
								on:click={() => removeItem(i)}
								class="mx-1 btn-icon variant-filled-primary"
								><IconMinus /></button
							>
							{#if !courseAuxNombres}
								<button
									on:click={() => addItem(i)}
									class="mx-1 btn-icon variant-filled-primary"
									><IconPlus /></button
								>
							{/if}
						</div>
					</div>
					<div class="flex flex-col items-center">
						{#if !courseAuxNombres}
							<div class="flex flex-row justify-center items-center">
								temps: {basket[i].delay} s
							</div>
							<div class="flex flex-row justify-center  items-center">
								<button
									on:click={() => lessTime(i)}
									class="mx-1 btn-icon variant-filled-primary"
									><IconMinus /></button
								>
								<button
									on:click={() => moreTime(i)}
									class="mx-1 btn-icon variant-filled-primary"
									><IconPlus /></button
								>
							</div>
						{/if}
					</div>
				</div>
				<div class="mx-4 label">
					<strong>Options</strong>
					<div class="space-y-2">
						<label class="flex items-center space-x-2">
							<input
								class="checkbox"
								type="checkbox"
								on:change={() => toggleEnounceAlone(i)}
								bind:checked={enounceAlone}
							/>
							<p>Enoncé séparé</p>
						</label>
					</div>
				</div>
			</div>
		</div>
	{/each}
{:else}
	<div>Le panier est vide.</div>
{/if}
