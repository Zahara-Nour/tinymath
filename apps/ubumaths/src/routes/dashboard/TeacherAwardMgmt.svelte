<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, objectMap } from '$lib/utils'
	import {
		Accordion,
		AccordionItem,
		ListBox,
		ListBoxItem,
		popup,
		toastStore,
		type PopupSettings,
	} from '@skeletonlabs/skeleton'
	import type { StudentProfile, Teacher } from '../../types/type'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../types/supabase'
	import { enhance } from '$app/forms'
	import { updateGidouille, updateVip } from '$lib/db'
	import IconCards from '$lib/icones/IconCards.svelte'
	import VipCard from '$lib/vips/VipCard.svelte'

	export let db: SupabaseClient<Database>

	let pendingGidouille: Record<number, boolean> = {}
	let { warn, trace, fail } = getLogger('TeacherAwardMgmt', 'warn')
	let u = $user as Teacher
	let selectedStudent: StudentProfile
	let pendingVips: boolean[] = []

	async function drawVipCard(student: StudentProfile) {
		if (student.gidouilles >= 3) {
			pendingGidouille[student.id] = true
			const { error } = await updateGidouille(
				db,
				student.id,
				(student.gidouilles -= 3),
			)
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'Le retrait de gidouilles a échoué.',
					background: 'bg-error-500',
				})
			} else {
				student.gidouilles -= 3
				// force update
				u = u
			}
			pendingGidouille[student.id] = false
		}
	}

	async function useVip(student: StudentProfile, cardName: string) {
		pendingVips[student.id] = true
		const { error } = await updateVip(db, student.id, {
			...student.vips,
			[cardName]: student.vips[cardName] - 1,
		})
		if (error) {
			console.log(error.message)
			toastStore.trigger({
				message: "La carte VIP n'a pas pu être utilisée.",
				background: 'bg-error-500',
			})
		} else {
			student.vips[cardName] -= 1
			toastStore.trigger({
				message: 'La carte a été utilisée.',
				background: 'bg-success-500',
			})
		}
		pendingVips[student.id] = false
	}

	async function addGidouille(student: StudentProfile) {
		console.log('adding gidouille')
		pendingGidouille[student.id] = true
		const { error } = await updateGidouille(
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
			u = u
		}
		pendingGidouille[student.id] = false
	}
	async function removeGidouille(student: StudentProfile) {
		if (student.gidouilles > 0) {
			pendingGidouille[student.id] = true
			const { error } = await updateGidouille(
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
				u = u
			}
			pendingGidouille[student.id] = false
		}
	}
</script>

<PageHeader title="Récompenses / Avertissements" />

<div class="mt-8 card">
	<header class="card-header"><h3 class="card-title">Gidouilles</h3></header>
	<section class="p-4">
		<Accordion class="mt-4">
			{#each u.classes as classe}
				<AccordionItem open>
					<svelte:fragment slot="summary">{classe.name}</svelte:fragment>
					<svelte:fragment slot="content">
						<ul class="list">
							{#each u.students[classe.id] as student}
								<li>
									<div
										class="flex  justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
									>
										<div class="text-xl font-bold overflow-hidden">
											{student.firstname + ' ' + student.lastname}
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
												disabled={pendingGidouille[student.id] ||
													student.gidouilles < 3}
												on:click={() => (selectedStudent = student)}
											>
												<IconCards />
											</button>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	</section>
</div>

{#if selectedStudent}
	<div class="mt-8 card">
		<header class="card-header">
			<h3 class="card-title">{`cartes VIP de ${selectedStudent.firstname}`}</h3>
		</header>
		<section class="p-4">
			<div
				class="flex  flex-wrap justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
			>
				<div class="flex gap-4 flex-wrap">
					{#each Object.entries(selectedStudent.vips) as [name, count]}
						{#if count > 0}
							<div class="flex flex-col items-center">
								<div class="relative inline-block">
									{#if count > 1}
										<span
											class="badge-icon variant-filled-success absolute -top-0 -right-0 z-10 w-10 h-10"
											><span class="text-white text-xl">{count}</span></span
										>
										<VipCard {name} />
									{:else}
										<VipCard {name} />
									{/if}
								</div>
								<div>
									<button
										class="btn mt-2 variant-filled-primary"
										disabled={pendingVips[selectedStudent.id]}
										on:click={() => useVip(selectedStudent, name)}
									>
										Use
									</button>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</section>
	</div>
{/if}
