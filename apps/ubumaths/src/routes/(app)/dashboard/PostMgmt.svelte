<script lang="ts">
	import Tiptap from '$lib/ui/Tiptap.svelte'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { Pulse } from 'svelte-loading-spinners'
	import { popup, toastStore, type PopupSettings } from '@skeletonlabs/skeleton'
	import { DB_fetchPosts, DB_fetchTags, DB_insertPost } from '$lib/db'
	import db from '$lib/db'
	import IconPencil from '$lib/icones/IconPencil.svelte'
	import IconCheck from '$lib/icones/IconCheck.svelte'
	import IconNew from '$lib/icones/IconNew.svelte'
	import type { Post, Tag } from '../../../types/type'
	import { DateTime } from 'luxon'

	let title = ''
	let summary = ''
	let metadescription = ''
	let content = ''
	let post_id: number | null = null
	let pendingUpdatePost = false
	let popupUpdatePost: PopupSettings = {
		// Set the event as: click | hover | hover-click
		event: 'hover',
		// Provide a matching 'data-popup' value.
		target: 'popupUpdatePost',
	}
	let posts: Post[] = []
	let selectedTags: string[] = []

	let tags: Tag[] = []
	let updated_at = ''

	let published_at = DateTime.now().toISODate()

	updatePosts()
	$: updatePost(post_id, posts)

	function updatePost(post_id: number | null, posts: Post[]) {
		console.log('updatePost', post_id, posts)
		if (post_id) {
			const post = posts.find((post) => post.id === post_id)
			if (post) {
				title = post.title
				summary = post.summary
				metadescription = post.metadescription
				content = post.content
				selectedTags = post.tags
				updated_at = DateTime.fromSQL(
					post.updated_at.replace(/T/, ' '),
				).toISODate()
				published_at = DateTime.fromSQL(
					post.published_at.replace(/T/, ' '),
				).toISODate()
			}
		} else {
			resetPost()
		}
	}
	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags.splice(selectedTags.indexOf(tag), 1)
		} else {
			selectedTags.push(tag)
		}
		selectedTags = selectedTags
	}
	function updatePosts() {
		DB_fetchPosts(db).then(({ data, error }) => {
			if (error) {
				toastStore.trigger({
					message: 'La récupération des posts a échoué :' + error.message,
					background: 'bg-error-500',
				})
			} else if (!data) {
				toastStore.trigger({
					message: 'Aucune donné retrouvée pour les posts.',
					background: 'bg-error-500',
				})
			} else {
				posts = data
			}
		})
	}
	DB_fetchTags(db).then(({ data, error }) => {
		if (error) {
			toastStore.trigger({
				message: 'La récupération des tags a échoué :' + error.message,
				background: 'bg-error-500',
			})
		} else if (!data) {
			toastStore.trigger({
				message: 'Aucune donné retrouvée pour les tags.',
				background: 'bg-error-500',
			})
		} else {
			tags = data
		}
	})

	const submitPost: SubmitFunction = async ({ action, cancel }) => {
		pendingUpdatePost = true

		if (post_id) {
			const { data, error } = await db
				.from('posts')
				.update({
					title,
					summary,
					content,
					tags: selectedTags,
					metadescription,
					updated_at: DateTime.now().toSQL(),
					published_at: DateTime.fromISO(published_at).toSQL(),
				})
				.match({ id: post_id })
			if (error) {
				// fail(error.message)
				toastStore.trigger({
					message: "Le post n'a pas pu être mis à jour.",
					background: 'bg-error-500',
				})
			} else {
				toastStore.trigger({
					message: 'Le post a été mis à jour avec succès.',
					background: 'bg-success-500',
				})
				updatePosts()
			}
		} else {
			const { data, error } = await DB_insertPost(db, {
				title,
				summary,
				content,
				metadescription,
				tags: selectedTags,
				updated_at: DateTime.now().toSQL(),
				published_at: DateTime.fromISO(published_at).toSQL(),
			})
			if (error) {
				// fail(error.message)
				toastStore.trigger({
					message: "Le post n'a pas pu être enregistré.",
					background: 'bg-error-500',
				})
			} else {
				toastStore.trigger({
					message: 'Le post a été enregistré avec succès.',
					background: 'bg-success-500',
				})
				post_id = data.id
				updatePosts()
			}
		}
		cancel()
		pendingUpdatePost = false
	}

	function resetPost() {
		post_id = null
		title = ''
		summary = ''
		metadescription = ''
		content = ''
		selectedTags = []
		published_at = DateTime.now().toISODate()
		updated_at = ''
	}
</script>

<div class="container mx-auto p-4 max-w-screen-md">
	<div class="mt-8 card">
		<header class="card-header">
			<h3 class="flex items-center gap-2">
				Post<button on:click={() => (post_id = null)}><IconNew /></button>
			</h3>
		</header>
		<section class="p-4">
			<form method="post" use:enhance={submitPost}>
				<div class="flex flex-col gap-4">
					<label class="label">
						<span>Titre</span>
						<input class="input" type="text" bind:value={title} />
					</label>
					<label class="label">
						<span>Résumé</span>
						<textarea class="textarea" rows="4" bind:value={summary} />
					</label>
					<label class="label">
						<span>Metadescription</span>
						<textarea
							class="textarea"
							class:input-error={metadescription.length >= 150}
							rows="4"
							bind:value={metadescription}
						/>
					</label>
					<div class="label">
						<span>Tags</span>
						<div class="flex flex-wrap gap-1 items-center">
							{#each tags as tag}
								{@const selected = selectedTags.includes(tag.name)}
								<span
									class="chip {selected ? 'variant-filled' : 'variant-soft'}"
									on:click={() => {
										toggleTag(tag.name)
									}}
									on:keypress
									>{#if selected}<IconCheck />{/if}{tag.name}</span
								>
							{/each}
						</div>
					</div>
					{#if post_id}
						<div class="label">
							<span>Mise à jour le : {updated_at}</span>
						</div>
					{/if}
					<div class="label">
						{#if post_id}
							<div class="label">
								<span>Publié le : {published_at}</span>
							</div>
						{:else}
							<div class="flex items-center gap-2">
								<span>Publié le</span>
								<input
									class="input max-w-xs"
									class:input-error={!DateTime.fromISO(published_at).isValid}
									type="text"
									bind:value={published_at}
								/>
							</div>
						{/if}
					</div>
					<span class="label">Contenu</span>
					<Tiptap bind:content />
				</div>
				<div class="flex justify-center">
					{#if pendingUpdatePost}
						<span class="mt-8">
							<Pulse size="60" color="#ffc400" unit="px" duration="1s" />
						</span>
					{:else}
						<div class="p-1 inline-block" use:popup={popupUpdatePost}>
							<button
								type="submit"
								disabled={false}
								class="my-4 btn variant-filled-primary"
							>
								{#if post_id}Mettre à jour{:else}Enregistrer{/if}
							</button>
						</div>
					{/if}
				</div>
			</form>
		</section>
		<footer class="card-footer" />
	</div>

	posts
	<ul class="list">
		{#each posts as post}
			<li>
				<span class="flex-auto">{post.title}</span>
				<span class="flex-grow" />
				<button
					class="btn btn-icon variant-filled-primary"
					on:click={() => {
						post_id = post.id
					}}
				>
					<IconPencil />
				</button>
			</li>
			<!-- ... -->
		{/each}
	</ul>
</div>
