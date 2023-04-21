<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	import ubu from '$lib/images/pere-ubu-head.jpg'
	import { Avatar } from '@skeletonlabs/skeleton'
	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
</script>

<div class="justify-end">
	<div class={`flex items-start ${type === 'user' ? 'flex-row-reverse' : ''}`}>
		<Avatar
			class="flex-none"
			src={type === 'user' ? 'https://ui-avatars.com/api/?name=Me' : ubu}
			width="w-12"
			rounded="rounded-full"
		/>

		<div
			class={type === 'user'
				? 'max-w-sm mx-2 p-2 rounded bg-primary-600 text-white inline-block'
				: 'max-w-sm mx-2 p-2 rounded bg-secondary-600 text-white inline-block'}
		>
			{message}
		</div>
	</div>
</div>
