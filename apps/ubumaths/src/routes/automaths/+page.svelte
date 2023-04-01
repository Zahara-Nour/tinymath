<script lang="ts">
	import questions, {
		getQuestion,
		questions_ids,
	} from '$lib/questions/questions'
	import { gradeMatchesClass, grades } from '$lib/grades'
	import generateQuestion from '$lib/questions/generateQuestion'
	import Buttons from './Buttons.svelte'
	import Basket from './Basket.svelte'
	import { fetchImage } from '$lib/images'
	import { goto } from '$app/navigation'
	import { getLogger, objectMap } from '$lib/utils'
	import { dev } from '$app/environment'
	import {
		assessItem,
		prepareAnsweredQuestion,
		prepareCorrectedQuestion,
	} from '$lib/questions/correction'
	import { page } from '$app/stores'
	import math from 'tinycas'
	import type {
		Basket as BasketType,
		BasketItem,
		CorrectedQuestion,
		AvailableLevels,
	} from '../../types/type'
	import {
		Accordion,
		AccordionItem,
		Tab,
		TabGroup,
		toastStore,
	} from '@skeletonlabs/skeleton'
	import QuestionCard from '$lib/ui/QuestionCard.svelte'
	import { afterUpdate, beforeUpdate, onMount } from 'svelte'
	import { formatLatexToHtml, storedGrade } from '$lib/stores'
	import { get } from 'svelte/store'
	import PageHeader from '$lib/ui/PageHeader.svelte'

	export let data

	let { info, fail, warn } = getLogger('Automaths', 'info')
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
	const assessment_url_params = parseInt(
		decodeURI($page.url.searchParams.get('assessment') || '') || '0',
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
	let displayExemple = false
	let generated: CorrectedQuestion
	let showBasket = !!assessment_url_params
	let classroom = false
	let flash = false
	let courseAuxNombres = false
	let correction = false
	let basket: BasketType = []
	let interactive = false
	let selectedGrade = grade

	const classSelected = 'ml-1 mb-2 btn-icon variant-filled-primary'
	const classNotSelected = 'ml-1 mb-2 btn-icon variant-filled-tertiary'

	$: changeGrade(selectedGrade)
	$: if (courseAuxNombres) {
		basket.forEach((item) => {
			item.count = 1
		})
		basket = basket
	}

	function generateExoTexmacs() {
		let questions: BasketItem[] = []
		if (basket.length) {
			questions = basket
		} else {
			const q = getQuestion(theme, domain, subdomain, level)
			questions.push({ id: q.id, count: 10, delay: q.defaultDelay })
		}

		let offset = 0
		let enounce = ''
		let solution = ''
		let generateds: CorrectedQuestion[] = []

		function replaceTexmacs(match: string, p1: string) {
			return '<math|' + math(p1).texmacs + '>'
		}

		questions.forEach((q) => {
			const { theme, domain, subdomain, level } = questions_ids[q.id]
			const question = getQuestion(theme, domain, subdomain, level)

			if (q.enounceAlone) {
				enounce = '<\\exo|'
				enounce += question.enounces[0].replace(
					/\$\$(.*)?\$\$/g,
					replaceTexmacs,
				)
				enounce += '>\n'
				enounce += '<\\enumerate-alpha>\n'
				solution = '<\\exo|'
				solution += question.enounces[0].replace(
					/\$\$(.*)?\$\$/g,
					replaceTexmacs,
				)
				solution += '>\n'
				solution += '<\\enumerate-alpha>\n'
				for (let i = 0; i < q.count; i++) {
					const generated = generateQuestion(
						question,
						generateds,
						q.count,
						offset,
					)
					const correctedQuestion = assessItem(
						prepareAnsweredQuestion(generated),
					)
					enounce += '<item>'
					solution +=
						'<item>' +
						correctedQuestion.simpleCorrection
							.map((line) => line.texmacs)
							.join('') +
						'\n\n'
					if (correctedQuestion.expression) {
						enounce +=
							'<math|' + math(correctedQuestion.expression).texmacs + '>\n\n'
					}
					if (correctedQuestion.answerField) {
						enounce +=
							correctedQuestion.answerField
								.replace(/\$\$(.*)?\$\$/g, replaceTexmacs)
								.replace(/\.\.\./g, '......') + '\n\n'
					}

					generateds.push(correctedQuestion)
				}
			} else {
				enounce = '\\begin{enumerate} \n'
				solution += '\\begin{enumerate} \n'
				for (let i = 0; i < q.count; i++) {
					const generated = generateQuestion(
						question,
						generateds,
						q.count,
						offset,
					)
					const correctedQuestion = assessItem(
						prepareAnsweredQuestion(generated),
					)
					solution +=
						'\\item ' +
						correctedQuestion.simpleCorrection
							.map((line) => line.texmacs)
							.join(' ')
					enounce +=
						'\\item ' +
						correctedQuestion.enounce
							.replace(/\$\$/g, '$')
							.replace(/\\lt/g, '<')
							.replace(/\\gt/g, '>') +
						'\n'
					if (correctedQuestion.expression) {
						enounce +=
							correctedQuestion.expression_latex.replace(
								/\\ldots/g,
								'\\text{\\ \\ldots\\ldots \\ }',
							) + '\n'
					}
					if (correctedQuestion.answerField) {
						enounce +=
							correctedQuestion.answerField
								.replace(/\$\$/g, '$')
								.replace(/\.\.\./g, '\\text{\\ \\ldots\\ldots \\ }') + '\n'
					}
					generateds.push(correctedQuestion)
				}
			}

			offset += q.count
		})
		enounce += '</enumerate-alpha>\n'
		solution += '</enumerate-alpha>\n'
		enounce += '</exo>'
		solution += '</exo>'

		// const output = enounce + '\n'
		const output = enounce + '\n' + solution
		navigator.clipboard
			.writeText(output)
			.then(function () {
				info('latex to clipboard: ', output)
			})
			.catch(function () {
				fail('failed to write exercice in latex to clipboard')
			})
	}

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
		generated = prepareCorrectedQuestion(
			prepareAnsweredQuestion(generateExemple(theme, domain, subdomain, level)),
		)
	}

	function generateExemple(
		theme: string,
		domain: string,
		subdomain: string,
		level: number,
	) {
		const q = getQuestion(theme, domain, subdomain, level)
		const generated = generateQuestion(q)
		if (generated.image) {
			generated.imageBase64P = fetchImage(generated.image)
		}
		if (generated.imageCorrection) {
			generated.imageCorrectionBase64P = fetchImage(generated.imageCorrection)
		}
		if (generated.choices) {
			generated.choices.forEach(async (choice) => {
				if (choice.image) {
					choice.imageBase64P = fetchImage(choice.image)
				}
			})
		}
		return generated
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

	function launchTest() {
		let questions = []
		if (basket.length) {
			questions = basket
		} else {
			const q = getQuestion(theme, domain, subdomain, level)
			questions.push({ id: q.id, count: 10 })
		}

		let href = '/automaths/assessment/?questions='
		href += encodeURI(JSON.stringify(questions))
		if (classroom) href += '&classroom=true'
		if (flash) href += '&flash=true'
		if (courseAuxNombres) href += '&courseAuxNombres=true'
		goto(href)
	}

	function fillBasket() {
		addToBasket(theme, domain, subdomain, level, 1)
	}

	function flushBasket() {
		basket = []
	}

	function copyLink() {
		let questions: BasketItem[] = []
		if (basket.length) {
			questions = basket
		} else {
			const q = getQuestion(theme, domain, subdomain, level)
			questions.push({ id: q.id, count: 10, delay: q.defaultDelay })
		}

		const base = dev ? 'http://localhost:5173/' : 'https://ubumaths.net/'
		let href = base + 'automaths/assessment/?questions='
		href += encodeURI(JSON.stringify(questions))
		if (classroom) href += '&classroom=true'
		if (flash) href += '&flash=true'
		if (courseAuxNombres) href += '&courseAuxNombres=true'
		navigator.clipboard
			.writeText(href)
			.then(function () {
				info('copy test url to clipboard: ', href)
			})
			.catch(function () {
				fail('failed to write exercice url to clipboard')
			})
	}

	function addToBasket(
		theme: string,
		domain: string,
		subdomain: string,
		level: number,
		count: number,
		delay = 0,
	) {
		let qs = questions[theme][domain][subdomain]
		const q = qs.find((q) => qs.indexOf(q) + 1 === level)
		if (q) {
			if (!delay) delay = q.defaultDelay
			const index = basket.findIndex((item) => item.id === q.id)
			if (index !== -1) {
				basket[index].count++
			} else {
				basket = [
					...basket,
					{
						id: q.id,
						count,
						delay,
					},
				]
			}
		} else fail(`question ${theme}-${domain}-${subdomain}-${level} not found.`)
	}

	function changeGrade(grade: string) {
		changeGradeThemeDomainSubdomainLevel(grade, theme, domain, subdomain, level)
	}
</script>

<PageHeader title="Automaths" />
<div class="container mx-auto px-2">
	<Buttons
		bind:showBasket
		bind:classroom
		bind:flash
		bind:displayExemple
		bind:courseAuxNombres
		{basket}
		{launchTest}
		{fillBasket}
		{copyLink}
		{generateExoTexmacs}
		{flushBasket}
	/>

	{#if !showBasket}
		<div class="my-8 label">
			<span>Niveau : </span>
			<select class="select max-w-xs" bind:value={selectedGrade}>
				{#each grades as grade, i}
					<option value={grade}>{grade}</option>
				{/each}
			</select>
		</div>
	{/if}

	{#if showBasket}
		<!-- {#if isTeacher && showBasket} -->
		<Basket
			db={data.supabase}
			assessment_id={assessment_url_params}
			bind:basket
			{courseAuxNombres}
		/>
	{:else if theme}
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
									class={'font-bold ' +
										(domain === d ? 'text-primary-500' : '')}
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
															? classSelected
															: classNotSelected}>{l}</button
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
	{/if}

	{#if displayExemple}
		<div
			class=" border-t-2 w-full bg-surface-50-900-token px-2 py-5 sticky bottom-0 z-10 flex items-center justify-center"
		>
			<hl />
			<QuestionCard
				class="max-w-xl"
				card={generated}
				showDescription
				bind:correction
				bind:interactive
				immediateCommit
				flashcard
			/>
		</div>
	{/if}
</div>
