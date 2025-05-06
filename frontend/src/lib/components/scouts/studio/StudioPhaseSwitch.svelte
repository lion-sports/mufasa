<script lang="ts">
	import { stopPropagation } from 'svelte/legacy'

	import type { VolleyballPhase } from '@/lib/services/scouts/volleyball'
	import { Autocomplete, Icon } from '@likable-hair/svelte'
	import { createEventDispatcher } from 'svelte'
	let phases: VolleyballPhase[] = ['serve', 'defenseBreak', 'receive', 'defenseSideOut'] as const

	interface Props {
		phase?: VolleyballPhase
		disabled?: boolean
		width?: string | undefined
		minWidth?: string | undefined
		menuWidth?: string | undefined
	}

	let {
		phase = $bindable('serve'),
		disabled = $bindable(false),
		width = undefined,
		minWidth = 'auto',
		menuWidth = '150px'
	}: Props = $props()

	let phaseItems = $derived(
		phases.map((p) => ({
			value: p,
			label: p
		}))
	)

	let dispatch = createEventDispatcher<{
		change: {
			phase: VolleyballPhase
		}
	}>()

	function handleChange(e: { detail: { selection: { value: string | number }[] } }) {
		if (!!e.detail.selection && e.detail.selection.length > 0) {
			phase = e.detail.selection[0].value as VolleyballPhase
			dispatch('change', {
				phase
			})
		}
	}

	function nextPhase() {
		let currentIndex = phases.findIndex((e) => e == phase)
		phase = phases[(currentIndex + 1) % 4]

		dispatch('change', {
			phase
		})
	}
</script>

<Autocomplete
	items={phaseItems}
	placeholder=""
	{disabled}
	values={[{ value: phase, label: phase }]}
	onchange={handleChange}
	{width}
	{minWidth}
	{menuWidth}
	mobileDrawer
>
	{#snippet selectionContainerSnippet({ openMenu, handleKeyDown, values })}
		<div
			role="presentation"
			onclick={openMenu}
			onkeydown={(event) => {
				handleKeyDown(event)
				if (event.key == 'ArrowDown' || event.key == 'ArrowUp') {
					event.stopPropagation()
					event.preventDefault()
				}
			}}
			class="
          flex justify-center align-center w-full
          py-1 bg-[rgb(var(--global-color-background-300))] rounded-sm
          relative
        "
		>
			<div class="px-2 flex-grow">
				{phase}
			</div>
			<button
				class="border-l-2 px-2 border-l-[rgb(var(--global-color-contrast-800))]"
				onclick={stopPropagation(nextPhase)}
			>
				<Icon name="mdi-chevron-right"></Icon>
			</button>
		</div>
	{/snippet}
</Autocomplete>
