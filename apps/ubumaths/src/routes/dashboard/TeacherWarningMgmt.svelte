<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, isEmptyObject, objectMap } from '$lib/utils'
	import { Accordion, AccordionItem, toastStore } from '@skeletonlabs/skeleton'
	import type { StudentProfile, Teacher } from '../../types/type'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../types/supabase'
	import { fetchDayStudentsTeacherWarnings } from '$lib/db'
	import { DateTime } from 'luxon'
	import { warningCasesShort } from '$lib/warnings'
	export let db: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('TeacherAwardMgmt', 'warn')
	let u = $user as Teacher
	let selectedDate = DateTime.now().toISODate()
	let selectedDateTime: DateTime
	let student_id: number = 0
	let pendingWarning = false
	let warnings: Record<number, string[]> = {}
	let oldWarnings: Record<number, string[]>

	let classe_ids: number[] = []

	$: {
		console.log('selectedDate changed')
		selectedDateTime = DateTime.fromISO(selectedDate)
	}
	$: updateClasses(selectedDateTime)

	$: getWarnings(selectedDateTime)

	$: updateWarnings(warnings)

	function updateClasses(date: DateTime) {
		classe_ids = u.classes
			.filter((classe) => classe.schedule.includes(date.weekday % 7))
			.map((classe) => classe.id)

		console.log('classe_ids', classe_ids)
	}
	async function initWarnings() {
		const rows: Database['public']['Tables']['warnings']['Insert'][] = []
		classe_ids.forEach((classe_id) => {
			u.students[classe_id].forEach((student) => {
				rows.push({
					student_id: student.id,
					date: selectedDate,
					warnings: [],
				})
			})
		})

		pendingWarning = true
		const { error } = await db.from('warnings').insert(rows)
		if (error) {
			console.log(error.message)
			toastStore.trigger({
				message: "Erreur lors de l'initialisation des avertissements",
				background: 'bg-error-500',
			})
		} else {
			warnings = rows.reduce((acc, curr) => {
				acc[curr.student_id] = curr.warnings!
				return acc
			}, {} as Record<number, string[]>)
			toastStore.trigger({
				message: 'Initialisation des avertissements effectuée',
				background: 'bg-success-500',
			})
		}
		pendingWarning = false
	}
	async function updateWarnings(warnings: Record<number, string[]>) {
		if (student_id) {
			console.log('update warnings', { ...warnings })
			pendingWarning = true
			const { error } = await db
				.from('warnings')
				.update({ warnings: warnings[student_id] })
				.match({ student_id, date: selectedDate })
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'Erreur lors de la mise à jour des avertissements',
					background: 'bg-error-500',
				})
				student_id = 0
				warnings = { ...oldWarnings }
			} else {
				student_id = 0
				console.log('update done')
			}
			pendingWarning = false
		}
		oldWarnings = { ...warnings }
	}
	async function getWarnings(date: DateTime) {
		warnings = {}
		if (date.isValid) {
			const { data, error } = await fetchDayStudentsTeacherWarnings(
				db,
				u.id,
				date.toFormat('yyyy-MM-dd'),
			)
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'Erreur lors de la récupération des avertissements',
					background: 'bg-error-500',
				})
				warnings = {}
			} else if (!data) {
				toastStore.trigger({
					message: 'Avertissements : aucune donnée',
					background: 'bg-error-500',
				})
				warnings = {}
			} else {
				console.log('data', data)
				warnings = data.reduce((acc, curr) => {
					acc[curr.student_id] = curr.warnings

					return acc
				}, {} as Record<number, string[]>)
			}
			console.log('warnings', warnings)
		}
	}
</script>

<PageHeader title="Avertissements" />

<div class="flex">
	<input
		class="input"
		class:input-error={!selectedDateTime.isValid}
		type="text"
		bind:value={selectedDate}
	/>
	<button
		class="btn variant-filled-primary"
		on:click={() => initWarnings()}
		disabled={!selectedDateTime.isValid ||
			pendingWarning ||
			(warnings && !isEmptyObject(warnings)) ||
			!classe_ids.length}
	>
		Initialiser
	</button>
</div>
{#if !isEmptyObject(warnings) && selectedDateTime.isValid}
	<div class="mt-8 card">
		<header class="card-header" />
		<section class="p-4">
			<Accordion class="mt-4">
				{#each u.classes as classe}
					{#if classe.schedule.includes(selectedDateTime.weekday % 7)}
						<AccordionItem open>
							<svelte:fragment slot="summary">{classe.name}</svelte:fragment>
							<svelte:fragment slot="content">
								<ul class="list">
									{#each u.students[classe.id].sort( (a, b) => a.firstname.localeCompare(b.firstname), ) as student}
										<li>
											<div
												class="flex  justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
											>
												<div class="flex flex-col mr-4">
													<div class="text-xl font-bold ">
														{student.firstname}
													</div>
													<div class="text-xs">
														{student.lastname}
													</div>
												</div>
												<div class="flex flex-wrap items-center gap-4">
													{#each warningCasesShort as warning}
														<div class="flex items-center">
															<input
																on:change={() => (student_id = student.id)}
																disabled={pendingWarning}
																class="checkbox"
																type="checkbox"
																bind:group={warnings[student.id]}
																value={warning}
															/>
															<span class="ml-1">
																{warning}
															</span>
														</div>
													{/each}
												</div>
											</div>
										</li>
									{/each}
								</ul>
							</svelte:fragment>
						</AccordionItem>
					{/if}
				{/each}
			</Accordion>
		</section>
	</div>
{/if}
