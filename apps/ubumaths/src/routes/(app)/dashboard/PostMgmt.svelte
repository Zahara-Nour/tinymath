<script lang="ts">
	import Tiptap from '$lib/ui/Tiptap.svelte'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { Pulse } from 'svelte-loading-spinners'
	import { popup, toastStore, type PopupSettings } from '@skeletonlabs/skeleton'
	import { fetchPosts, fetchTags, insertPost } from '$lib/db'
	import db from '$lib/db'
	import IconPencil from '$lib/icones/IconPencil.svelte'
	import { exclude_internal_props } from 'svelte/internal'
	import IconCheck from '$lib/icones/IconCheck.svelte'
	import IconNew from '$lib/icones/IconNew.svelte'

	let title = ''
	let summary = ''
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

	type Tag = {
		id: number
		name: string
	}
	let tags: Tag[] = []

	type Post = {
		id: number
		title: string
		summary: string
		content: string
		tags: string[]
	}

	updatePosts()
	$: updatePost(post_id, posts)

	function updatePost(post_id: number | null, posts: Post[]) {
		console.log('post_id', post_id)
		console.log('posts', posts)
		if (post_id) {
			const post = posts.find((post) => post.id === post_id)
			console.log('post', post)
			if (post) {
				title = post.title
				summary = post.summary
				content = post.content
				selectedTags = post.tags
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
		console.log('selectedTags', selectedTags)
	}
	function updatePosts() {
		console.log('updatePosts')
		fetchPosts(db).then(({ data, error }) => {
			console.log('data', data)
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
				console.log('posts', posts)
			}
		})
	}
	fetchTags(db).then(({ data, error }) => {
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
			console.log('tags', tags)
		}
	})

	function displayPost(post_id: number | null) {}

	const submitPost: SubmitFunction = async ({ action, cancel }) => {
		pendingUpdatePost = true

		if (post_id) {
			const { data, error } = await db
				.from('posts')
				.update({ title, summary, content, tags: selectedTags })
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
			const { data, error } = await insertPost(db, {
				title,
				summary,
				content,
				tags: selectedTags,
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
		content = ''
		selectedTags = []
	}
</script>

<div class="mt-8 card">
	<header class="card-header">
		<h3 class="flex items-center gap-2">
			Post<button on:click={() => (post_id = null)}><IconNew /></button>
		</h3>
	</header>
	<section class="p-4">
		<form method="post" use:enhance={submitPost}>
			<div class="flex flex-col gap-2">
				<label class="label">
					<span>Titre</span>
					<input class="input" type="text" bind:value={title} />
				</label>
				<label class="label">
					<span>Résumé</span>
					<textarea class="textarea" rows="4" bind:value={summary} />
				</label>
				<div class="label">
					<span>Tags</span>
					<div class="flex flex-wrap gap-1 items-center">
						{#each tags as tag}
							{@const selected = selectedTags.includes(tag.name)}
							<span
								class="chip {selected ? 'variant-filled' : 'variant-soft'}"
								on:click={() => {
									console.log('toggle')
									toggleTag(tag.name)
								}}
								on:keypress
								>{#if selected}<IconCheck />{/if}{tag.name}</span
							>
						{/each}
					</div>
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
