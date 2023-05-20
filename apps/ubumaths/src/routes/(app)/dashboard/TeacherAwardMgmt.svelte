<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger } from '$lib/utils'
	import {
		Accordion,
		AccordionItem,
		toastStore,
		type ModalComponent,
		type ModalSettings,
		modalStore,
	} from '@skeletonlabs/skeleton'
	import type { StudentProfile, Teacher } from '../../../types/type'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import { DB_updateStudentGidouille, DB_updateStudentVipWallet } from '$lib/db'
	import IconCards from '$lib/icones/IconCards.svelte'
	import cards, { addVipCard, drawVipCards, useVipCard } from '$lib/vips/cards'

	import VipCards from './VIPCards.svelte'
	import VipCard from '$lib/vips/VipCard.svelte'
	import { createEventDispatcher } from 'svelte'
	import DrawnCards from './DrawnCards.svelte'

	export let db: SupabaseClient<Database>

	let pendingGidouille: Record<number, boolean> = {}
	let { warn, trace, fail } = getLogger('TeacherAwardMgmt', 'warn')
	let u = $user as Teacher
	let selectedStudent: StudentProfile | null = null
	let students = u.students
	let selectedClasseId = u.classe_ids[0]
	let selectedCard = cards.filter((c) => c.name === 'batman')[0]
	let pending = false
	let modalComponent: ModalComponent

	const dispatch = createEventDispatcher()

	async function addGidouille(student: StudentProfile) {
		console.log('adding gidouille')
		pendingGidouille[student.id] = true
		const { error } = await DB_updateStudentGidouille(
			db,
			student.id,
			student.gidouilles + 1,
		)
		if (error) {
			console.log(error.message)
			toastStore.trigger({
				message: "L'ajout de gidouille a échoué.",
				background: 'bg-error-500',
			})
		} else {
			student.gidouilles += 1
			// force update
			students = students
		}
		pendingGidouille[student.id] = false
	}
	async function removeGidouille(student: StudentProfile) {
		if (student.gidouilles > 0) {
			pendingGidouille[student.id] = true
			const { error } = await DB_updateStudentGidouille(
				db,
				student.id,
				student.gidouilles - 1,
			)
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'Le retrait de gidouille a échoué.',
					background: 'bg-error-500',
				})
			} else {
				student.gidouilles -= 1
				// force update
				students = students
			}
			pendingGidouille[student.id] = false
		}
	}

	function handleUpdateGidouilles() {
		students = students
	}
	function handleUpdateVips() {
		console.log('handleUpdateVips')
		students = students
	}

	async function addCard(student: StudentProfile) {
		pending = true
		const error = await addVipCard(selectedCard, student)
		if (error) {
			toastStore.trigger({
				message: "L'ajout de carte a échoué.",
				background: 'bg-error-500',
			})
		} else {
			students = students
		}
		pending = false
	}

	async function useCard(student: StudentProfile) {
		pending = true
		if (selectedCard.effect) {
			console.log('effect', selectedCard.effect)
			if (selectedCard.effect.name === 'draw') {
				const { error, draws } = await drawVipCards(
					student,
					selectedCard.effect.param,
					0,
				)
				if (error) {
					toastStore.trigger({
						message: error.message,
						background: 'bg-error-500',
					})
					return
				} else {
					console.log('drawns cards', cards)
					dispatch('updateVips', {
						text: 'Vips updated',
					})
					modalComponent = {
						// Pass a reference to your custom component
						ref: DrawnCards,
						// Add the component properties as key/value pairs
						props: { cards: draws, student, user },
						// Provide a template literal for the default component slot
						slot: '<p>Skeleton</p>',
					}
					const d: ModalSettings = {
						backdropClasses: '!bg-surface-800 text-black',
						type: 'component',
						// Pass the component directly:
						component: modalComponent,
					}
					modalStore.trigger(d)
				}
			}
			pending = false
		}
		const error = await useVipCard(selectedCard, student)
		if (error) {
			console.log("La carte n'a pas puêtre utilisée : " + error.message)
			toastStore.trigger({
				message: "La carte n'a pas pu être utilisée : " + error.message,
			})
		} else {
			console.log('La carte a été utilisée avec succès')
			console.log('vips', student.vips)
			dispatch('updateVips', {
				text: 'Vips updated',
			})
		}
		pending = false
		students = students
	}
</script>

<PageHeader title="Récompenses" />

