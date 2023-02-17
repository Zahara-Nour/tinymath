<script lang="ts">
	import generate from '$lib/questions/generateQuestion'
	import datas, { getQuestion } from '$lib/questions/questions'
	import Question from '$lib/ui/Question.svelte'
	import {
		prepareAnsweredQuestion,
		prepareCorrectedQuestion,
	} from '$lib/questions/correction'
	import type { Basket } from '$lib/type'

	const ids = datas.ids

	export let basket: Basket
	export let courseAuxNombres = false
	export let enounceAlone = false

	const addItem = (i: number) => {
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
		{@const question = getQuestion(theme, domain, subdomain, level)}
		<div class="my-4 flex flex-row">
			<div class="card" style="width:80%;max-width:500px">
				<header class="header">
					{@html question.description}

					{#if question.subdescription}
						{@html question.subdescription}
					{/if}
				</header>

				<Question
					question={prepareCorrectedQuestion(
						prepareAnsweredQuestion(generate(question)),
					)}
				/>
			</div>

			<div class="ma-2 flex flex-col">
				{#if !courseAuxNombres}
					<div class="flex flex-row justify-center">
						<div class="mt-2">
							répétition: {basket[i].count}
						</div>
					</div>
				{/if}
				<div class="ml-2 flex flex-row justify-center">
					<button
						on:click={() => removeItem(i)}
						class="btn-icon variant-filled-primary"
						><iconify-icon icon="mdi:minus" /></button
					>
					{#if !courseAuxNombres}
						<button
							on:click={() => addItem(i)}
							class="btn-icon variant-filled-primary"
							><iconify-icon icon="mdi:plus" /></button
						>
					{/if}
				</div>

				{#if !courseAuxNombres}
					<div class="flex flex-row justify-center">
						<div class="mt-2">
							temps: {basket[i].delay} s
						</div>
					</div>
					<div class="ml-2 flex flex-row justify-center">
						<button
							on:click={() => lessTime(i)}
							class="btn-icon variant-filled-primary"
							><iconify-icon icon="mdi:minus" /></button
						>
						<button
							on:click={() => moreTime(i)}
							class="btn-icon variant-filled-primary"
							><iconify-icon icon="mdi:plus" /></button
						>
					</div>
				{/if}
			</div>
			<div>
				<div class="label">
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
