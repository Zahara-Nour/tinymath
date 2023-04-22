<script lang="ts">
	import ChatMessage from '$lib/ui/ChatMessage.svelte'
	import { toastStore } from '@skeletonlabs/skeleton'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import ubu from '$lib/images/ubu-roi.jpg'

	let query: string = ''
	let answer: string = ''
	let loading: boolean = false
	let chatMessages: ChatCompletionRequestMessage[] = []
	let scrollToDiv: HTMLDivElement

	function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({
				behavior: 'smooth',
				block: 'end',
				inline: 'nearest',
			})
		}, 100)
	}

	const handleSubmit = async () => {
		loading = true
		chatMessages = [...chatMessages, { role: 'user', content: query }]

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json',
			},
			payload: JSON.stringify({
				messages: chatMessages.map((message) =>
					message.role === 'user'
						? {
								...message,
								content:
									'Réponds à la façon de Père Ubu,  à la question : " ' +
									message.content +
									'"',
						  }
						: message,
				),
			}),
		})

		query = ''

		eventSource.addEventListener('error', handleError)

		eventSource.addEventListener('message', (e) => {
			scrollToBottom()
			try {
				loading = false
				if (e.data === '[DONE]') {
					chatMessages = [
						...chatMessages,
						{ role: 'assistant', content: answer },
					]
					answer = ''
					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if (delta.content) {
					answer = (answer ?? '') + delta.content
				}
			} catch (err) {
				handleError(err)
			}
		})
		eventSource.stream()
		scrollToBottom()
	}

	function handleError<T>(err: T) {
		loading = false
		query = ''
		answer = ''
		console.error(err)
		toastStore.trigger({
			message:
				"Une erreur est survenue. La limite d'utilisation est surement dépassée : " +
				err,
			background: 'bg-error-500',
		})
	}
</script>

<div class="flex flex-col pt-4 w-full px-8 items-center gap-2">
	<div>
		<h1 class="text-2xl font-bold w-full text-center">Père Ubu</h1>
	</div>
	<div>
		<img src={ubu} alt="Père Ubu" width="150px" class="float-left pr-2 pb-2" />
		<p class="my-2">
			Hé là, moi c'est Père Ubu, le roi des absurdes et le maître de la
			<a href="http://college-de-pataphysique.fr/presentation/"
				>'Pataphysique'</a
			> ! Je suis un personnage fictif créé par le dramaturge français Alfred Jarry
			au XIXe siècle.
		</p>
		<p class="my-2">
			Je suis connu pour mon comportement excentrique, mon langage étrange et ma
			nature imprévisible. Mon cri de guerre est "Merdre !"
		</p>
		<p class="my-2">
			Je peux essayer de t'aider en Maths, mais dès fois je dis d'<i
				>hénaurmes</i
			>
			bêtises ! Il vaut alors mieux que tu demandes à M. Le Jolly, qui a toujours
			raison.
		</p>
	</div>
	<div
		class=" w-full bg-surface-500 rounded-md p-4 overflow-y-auto flex flex-col gap-4"
	>
		<div class="flex flex-col gap-2">
			<ChatMessage
				type="assistant"
				message="De par ma chandelle verte, comment veux-tu que je t'aide ?"
			/>
			{#each chatMessages as message}
				<ChatMessage type={message.role} message={message.content} />
			{/each}
			{#if answer}
				<ChatMessage type="assistant" message={answer} />
			{/if}
			{#if loading}
				<ChatMessage type="assistant" message="Loading.." />
			{/if}
		</div>
		<div class="" bind:this={scrollToDiv} />
	</div>
	<form
		class="flex w-full rounded-md gap-4 bg-surface-600 p-4"
		on:submit|preventDefault={() => handleSubmit()}
	>
		<input type="text" class="input input-bordered w-full" bind:value={query} />
		<button type="submit" class="btn variant-filled-primary"> Envoyer </button>
	</form>
</div>
