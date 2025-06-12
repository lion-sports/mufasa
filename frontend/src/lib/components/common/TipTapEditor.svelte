<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher, type ComponentProps } from 'svelte'
	import { Editor } from '@tiptap/core'
	import StarterKit from '@tiptap/starter-kit'
	import Placeholder from '@tiptap/extension-placeholder'
	import TextAlign from '@tiptap/extension-text-align'
	import { ActivableButton, Icon, IconsDropdown } from '@likable-hair/svelte'
	import type { Transaction } from '@tiptap/pm/state'

	let dispatch = createEventDispatcher<{
		update: {
			editor: Editor
			transaction: Transaction
		}
	}>()

	export let editor: Editor | undefined = undefined
	export let content: string | undefined | null = undefined
	export let disabled: boolean = false
	export let basic: boolean = false
	export let editorTwStyles: string = ''
  export let placeholder: string = 'Write something ...'

	let element: HTMLElement | undefined = undefined

	let listIcon: string = 'mdi-format-list-bulleted'
	let headerLevelItems: ComponentProps<typeof IconsDropdown>['values'] = [
		{ value: 'p', icon: 'mdi-format-paragraph' },
		{ value: 'h1', icon: 'mdi-format-header-1' },
		{ value: 'h2', icon: 'mdi-format-header-2' },
		{ value: 'h3', icon: 'mdi-format-header-3' },
		{ value: 'h4', icon: 'mdi-format-header-4' },
		{ value: 'h5', icon: 'mdi-format-header-5' }
	]
	let headerLevelValues: ComponentProps<typeof IconsDropdown>['values'] = [headerLevelItems[0]]

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Placeholder.configure({
					placeholder
				}),
				TextAlign.configure({
					types: ['heading', 'paragraph']
				})
			],
			editorProps: {
				attributes: {
					class: `prose dark:prose-invert focus:outline-none ${editorTwStyles}`
				}
			},
			content,
			onUpdate: ({ editor, transaction }) => {
				dispatch('update', { editor, transaction })

				listIcon =
					editor?.isActive('bulletList') || !editor?.isActive('listItem')
						? 'mdi-format-list-bulleted'
						: 'mdi-format-list-numbered'

				content = editor.getHTML()
			},
			onSelectionUpdate: () => {
				if (!!editor) {
					if (editor.isActive({ textAlign: 'left' }))
						textAlignValues = [{ value: 'align-left', icon: 'mdi-format-align-left' }]
					else if (editor.isActive({ textAlign: 'center' }))
						textAlignValues = [{ value: 'align-center', icon: 'mdi-format-align-center' }]
					else if (editor.isActive({ textAlign: 'right' }))
						textAlignValues = [{ value: 'align-right', icon: 'mdi-format-align-right' }]

					if (editor.isActive('heading')) {
						if (editor.isActive('heading', { level: 1 })) {
							headerLevelValues = [headerLevelItems[1]]
						} else if (editor.isActive('heading', { level: 2 })) {
							headerLevelValues = [headerLevelItems[2]]
						} else if (editor.isActive('heading', { level: 3 })) {
							headerLevelValues = [headerLevelItems[3]]
						} else if (editor.isActive('heading', { level: 4 })) {
							headerLevelValues = [headerLevelItems[4]]
						} else if (editor.isActive('heading', { level: 5 })) {
							headerLevelValues = [headerLevelItems[5]]
						}
					} else {
						headerLevelValues = [headerLevelItems[0]]
					}
				}
			},
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor
			}
		})
	})

	onDestroy(() => {
		if (editor) {
			editor.destroy()
		}
	})

	let textAlignValues: ComponentProps<typeof IconsDropdown>['values'] = [
		{ value: 'align-left', icon: 'mdi-format-align-left' }
	]

	$: if (!!editor) {
		editor.setOptions({
			content: content,
			editable: !disabled
		})
	}
</script>

<div class="grid grid-cols-1 bg-[rgb(var(--global-color-background-200))] rounded-xl p-2">
	{#if editor && !basic && !disabled}
		<div class="mb-2 flex items-center gap-2 flex-shrink">
			<IconsDropdown
				--button-width="auto"
				--button-padding="0 0 0 4px"
				--autocomplete-selected-item-color="rgb(var(--global-color-primary-foreground))"
				items={headerLevelItems}
				{disabled}
				bind:values={headerLevelValues}
				onchange={(e) => {
					if (e.detail.selection[0].value == 'h1')
						editor?.chain().focus().toggleHeading({ level: 1 }).run()
					else if (e.detail.selection[0].value == 'h2') {
						editor?.chain().focus().toggleHeading({ level: 2 }).run()
					} else if (e.detail.selection[0].value == 'h3')
						editor?.chain().focus().toggleHeading({ level: 3 }).run()
					else if (e.detail.selection[0].value == 'h4')
						editor?.chain().focus().toggleHeading({ level: 4 }).run()
					else if (e.detail.selection[0].value == 'h5')
						editor?.chain().focus().toggleHeading({ level: 5 }).run()
					else if (e.detail.selection[0].value == 'p') editor?.chain().focus().setParagraph().run()
				}}
			/>
			<ActivableButton
				onclick={() =>
					editor?.isActive('listItem')
						? editor?.chain().focus().toggleList('orderedList', 'listItem').run()
						: editor?.chain().focus().toggleBulletList().run()}
				active={editor?.isActive('listItem')}
				--button-padding="2px 6px"
				buttonProps={{
					disabled: disabled
				}}
			>
				<Icon name={listIcon} />
			</ActivableButton>
			<ActivableButton
				onclick={() => editor?.chain().focus().toggleBold().run()}
				active={editor.isActive('bold')}
				--button-padding="2px 6px"
				buttonProps={{
					disabled: disabled
				}}
			>
				<Icon name="mdi-format-bold" />
			</ActivableButton>
			<ActivableButton
				onclick={() => editor?.chain().focus().toggleItalic().run()}
				active={editor.isActive('italic')}
				--button-padding="2px 6px"
				buttonProps={{
					disabled: disabled
				}}
			>
				<Icon name="mdi-format-italic" />
			</ActivableButton>
			<IconsDropdown
				--button-width="auto"
				--button-padding="0 0 0 4px"
				--autocomplete-selected-item-color="rgb(var(--global-color-primary-foreground))"
				items={[
					{ value: 'align-left', icon: 'mdi-format-align-left' },
					{ value: 'align-center', icon: 'mdi-format-align-center' },
					{ value: 'align-right', icon: 'mdi-format-align-right' }
				]}
				{disabled}
				values={textAlignValues}
				onchange={(e) => {
					if (e.detail.selection[0].value == 'align-left')
						editor?.chain().focus().setTextAlign('left').run()
					else if (e.detail.selection[0].value == 'align-center')
						editor?.chain().focus().setTextAlign('center').run()
					else if (e.detail.selection[0].value == 'align-right')
						editor?.chain().focus().setTextAlign('right').run()
				}}
			/>
		</div>
	{/if}

	<div bind:this={element} class="" ></div>
</div>

<style>
	:global(.tiptap p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: rgb(var(--global-color-contrast-900), 0.3);
		pointer-events: none;
		height: 0;
	}
</style>
