<script lang="ts">
	import data from '$lib/questions/questions.js'
	import { gradeMatchesClass, grades } from '$lib/grades'
	import { objectMap } from '$lib/utils'
	import { page } from '$app/stores'
	import type { AvailableLevels } from '$lib/type'
	import { storedGrade } from '$lib/stores'
	import { get } from 'svelte/store'

	const questions = data.questions
	const theme_url_params = decodeURI($page.url.searchParams.get('theme') || '')
	const domain_url_params = decodeURI(
		$page.url.searchParams.get('domain') || '',
	)
	const subdomain_url_params = decodeURI(
		$page.url.searchParams.get('subdomain') || '',
	)
	const level_url_params = parseInt(
		decodeURI($page.url.searchParams.get('level') || '') || '0',
		10,
	)

	let grade = get(storedGrade)
	let availableLevels: AvailableLevels
	let themes: string[]
	let theme = theme_url_params
	let domains: string[]
	let domain = domain_url_params
	let subdomains: string[]
	let subdomain = subdomain_url_params
	let levels: number[]
	let level = level_url_params
	let selectedGrade = grade

	$: changeGrade(selectedGrade)

	function changeGradeThemeDomainSubdomainLevel(
		new_grade: string,
		theme = '',
		domain = '',
		subdomain = '',
		level = 0,
	) {
		grade = grades.includes(new_grade) ? new_grade : grades[grades.length - 1]
		storedGrade.set(grade)
		availableLevels = getAvailablesLevels(grade)
		themes = Object.keys(availableLevels)
		changeThemeDomainSubdomainLevel(theme, domain, subdomain, level)
	}

	function changeThemeDomainSubdomainLevel(
		new_theme: string,
		domain = '',
		subdomain = '',
		level = 0,
	) {
		theme = themes.includes(new_theme) ? new_theme : themes[0]
		domains = Object.keys(availableLevels[theme])
		changeDomainSubdomainLevel(domain, subdomain, level)
	}

	function changeDomainSubdomainLevel(
		new_domain: string,
		subdomain = '',
		level = 0,
	) {
		domain = domains.includes(new_domain) ? new_domain : domains[0]
		subdomains = Object.keys(availableLevels[theme][domain])
		changeSubdomainLevel(subdomain, level)
	}

	function changeSubdomainLevel(new_subdomain: string, new_level: number) {
		subdomain = subdomains.includes(new_subdomain)
			? new_subdomain
			: subdomains[0]
		levels = availableLevels[theme][domain][subdomain]
		level = levels.includes(new_level) ? new_level : 1
		// generated = prepareCorrectedQuestion(
		// 	prepareAnsweredQuestion(generateExemple(theme, domain, subdomain, level)),
		// )
	}

	// suivant le niveau (grade), retourne l'ensemble des levels disponibles par theme/domaine/sous-domaine

	function getAvailablesLevels(grade: string): AvailableLevels {
		return objectMap(questions, (theme) =>
			objectMap(theme, (domain) =>
				objectMap(domain, (subdomain) => {
					return subdomain.reduce((availables, q, l) => {
						if (gradeMatchesClass(q.grade, grade)) {
							availables.push(l + 1)
						}
						return availables
					}, [] as number[])
				}),
			),
		)
	}

	function changeGrade(grade: string) {
		changeGradeThemeDomainSubdomainLevel(grade, theme, domain, subdomain, level)
	}

	const selected = 'ml-1 mb-2 btn-icon variant-filled-primary'
</script>

<h3>Les automaths !</h3>
<button class={selected}>mll</button>

<!-- {#if theme}
	<TabGroup
		justify="justify-start flex-wrap"
		active="border-b-4 border-primary-500"
		hover="hover:variant-soft-primary"
	>
		{#each themes as t (t)}
			<Tab
				on:click={() => changeThemeDomainSubdomainLevel(t)}
				group={theme}
				name={t}
				value={t}>{t}</Tab
			>
		{/each}
		<svelte:fragment slot="panel">
			<Accordion autocollapse>
				{#each domains as d, i (theme + d)}
					<AccordionItem
						open={d === domain}
						on:click={() => changeDomainSubdomainLevel(d)}
					>
						<svelte:fragment slot="summary"
							><p
								class={'font-bold ' + (domain === d ? 'text-primary-500' : '')}
							>
								{@html $formatLatexToHtml(d)}
							</p></svelte:fragment
						>
						<div slot="content" class="pl-14 border-l-2 border-primary-500">
							{#each subdomains as subd (theme + d + subd)}
								<div class="my-5 flex items-center">
									<span class="mb-2">{@html $formatLatexToHtml(subd)}</span>
									<div class="flex flex-wrap">
										{#if Array.isArray(availableLevels[theme][d][subd])}
											{#each availableLevels[theme][d][subd] as l (theme + d + subd + l)}
												<button
													on:click={() => changeSubdomainLevel(subd, l)}
													class={subdomain === subd && level === l
														? 'selected'
														: 'not-selected'}>{l}</button
												>
											{/each}
										{/if}
									</div>
									<div style="flex-grow:1;" />
								</div>
							{/each}
						</div>
					</AccordionItem>
				{/each}
			</Accordion>
		</svelte:fragment>
	</TabGroup>
{/if} -->
<!-- <style lang="postcss">
	.selected {
		@apply ml-1 mb-2 btn-icon variant-filled-primary;
	}
	.not-selected {
		@apply ml-1 mb-2 btn-icon variant-filled-surface;
	}
</style> -->
