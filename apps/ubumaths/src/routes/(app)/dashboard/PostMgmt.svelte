<script lang="ts">
	import Tiptap from '$lib/ui/Tiptap.svelte'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'

	export let db: SupabaseClient<Database>

	let title = ''
	let summary = ''
	let body = ''
</script>

<Tiptap />
