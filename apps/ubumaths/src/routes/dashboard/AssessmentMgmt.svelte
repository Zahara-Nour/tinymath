<script lang="ts">
	import { addUsers, supabaseClient } from '$lib/db'
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { grades } from '$lib/grades'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { getLogger } from '$lib/utils'
	import { toastStore } from '@skeletonlabs/skeleton'
	import type { Assessment, Basket, School } from '$lib/type'
	import { add_classes } from 'svelte/internal'
	import { user } from '$lib/stores'

	let { warn, trace, fail } = getLogger('UserMgmt', 'warn')
	let textarea: string = ''
	let assessments: Assessment[] | null = null
	let selectedClassId = $user.classIdsNames[0].id
	let selectedStudents: { [index: number]: number[] } = $user.classes.reduce(
		(acc, c) => {
			acc[c] = []
			return acc
		},
		{} as { [index: number]: number[] },
	)
	let selectedClasses: number[] = []
	let allStudents: number[] = []

	fetchAssessments()

	$: allStudents = getAllStudents(selectedClasses, selectedStudents)

	function getAllStudents(
		classes: number[],
		students: { [index: number]: number[] },
	) {
		let allStudents = classes.reduce((acc, c) => {
			acc.push(...$user.studentsIdsNames[c].map((s) => s.id))
			return acc
		}, [] as number[])

		allStudents = allStudents.concat(
			Object.keys(students)
				.reduce((acc, classId) => {
					acc = acc.concat(students[parseInt(classId, 10)])
					return acc
				}, [] as number[])
				.filter((s) => !allStudents.includes(s)),
		)
		return allStudents
	}
	function fetchAssessments() {
		supabaseClient
			.from('assessments')
			.select('id, title, questions, teacher_id')
			.eq('teacher_id', $user.id)
			.then((res) => {
				if (res.error) {
					fail(res.error.message)
					toastStore.trigger({
						message: 'La récupération des évaluations a échoué.',
						background: 'bg-error-500',
					})
					assessments = null
				} else if (!res.data) {
					fail('No assessments found')
					toastStore.trigger({
						message: 'Aucune évaluation trouvée.',
						background: 'bg-error-500',
					})
					assessments = null
				} else {
					assessments = res.data.map((assessment) => ({
						id: assessment.id,
						title: assessment.title,
						questions: JSON.parse(assessment.questions as string) as Basket,
						teacher_id: assessment.teacher_id,
					}))
				}
			})
	}
</script>

<PageHeader title="Gestion des évaluations" />
{#if assessments}
	<div class="card p-4 h-80 overflow-auto">
		{#each assessments as assessment}
			<div
				class="flex flex-col  text-black bg-surface-500 shadow-md rounded-md p-4 mb-4"
			>
				<div class="flex flex-row justify-between">
					<div class="flex flex-col">
						<h2 class="text-xl font-bold">{assessment.title}</h2>
						<p class="text-sm text-gray-500">
							Questions: {assessment.questions.reduce(
								(count, question) => count + question.count,
								0,
							)}
						</p>
					</div>
					<div class="flex flex-row">
						<a
							href={`/automaths?assessment=${assessment.id}`}
							class="btn variant-filled-primary mx-2">Voir / Modifier</a
						>
						<button class="btn variant-filled-primary mx-2">Attribuer</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<h3>Attribuer à :</h3>
	<label class="card p-4">
		<div class="label">
			<strong>Classes</strong>
			<div class="space-y-2">
				{#each $user.classIdsNames as classIdName}
					<div class="flex items-center space-x-2">
						<input
							class="checkbox"
							type="checkbox"
							bind:group={selectedClasses}
							value={classIdName.id}
						/>
						<p>{classIdName.className}</p>
					</div>
				{/each}
			</div>
		</div>
	</label>
	<div class="card p-4">
		<label class="label">
			<div class="flex items-center">
				<strong>Élèves</strong>
				<select class="ml-2 select" bind:value={selectedClassId}>
					{#each $user.classIdsNames as classIdName}
						<option value={classIdName.id}>{classIdName.className}</option>
					{/each}
				</select>
			</div>
			{#if $user.studentsIdsNames}
				{#each $user.studentsIdsNames[selectedClassId] as student}
					<div class="flex items-center space-x-2">
						<input
							class="checkbox"
							type="checkbox"
							bind:group={selectedStudents[selectedClassId]}
							value={student.id}
						/>
						<p>
							{student.fullname || student.firstname + ' ' + student.lastname}
						</p>
					</div>
				{/each}
			{/if}
		</label>
	</div>
{:else}
	<div class="card p-4 h-80 overflow-auto">
		<p class="text-center">Aucune évaluation trouvée.</p>
	</div>
{/if}