<div class="container mx-auto p-4 max-w-screen-md">
	<label class="label">
		<span>Classe</span>
		<select class="select" bind:value={selectedClasseId}>
			{#each u.classe_ids as classe_id}
				{@const classe = u.classes.find((c) => c.id === classe_id)}
				<option value={classe_id}>{classe.name}</option>
			{/each}
		</select>
	</label>

	<div class="mt-8 card">
		<header class="card-header"><h3 class="card-title">Cartes Vips</h3></header>
		<section class="p-4">
			<label class="label">
				<span>Carte VIP</span>
				<select class="select" bind:value={selectedCard}>
					{#each cards.sort((a, b) => a.name.localeCompare(b.name)) as card}
						<option value={card}>{card.name}</option>
					{/each}
				</select>
			</label>
			<ul class="mt-4 list">
				{#each students[selectedClasseId].sort( (a, b) => a.firstname.localeCompare(b.firstname), ) as student}
					{@const studentCard = student.vips.find(
						({ card }) => card.name == selectedCard.name,
					)}

					<li
						class="flex justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2"
					>
						<div class="flex flex-col mr-4">
							<div class="text-xl font-bold">
								{student.firstname} ({studentCard ? studentCard.count : 0})
							</div>
							<div class="text-xs">
								{student.lastname}
							</div>
						</div>

						<div class="flex flex-wrap gap-4 justify-center items-center">
							<div class="flex flex-wrap gap-1 justify-center items-center">
								<button
									class="btn-icon variant-filled-primary"
									disabled={pendingGidouille[student.id]}
									on:click={() => removeGidouille(student)}
								>
									<IconMinus />
								</button>
								<span>{student.gidouilles}</span>
								<Gidouille />
								<button
									class="btn-icon variant-filled-primary"
									disabled={pendingGidouille[student.id]}
									on:click={() => addGidouille(student)}
								>
									<IconPlus />
								</button>
							</div>
							<div class="flex flex-wrap gap-1 justify-center items-center">
								<button
									class="btn {studentCard?.count
										? 'variant-filled-success'
										: 'variant-filled-tertiary'}"
									disabled={pending || !studentCard?.count}
									on:click={() => useCard(student)}>Utiliser</button
								>
								<button
									class="btn variant-filled-primary"
									disabled={pending}
									on:click={() => addCard(student)}>Ajouter</button
								>
								<button
									class="btn-icon variant-filled-primary"
									disabled={pendingGidouille[student.id]}
									on:click={() =>
										(selectedStudent =
											selectedStudent === student ? null : student)}
								>
									<IconCards />
								</button>
							</div>
						</div>
					</li>
					{#if selectedStudent === student}
						<VipCards
							on:updateGidouilles={handleUpdateGidouilles}
							on:updateVips={handleUpdateVips}
							{student}
							{db}
							user={u}
							short
						/>
					{/if}
				{/each}
			</ul>
		</section>
	</div>

	<div class="mt-8 card">
		<header class="card-header"><h3 class="card-title">Gidouilles</h3></header>
		<section class="p-4">
			<ul class="list">
				{#each students[selectedClasseId].sort( (a, b) => a.firstname.localeCompare(b.firstname), ) as student (student.id)}
					<li>
						<div
							class="flex justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
						>
							<div class="flex flex-col mr-4">
								<div class="text-xl font-bold">
									{student.firstname}
								</div>
								<div class="text-xs">
									{student.lastname}
								</div>
							</div>

							<div class="flex gap-1 items-center">
								<button
									class="btn-icon variant-filled-primary"
									disabled={pendingGidouille[student.id]}
									on:click={() => removeGidouille(student)}
								>
									<IconMinus />
								</button>
								<span>{student.gidouilles}</span>
								<Gidouille />
								<button
									class="btn-icon variant-filled-primary"
									disabled={pendingGidouille[student.id]}
									on:click={() => addGidouille(student)}
								>
									<IconPlus />
								</button>
								<button
									class="btn-icon variant-filled-primary"
									disabled={pendingGidouille[student.id]}
									on:click={() =>
										(selectedStudent =
											selectedStudent === student ? null : student)}
								>
									<IconCards />
								</button>
							</div>
						</div>
					</li>
					{#if selectedStudent === student}
						<VipCards
							on:updateGidouilles={handleUpdateGidouilles}
							on:updateVips={handleUpdateVips}
							{student}
							{db}
							user={u}
							short
						/>
					{/if}
				{/each}
			</ul>
		</section>
	</div>
</div>
