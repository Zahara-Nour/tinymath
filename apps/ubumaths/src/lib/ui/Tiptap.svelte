<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { Editor } from '@tiptap/core'
	import StarterKit from '@tiptap/starter-kit'
	import Image from '@tiptap/extension-image'
	import supabase from '$lib/db'
	import IconBulletList from '$lib/icones/IconBulletList.svelte'
	import IconNumberList from '$lib/icones/IconNumberList.svelte'
	import IconCode from '$lib/icones/IconCode.svelte'
	import IconCodeBlock from '$lib/icones/IconCodeBlock.svelte'
	import IconQuote from '$lib/icones/IconQuote.svelte'
	import IconReturn from '$lib/icones/IconReturn.svelte'
	import IconUndo from '$lib/icones/IconUndo.svelte'
	import IconRedo from '$lib/icones/IconRedo.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'

	export let content = `
			<p>Hello World! 🌍️ </p> 
			<img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
			`

	let element: Element
	let editor: Editor

	function setEditor(content: string) {
		if (content !== editor?.getHTML()) {
			editor?.commands.setContent(content)
		}
	}

	$: if (content) setEditor(content)
	// $: console.log('content', content)

	function handleDrop(
		view: EditorView,
		event: DragEvent,
		slice: Slice,
		moved: boolean,
	) {
		if (
			!moved &&
			event.dataTransfer &&
			event.dataTransfer.files &&
			event.dataTransfer.files[0]
		) {
			for (const file of event.dataTransfer.files) {
				console.log('uploading ', file.name)
				let filesize = parseFloat((file.size / 1024 / 1024).toFixed(4)) // get the filesize in MB
				if (
					(file.type === 'image/jpeg' || file.type === 'image/png') &&
					filesize < 10
				) {
					supabase.storage
						.from('posts')
						.upload(`${file.name}`, file, {
							cacheControl: '3600',
							upsert: false,
						})
						.then(({ data, error }) => {
							if (error) {
								console.log(error)
							} else {
								console.log(data)
								const { schema } = view.state
								const coordinates = view.posAtCoords({
									left: event.clientX,
									top: event.clientY,
								})
								const url = `https://vlqgmctfhesdhaifmyab.supabase.co/storage/v1/object/public/posts/${file.name}`
								const node = schema.nodes.image.create({ src: url }) // creates the image element
								const transaction = view.state.tr.insert(coordinates.pos, node) // places it in the correct position
								return view.dispatch(transaction)
							}
						})
				} else {
					window.alert(
						'Images need to be in jpg or png format and less than 10mb in size.',
					)
				}
			}

			return true // handled
		}
		return false // not handled use default behaviour
	}

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [StarterKit, Image],
			content,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor
				console.log('getHtml', editor.getHTML())
				content = editor.getHTML()
			},
			editorProps: {
				handleDrop,
			},
		})
	})

	onDestroy(() => {
		if (editor) {
			editor.destroy()
		}
	})
</script>

{#if editor}
	<div class="flex flex-wrap items-center gap-1">
		<button
			on:click={() => editor.chain().focus().toggleBold().run()}
			disabled={!editor.can().chain().focus().toggleBold().run()}
			class:active={editor.isActive('bold')}
			class="editor-button"
		>
			B
		</button>
		<button
			on:click={() => editor.chain().focus().toggleItalic().run()}
			disabled={!editor.can().chain().focus().toggleItalic().run()}
			class:active={editor.isActive('italic')}
			class="editor-button"
		>
			<i>I</i>
		</button>
		<button
			on:click={() => editor.chain().focus().toggleStrike().run()}
			disabled={!editor.can().chain().focus().toggleStrike().run()}
			class:active={editor.isActive('strike')}
			class="editor-button"
		>
			<strike>S</strike>
		</button>
		<button
			on:click={() => editor.chain().focus().toggleCode().run()}
			disabled={!editor.can().chain().focus().toggleCode().run()}
			class:active={editor.isActive('code')}
			class="editor-button"
		>
			<IconCode />
		</button>
		<button
			on:click={() => editor.chain().focus().toggleCodeBlock().run()}
			class:active={editor.isActive('codeBlock')}
			class="editor-button"
		>
			<IconCodeBlock />
		</button>
		<!-- <button on:click={() => editor.chain().focus().unsetAllMarks().run()}>
			clear marks
		</button>
		<button on:click={() => editor.chain().focus().clearNodes().run()}>
			clear nodes
		</button> -->
		<button
			on:click={() => editor.chain().focus().setParagraph().run()}
			class:active={editor.isActive('paragraph')}
			class="editor-button"
		>
			p
		</button>
		<button
			on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			class:active={editor.isActive('heading', { level: 1 })}
			class="editor-button"
		>
			h1
		</button>
		<button
			on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			class:active={editor.isActive('heading', { level: 2 })}
			class="editor-button"
		>
			h2
		</button>
		<button
			on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
			class:active={editor.isActive('heading', { level: 3 })}
			class="editor-button"
		>
			h3
		</button>
		<button
			on:click={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
			class:active={editor.isActive('heading', { level: 4 })}
			class="editor-button"
		>
			h4
		</button>
		<button
			on:click={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
			class:active={editor.isActive('heading', { level: 5 })}
			class="editor-button"
		>
			h5
		</button>
		<button
			on:click={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
			class:active={editor.isActive('heading', { level: 6 })}
			class="editor-button"
		>
			h6
		</button>
		<button
			on:click={() => editor.chain().focus().toggleBulletList().run()}
			class:active={editor.isActive('bulletList')}
			class="editor-button"
		>
			<IconBulletList />
		</button>
		<button
			on:click={() => editor.chain().focus().toggleOrderedList().run()}
			class:active={editor.isActive('orderedList')}
			class="editor-button"
		>
			<IconNumberList />
		</button>

		<button
			on:click={() => editor.chain().focus().toggleBlockquote().run()}
			class:active={editor.isActive('blockquote')}
			class="editor-button"
		>
			<IconQuote />
		</button>
		<button
			on:click={() => editor.chain().focus().setHorizontalRule().run()}
			class="editor-button"
		>
			<IconMinus />
		</button>
		<button
			on:click={() => editor.chain().focus().setHardBreak().run()}
			class="editor-button"
		>
			<IconReturn />
		</button>
		<button
			on:click={() => editor.chain().focus().undo().run()}
			disabled={!editor.can().chain().focus().undo().run()}
			class="editor-button"
		>
			<IconUndo />
		</button>
		<button
			on:click={() => editor.chain().focus().redo().run()}
			disabled={!editor.can().chain().focus().redo().run()}
			class="editor-button"
		>
			<IconRedo />
		</button>
	</div>
{/if}

<div bind:this={element} />

<style lang="postcss">
	button.active {
		@apply bg-primary-500;
		color: white;
	}

	.editor-button {
		@apply rounded bg-tertiary-500 px-2 py-1 h-8;
	}
</style>
