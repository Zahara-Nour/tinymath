<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, objectMap } from '$lib/utils'
	import { toastStore } from '@skeletonlabs/skeleton'
	import type {
		Assessment,
		Basket,
		School,
		StudentProfile,
		Teacher,
	} from '../../types/type'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../types/supabase'
	import { addAssignments, fetchTeacherAssessments } from '$lib/db'

	export let db: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('assessmentMgmt', 'warn')
	let u = $user as Teacher
	let assessments: Assessment[] = []
	let selectedClasseId = u.classe_ids[0]
	let selectedStudents: Record<number, number[]> = u.classes.reduce(
		(acc, classe) => {
			acc[classe.id] = []
			return acc
		},
		{} as Record<number, number[]>,
	)
	let selectedClassesIds: number[] = []
	let allStudents: StudentProfile[] = []

	getAssessments()
	$: console.log('assessments: ', assessments)
	$: allStudents = getAllStudents(selectedClassesIds, selectedStudents)
	$: console.log('allStudents: ', allStudents)

	function getAllStudents(
		classesIds: number[],
		studentsByClasse: Record<number, number[]>,
	) {
		allStudents = []
		// whole classes
		classesIds.forEach((classe_id) => {
			allStudents = allStudents.concat(u.students[classe_id])
		})

		// individuals

		const indivuals = objectMap(studentsByClasse, (students_ids, classe_id) =>
			students_ids
				.map(
					(student_id) =>
						u.students[parseInt(classe_id, 10)].find(
							(student) => student.id === student_id,
						)!,
				)
				.filter(
					(student) => student && !allStudents.some((s) => s.id === student.id),
				),
		)
		Object.keys(indivuals).forEach((classe_id) => {
			allStudents = allStudents.concat(indivuals[classe_id])
		})

		return allStudents
	}

	async function getAssessments() {
		const { data, error } = await fetchTeacherAssessments(db, u.id)
		assessments = []
		if (error) {
			fail(error.message)
			toastStore.trigger({
				message: 'La récupération des évaluations a échoué.',
				background: 'bg-error-500',
			})
		} else if (!data) {
			fail('No assessments found')
			toastStore.trigger({
				message: 'Aucune évaluation trouvée.',
				background: 'bg-error-500',
			})
		} else {
			assessments = data.map((assessmentData) => ({
				...assessmentData,
				questions: JSON.parse(assessmentData.questions) as Basket,
			}))
		}
	}

	async function assignAssessments(assessment_id: number) {
		const basket = assessments.find((a) => a.id === assessment_id)?.questions
		// fetch basket

		if (!basket || !basket.length) {
			fail('No basket found.')
			toastStore.trigger({
				message: 'Aucun panier de questions retrouvé.',
				background: 'bg-error-500',
			})
		} else {
			const assignments = allStudents.map((student) => {
				console.log('student', student)
				return {
					id: 0,
					student_id: student.id,
					teacher_id: u.id,
					mark: 0,
					total: basket.reduce((acc, q) => acc + q.count, 0),
					basket,
					title: assessments.find((a) => a.id === assessment_id)?.title!,
					status: 'pending',
				}
			})

			console.log('assignements', assignments)

			const { error } = await addAssignments(db, assignments)
			if (error) {
				fail(error.message)
				toastStore.trigger({
					message: "L'assignation des évaluations a échoué.",
					background: 'bg-error-500',
				})
			} else {
				toastStore.trigger({
					message: 'Les évaluations ont été assignées.',
					background: 'bg-success-500',
				})
			}
		}
	}
</script>

<PageHeader title="Gestion des évaluations" />
{#if assessments.length}
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
						<button
							on:click={() => assignAssessments(assessment.id)}
							class="btn variant-filled-primary mx-2">Attribuer</button
						>
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
				{#each u.classes as classe}
					<div class="flex items-center space-x-2">
						<input
							class="checkbox"
							type="checkbox"
							bind:group={selectedClassesIds}
							value={classe.id}
						/>
						<p>{classe.name}</p>
					</div>
				{/each}
			</div>
		</div>
	</label>
	<div class="card p-4">
		<label class="label">
			<div class="flex items-center">
				<strong>Élèves</strong>
				<select class="ml-2 select" bind:value={selectedClasseId}>
					{#each u.classes as classe}
						<option value={classe.id}>{classe.name}</option>
					{/each}
				</select>
			</div>
			{#if u.students}
				{#each u.students[selectedClasseId] as student}
					<div class="flex items-center space-x-2">
						<input
							class="checkbox"
							type="checkbox"
							bind:group={selectedStudents[selectedClasseId]}
							value={student.id}
						/>
						<p>
							{student.firstname + ' ' + student.lastname}
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
