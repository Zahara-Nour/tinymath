<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { grades } from '$lib/grades'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { getLogger } from '$lib/utils'
	import { toastStore } from '@skeletonlabs/skeleton'
	import { user } from '$lib/stores'
	import type { Student } from '$lib/type'

	let { warn, trace, fail } = getLogger('UserMgmt', 'warn')
	let u = $user as Student
</script>

<PageHeader title="Mes évaluations" />
{#if u.assignments}
	<h3>Evaluations à faire :</h3>
	<div class="card p-4 h-80 overflow-auto">
		{#each u.assignments as assignment}
			<div
				class="flex flex-col  text-black bg-surface-500 shadow-md rounded-md p-4 mb-4"
			>
				<div class="flex flex-row justify-between">
					<div class="flex flex-col">
						<h2 class="text-xl font-bold">{assignment.title}</h2>
						<p class="text-sm text-gray-500">
							Questions: {assignment.basket.reduce(
								(acc, q) => acc + q.count,
								0,
							)}
						</p>
					</div>
					<div class="flex flex-row">
						<a
							href={`/automaths/assessment?assessment=${assignment.id}&training=true`}
							class="btn variant-filled-primary mx-2">S'entrainer</a
						>
						<a
							href={`/automaths/assessment?assessment=${assignment.id}`}
							class="btn variant-filled-primary mx-2">Faire l'évaluation</a
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
