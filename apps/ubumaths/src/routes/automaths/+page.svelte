<script lang="ts">
	import data, { getQuestion } from '$lib/questions/questions'
	import { gradeMatchesClass, grades } from '$lib/grades'
	import generateQuestion from '$lib/questions/generateQuestion'
	import Buttons from './Buttons.svelte'
	import Basket from './Basket.svelte'
	import { fetchImage } from '$lib/images'
	import { goto } from '$app/navigation'
	import { getLogger, objectMap } from '$lib/utils'
	import { formatToHtml } from '$lib/stores'
	import {
		assessItem,
		prepareAnsweredQuestion,
		prepareCorrectedQuestion,
	} from '$lib/questions/correction'
	import { dev } from '$app/environment'
	import { page } from '$app/stores'
	import math from 'tinycas'
	import type {
		GeneratedQuestion,
		Basket as BasketType,
		BasketItem,
		CorrectedQuestion,
		AvailableLevels,
	} from '$lib/type'
	import Question from '$lib/ui/Question.svelte'
	import {
		Accordion,
		AccordionItem,
		Tab,
		TabGroup,
	} from '@skeletonlabs/skeleton'
	import QuestionCard from '$lib/ui/QuestionCard.svelte'
	import { afterUpdate, beforeUpdate, onMount } from 'svelte'

	let { info, fail, warn } = getLogger('Automaths', 'info')
	const questions = data.questions

	let domain: string
	let subdomain: string
	let level: number
	let levels: number[] = []
	let domains: string[] = []
	let subdomains: string[] = []
	let grade = grades[grades.length - 1]
	let availableLevels: AvailableLevels
	let themes: string[] = Object.keys(questions)
	let theme: string = themes[0]
	let displayExemple = false
	let generated: CorrectedQuestion
	let showBasket = false
	let classroom = false
	let flash = false
	let basket: BasketType = []
	let courseAuxNombres = false
	let correction = false

	// mode interactif pour l'exemple
	let interactive = true
	const ids = data.ids
	const first_theme = decodeURI($page.url.searchParams.get('theme') || '')
	const first_domain = decodeURI($page.url.searchParams.get('domain') || '')
	const first_subdomain = decodeURI(
		$page.url.searchParams.get('subdomain') || '',
	)
	const first_level = parseInt(
		decodeURI($page.url.searchParams.get('level') || '1'),
		10,
	)

	// $: console.log('theme', theme)
	// $: console.log('domain', domain)
	// $: console.log('subdomain', subdomain)
	// $: console.log('level', level)

	// $ changeDomain(domain)

	function generateExoTexmacs() {
		let questions: BasketItem[] = []
		if (basket.length) {
			questions = basket
		} else {
			const q = getQuestion(theme, domain, subdomain, level)
			questions.push({ id: q.id, count: 10 })
		}

		let offset = 0
		let enounce = ''
		let solution = ''
		let generateds: CorrectedQuestion[] = []

		function replaceTexmacs(match: string, p1: string) {
			return '<math|' + math(p1).texmacs + '>'
		}

		questions.forEach((q) => {
			const { theme, domain, subdomain, level } = ids[q.id]
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
					// console.log('simpleCorrectiopn', generated.simpleCorrection)
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
						// console.log('enounce', enounce)
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
		level = 1,
	) {
		// console.log('-change grade')
		grade = new_grade
		console.log('grade', grade)
		availableLevels = getAvailablesLevels(grade)
		themes = Object.keys(availableLevels)
		changeThemeDomainSubdomainLevel(
			theme || themes[0],
			domain,
			subdomain,
			(level = 1),
		)
	}

	function changeThemeDomainSubdomainLevel(
		new_theme: string,
		domain = '',
		subdomain = '',
		level = 1,
	) {
		theme = new_theme
		domains = Object.keys(questions[theme])
		changeDomainSubdomainLevel(domain || domains[0], subdomain, level)
	}

	function changeDomainSubdomainLevel(
		new_domain: string,
		subdomain = '',
		level = 1,
	) {
		domain = new_domain
		console.log('domain', domain)
		subdomains = Object.keys(questions[theme][domain])
		console.log('subdomains', subdomains)
		changeSubdomainLevel(subdomain || subdomains[0], level)
	}

	function changeSubdomainLevel(new_subdomain: string, new_level = 1) {
		subdomain = new_subdomain
		level = new_level
		console.log('subdomain', subdomain)
		levels = availableLevels[theme][domain][subdomain]
		console.log('levels', levels)
		console.log('level', level)
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
			questions.push({ id: q.id, count: 10 })
		}

		const base = dev ? 'http://localhost:5173/' : 'http://ubumaths.net/'

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

	// $: changeGrade(grade)
	// $: changeTheme(theme)

	$: changeGradeThemeDomainSubdomainLevel(grade)

	$: if (courseAuxNombres) {
		basket.forEach((item) => {
			item.count = 1
		})
		basket = basket
	}
	onMount(() => console.log('onMount'))
	beforeUpdate(
		(() => {
			let nupdate = 0
			return () => console.log('beforeUpdate', nupdate++)
		})(),
	)
	afterUpdate(() => console.log('afterUpdate'))
</script>

<h3>Les automaths !</h3>

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
	<label class="label">
		<span>Niveau</span>
		<select class="select" bind:value={grade}>
			{#each grades as grade, i}
				<option value={grade}>{grade}</option>
			{/each}
		</select>
	</label>
{/if}

{#if showBasket}
	<!-- {#if isTeacher && showBasket} -->
	<Basket bind:basket {courseAuxNombres} />
{:else if theme}
	<TabGroup>
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
						open={i === 0}
						on:click={() => changeDomainSubdomainLevel(d)}
					>
						<svelte:fragment slot="summary"
							><p class="font-bold">{d}</p></svelte:fragment
						>
						<svelte:fragment slot="content">
							{#each subdomains as subd (theme + d + subd)}
								<div class="my-5 flex items-center">
									<span>{subd}</span>
									<div class="flex flex-wrap">
										{#if Array.isArray(availableLevels[theme][d][subd])}
											{#each availableLevels[theme][d][subd] as l (theme + d + subd + l)}
												{@const buttonClass =
													'ml-2 mb-2 btn-icon ' +
													(subdomain === subd && level === l
														? 'variant-filled-primary'
														: 'variant-filled-secondary')}
												<button
													on:click={() => changeSubdomainLevel(subd, l)}
													class={buttonClass}>{l}</button
												>
											{/each}
										{/if}
									</div>
									<div style="flex-grow:1;" />
								</div>
							{/each}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			</Accordion>
		</svelte:fragment>
	</TabGroup>
{/if}

{#if displayExemple}
	<div
		class=" w-full bg-surface-50-900-token px-2 py-5 sticky bottom-0 z-10 flex items-center justify-center"
	>
		<hl />
		<QuestionCard
			class="max-w-xl"
			card={generated}
			showDescription={true}
			bind:correction
			bind:interactive
			immediateCommit={false}
		/>
	</div>
{/if}
