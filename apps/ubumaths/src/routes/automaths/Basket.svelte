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
	import { toastStore, type ModalSettings } from '@skeletonlabs/skeleton'
	import { connected, user } from '$lib/stores'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { getLogger } from '$lib/utils'
	import { modalStore } from '@skeletonlabs/skeleton'
	import { goto } from '$app/navigation'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'

	export let basket: Basket = []
	export let courseAuxNombres = false
	export let enounceAlone = false
	export let assessment = 0
	export let supabase: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('Basket', 'warn')
	const ids = datas.ids
	let evalTitle = ''
	let titleAvailable = false
	let titles: { title: string; id: number }[] | null = null

	if (assessment) {
		loadBasket()
	}
	$: if ($connected) fetchTitles()

	$: titleAvailable = checkEvalTitleAvailability(evalTitle, titles)
	$: console.log('titleAvailable: ', titleAvailable)

	async function loadBasket() {
		const { error, data } = await supabase
			.from('assessments')
			.select('questions, title')
			.eq('id', assessment)
			.maybeSingle()
		if (error) {
			fail(error)
			toastStore.trigger({
				message: "Impossible de charger l'évaluation",
				background: 'bg-error-500',
			})
		} else if (!data) {
			fail('No data returned for assessment ' + assessment)
			toastStore.trigger({
				message: "Impossible de charger l'évaluation",
				background: 'bg-error-500',
			})
		} else {
			basket = JSON.parse(data.questions as string)
			evalTitle = data.title
		}
	}

	const submitSave: SubmitFunction = (params) => {
		if (titleAvailable) {
			saveAssessment(params)
		} else {
			triggerConfirm(params)
		}
	}
	const triggerConfirm: SubmitFunction = (params) => {
		params.cancel()
		const confirm: ModalSettings = {
			type: 'confirm',
			title: 'Merci de confirmer',
			body: `Voulez-vous vraiment écraser l'évaluation '${evalTitle}'?`,
			// TRUE if confirm pressed, FALSE if cancel pressed
			response: (r: boolean) => {
				if (r) saveAssessment(params)
			},
			// Optionally override the button text
			buttonTextCancel: 'Annuler',
			buttonTextConfirm: 'Confirmer',
		}
		modalStore.trigger(confirm)
	}

	const saveAssessment: SubmitFunction = async (params) => {
		params.cancel()
		const { error } = await (titleAvailable
			? supabase.from('assessments').insert([
					{
						title: evalTitle,
						teacher_id: $user.id,
						questions: JSON.stringify(basket),
					},
			  ])
			: supabase
					.from('assessments')
					.update({
						questions: JSON.stringify(basket),
					})
					.eq('id', titles!.find((item) => item.title === evalTitle)!.id))

		if (error) {
			fail(error.message)
			toastStore.trigger({
				message: 'Impossible de sauvegarder l’évaluation.',
				background: 'bg-error-500',
			})
		} else {
			toastStore.trigger({
				message: 'Évaluation sauvegardée.',
				background: 'bg-success-500',
			})
			fetchTitles()
		}
	}

	async function fetchTitles() {
		const { data, error } = await supabase
			.from('assessments')
			.select('title,id')
			.eq('teacher_id', $user.id)
		if (error) {
			toastStore.trigger({
				message: 'Impossible de récupérer les titres des évaluations.',
				background: 'bg-error-500',
			})
			titles = null
		} else if (!data) {
			titles = null
		} else {
			titles = data.map((item) => ({ title: item.title, id: item.id }))
			console.log('titles', titles)
		}
	}

	function checkEvalTitleAvailability(
		title: string,
		titles: { title: string; id: number }[] | null,
	) {
		return !!titles && !titles.some((item) => item.title === title)
	}

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

	{#if assessment}
		<div class="flex justify-center my-4">
			<button
				on:click={() => {
					goto('/dashboard')
				}}
				class="btn variant-filled-primary">Retourner aux évaluations</button
			>
		</div>
	{/if}
	<h2>Créer une évaluation</h2>
	<form method="POST" use:enhance={submitSave}>
		<div class="my-4">
			<label class="label">
				<span>Titre</span>
				<input
					class={'input' +
						(!titleAvailable || !evalTitle ? ' input-error' : ' input-success')}
					type="text"
					bind:value={evalTitle}
				/>
			</label>
		</div>

		<button
			disabled={!titles || !evalTitle || !basket.length}
			type="submit"
			class={'btn' +
				(!evalTitle || titleAvailable
					? ' variant-filled-primary'
					: ' variant-filled-error')}
			>{!evalTitle || titleAvailable ? 'Enregistrer' : 'Ecraser'}</button
		>
	</form>
{:else}
	<div>Le panier est vide.</div>
{/if}
