<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, isEmptyObject, objectMap } from '$lib/utils'
	import { Accordion, AccordionItem, toastStore } from '@skeletonlabs/skeleton'
	import type { Student, StudentProfile, Teacher } from '../../types/type'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../types/supabase'
	import {
		fetchDayStudentsTeacherWarnings,
		fetchStudentWarnings,
	} from '$lib/db'
	import { DateTime } from 'luxon'
	import { warningCases } from '$lib/warnings'
	export let db: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('TeacherAwardMgmt', 'warn')
	let u = $user as Student
	let lang = 'fr'
	let warningsTerm1ByDate: Record<string, string[]> = {}
	let warningsTerm2ByDate: Record<string, string[]> = {}
	let warningsTerm3ByDate: Record<string, string[]> = {}
	let markTerm1: number | null
	let markTerm2: number | null
	let markTerm3: number | null

	getWarnings()
	const today = DateTime.now()
	const term1Start = DateTime.fromISO('2022-09-01')
	const term2Start = DateTime.fromISO('2022-12-15')
	const term3Start = DateTime.fromISO('2023-03-15')
	const yearEnd = DateTime.fromISO('2023-06-01')

	async function getWarnings() {
		warningsTerm1ByDate = {}
		warningsTerm2ByDate = {}
		warningsTerm3ByDate = {}
		const { data, error } = await fetchStudentWarnings(db, u.id)
		if (error) {
			console.log(error.message)
			toastStore.trigger({
				message: 'Erreur lors de la récupération des avertissements',
				background: 'bg-error-500',
			})
		} else if (!data) {
			toastStore.trigger({
				message: 'Avertissements : aucune donnée',
				background: 'bg-error-500',
			})
		} else {
			warningsTerm1ByDate = data
				.filter((a) => DateTime.fromISO(a.date) < term2Start)
				.sort((a, b) => b.date.localeCompare(a.date))
				.reduce((acc, curr) => {
					acc[curr.date] = curr.warnings

					return acc
				}, {} as Record<string, string[]>)
			markTerm1 = Object.entries(warningsTerm3ByDate).length
				? (Object.entries(warningsTerm1ByDate).filter(
						(entry) => entry[1].length,
				  ).length /
						Object.entries(warningsTerm1ByDate).length) *
				  20
				: null
			warningsTerm2ByDate = data
				.filter(
					(a) =>
						DateTime.fromISO(a.date) >= term2Start &&
						DateTime.fromISO(a.date) < term3Start,
				)
				.sort((a, b) => b.date.localeCompare(a.date))
				.reduce((acc, curr) => {
					acc[curr.date] = curr.warnings

					return acc
				}, {} as Record<string, string[]>)
			markTerm2 = Object.entries(warningsTerm3ByDate).length
				? (Object.entries(warningsTerm2ByDate).filter(
						(entry) => entry[1].length,
				  ).length /
						Object.entries(warningsTerm2ByDate).length) *
				  20
				: null

			warningsTerm3ByDate = data
				.filter((a) => DateTime.fromISO(a.date) >= term3Start)
				.sort((a, b) => b.date.localeCompare(a.date))
				.reduce((acc, curr) => {
					acc[curr.date] = curr.warnings

					return acc
				}, {} as Record<string, string[]>)
			markTerm3 = Object.entries(warningsTerm3ByDate).length
				? (Object.entries(warningsTerm3ByDate).filter(
						(entry) => !entry[1].length,
				  ).length /
						Object.entries(warningsTerm3ByDate).length) *
				  20
				: null
		}
	}
</script>

<PageHeader title="Avertissements" />
<div class="flex w-full justify-end">
	<button
		class={'m-2 btn ' +
			(lang === 'fr' ? 'variant-filled-primary' : 'variant-filled-tertiary')}
		on:click={() => (lang = 'fr')}>Français</button
	>
	<button
		class={'m-2 btn ' +
			(lang === 'en' ? 'variant-filled-primary' : 'variant-filled-tertiary')}
		on:click={() => (lang = 'en')}>English</button
	>
	<button
		class={'m-2 btn ' +
			(lang === 'ar' ? 'variant-filled-primary' : 'variant-filled-tertiary')}
		on:click={() => (lang = 'ar')}>Arabic</button
	>
</div>

<div class="mt-8 card">
	<header class="card-header" />
	<section class="p-4">
		<Accordion class="mt-4">
			{#if today >= term3Start}
				<AccordionItem open>
					<svelte:fragment slot="summary"
						><h3>
							Trimestre 3 - Note de travail et de comportement : {markTerm3}/20
						</h3></svelte:fragment
					>
					<svelte:fragment slot="content">
						{#each Object.entries(warningsTerm3ByDate) as [date, warnings]}
							{#if warnings.length > 0}
								<h4 class="mt-4">
									{DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
								</h4>

								<ul class="list">
									{#each warnings as warning}
										<li>{warningCases[lang][warning]}</li>
									{/each}
								</ul>
							{/if}
						{/each}
					</svelte:fragment>
				</AccordionItem>
			{/if}
		</Accordion>
	</section>
</div>
