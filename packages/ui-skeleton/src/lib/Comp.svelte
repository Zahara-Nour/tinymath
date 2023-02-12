<script lang="ts">
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton'
	let valueSingle = 'books'
</script>

<button class="btn variant-filled-secondary">Skeleton</button>

<ListBox>
	<ListBoxItem bind:group={valueSingle} name="books" value="books"
		>Books</ListBoxItem
	>
	<ListBoxItem bind:group={valueSingle} name="movies" value="movies"
		>Movies</ListBoxItem
	>
	<ListBoxItem bind:group={valueSingle} name="television" value="television"
		>Television</ListBoxItem
	>
</ListBox>
