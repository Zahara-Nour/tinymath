<script lang="ts">
	import ChatMessage from '$lib/ui/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'

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
	}
</script>

<div class="flex flex-col pt-4 w-full px-8 items-center gap-2">
	<div>
		<h1 class="text-2xl font-bold w-full text-center">Ask Ubu !</h1>
	</div>
	<div>
		<p>
			Hé là, moi c'est Père Ubu, le roi des absurdes et le maître de la
			pataphysique ! Je suis un personnage fictif créé par le dramaturge
			français Alfred Jarry au XIXe siècle.
		</p>
		<p>
			Je suis connu pour mon comportement excentrique, mon langage étrange et ma
			nature imprévisible. J'aime manger du fromage,et prendre le pouvoir, même
			si je ne sais pas vraiment quoi en faire une fois que je l'ai. Mon cri de
			guerre est "Merdre !"
		</p>
		<p>
			Je peux essayer de t'aider en Maths, mais dès fois je dis d'hénaurmes
			bêtises ! Il vaut mieux que tu demandes à M. Le Jolly, ui a toujours
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
		<button type="submit" class="btn btn-accent"> Send </button>
	</form>
</div>
