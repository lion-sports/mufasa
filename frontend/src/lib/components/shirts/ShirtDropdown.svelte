<script lang="ts">
	import { run } from 'svelte/legacy'

	import type { Shirt } from '$lib/services/shirts/shirts.service'
	import { Autocomplete, Dropdown } from '@likable-hair/svelte'
	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import ShirtIcon from './ShirtIcon.svelte'

	type ShirtWithPartialTeammate = Omit<Shirt, 'teammateId' | 'id'> & {
		teammateId?: number
		id?: number
	}
	type Item = NonNullable<
		ComponentProps<typeof Dropdown<{ shirt: ShirtWithPartialTeammate }>>['items']
	>[number]

	let dispatch = createEventDispatcher<{
		change: {
			unselect: ShirtWithPartialTeammate | undefined
			select: ShirtWithPartialTeammate | undefined
			selection: ShirtWithPartialTeammate[]
		}
	}>()

	interface Props {
		items?: ShirtWithPartialTeammate[]
		values?: ShirtWithPartialTeammate[]
		disabled?: boolean
		width?: string | undefined
		minWidth?: string | undefined
		menuWidth?: string | undefined
	}

	let {
		items = [],
		values = $bindable([]),
		disabled = $bindable(false),
		width = 'auto',
		minWidth = 'auto',
		menuWidth = 'auto'
	}: Props = $props()

	let dropdownValues: ComponentProps<
		typeof Dropdown<{ shirt: ShirtWithPartialTeammate }>
	>['items'] = $state([])

	run(() => {
		dropdownValues = values.map((e) => ({
			value: e.id || `${e.number}_${e.primaryColor}_${e.secondaryColor}`,
			data: {
				shirt: e
			}
		}))
	})

	let dropDownItems = $derived(
		items.map((e) => ({
			value: e.id || `${e.number}_${e.primaryColor}_${e.secondaryColor}`,
			data: {
				shirt: e
			}
		}))
	)

	function handleChange(event: {
		detail: {
			unselect: Item | undefined
			select: Item | undefined
			selection: Item[]
		}
	}) {
		values = []
		for (let i = 0; i < event.detail.selection.length; i += 1) {
			let shirt = event.detail.selection[i].data?.shirt
			if (!!shirt) {
				values = [...values, shirt]
			}
		}

		dispatch('change', {
			unselect: !!event.detail.unselect ? event.detail.unselect.data?.shirt : undefined,
			select: !!event.detail.select ? event.detail.select.data?.shirt : undefined,
			selection: values
		})
	}
</script>

<Autocomplete
	items={dropDownItems}
	placeholder=""
	{disabled}
	bind:values={dropdownValues}
	onchange={handleChange}
	{width}
	{minWidth}
	{menuWidth}
	mobileDrawer
>
	{#snippet selectionContainerSnippet({ openMenu, handleKeyDown, values })}
		<button
			class="unstyled-button"
			onclick={openMenu}
			onkeydown={(event) => {
				handleKeyDown(event)
				if (event.key == 'ArrowDown' || event.key == 'ArrowUp') {
					event.stopPropagation()
					event.preventDefault()
				}
			}}
		>
			{#if values.length == 1}
				<ShirtIcon
					primaryColor={values[0].data?.shirt.primaryColor}
					secondaryColor={values[0].data?.shirt.secondaryColor}
					number={values[0].data?.shirt.number}
				></ShirtIcon>
			{:else}
				<ShirtIcon primaryColor="transparent" secondaryColor="transparent" number={undefined}
				></ShirtIcon>
			{/if}
		</button>
	{/snippet}
	{#snippet itemLabelSnippet({ item })}
		<div class="label-container">
			<ShirtIcon
				primaryColor={item.data?.shirt.primaryColor}
				secondaryColor={item.data?.shirt.secondaryColor}
				number={item.data?.shirt.number}
			></ShirtIcon>
			<div>{item.data?.shirt.name || ''}</div>
		</div>
	{/snippet}
</Autocomplete>

<style>
	.label-container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
	}
</style>
