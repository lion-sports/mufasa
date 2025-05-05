<script lang="ts">
	import { run, stopPropagation } from 'svelte/legacy'

	import type { ScoutEventPlayer } from 'lionn-common'
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'
	import type { Player } from '@/lib/services/players/players.service'
	import TeammatesService from '@/lib/services/teammates/teammates.service'
	import PlayerMarker from './PlayerMarker.svelte'
	import { Autocomplete, Icon } from '@likable-hair/svelte'

	type AutocompleteData = {
		player: ScoutEventPlayer
	}

	interface Props
		extends Omit<
			ComponentProps<typeof StandardAutocomplete<AutocompleteData>>,
			'values' | 'items'
		> {
		values?: ScoutEventPlayer[]
		multiple?: boolean
		players?: (ScoutEventPlayer | Player)[]
		height?: ComponentProps<typeof StandardAutocomplete<AutocompleteData>>['height']
	}

	let {
		values = $bindable([]),
		multiple = $bindable(false),
		players = [],
		height = '44px',
		...rest
	}: Props = $props()

	let selectedValues: ComponentProps<typeof StandardAutocomplete<AutocompleteData>>['values'] =
		$state([])
	run(() => {
		selectedValues = values?.map((p) => ({
			label: TeammatesService.getTeammateName({
				teammate: p.teammate,
				player: p
			}),
			value: p.id.toString(),
			data: {
				player: p
			}
		}))
	})

	type OnChangeHandler = NonNullable<
		ComponentProps<typeof StandardAutocomplete<AutocompleteData>>['onchange']
	>

	function handleChange(e: Parameters<OnChangeHandler>['0']) {
		if (!selectedValues) values = []
		else {
			values = selectedValues.filter((e) => !!e.data?.player).map((sv) => sv.data!.player)
		}

		if (!!rest.onchange) {
			rest.onchange(e)
		}
	}
</script>

<Autocomplete
	items={players.map((p) => {
		return {
			label: TeammatesService.getTeammateName({
				teammate: p.teammate,
				player: p
			}),
			value: p.id.toString(),
			data: {
				player: p
			}
		}
	})}
	bind:values={selectedValues}
	onchange={handleChange}
	{multiple}
	{height}
>
	{#snippet itemLabelSnippet({ item })}
		<div class="flex gap-2 items-center">
			<PlayerMarker opponent={item.data?.player.isOpponent} friend={!item.data?.player.isOpponent}
				>{item.data?.player.shirtNumber}</PlayerMarker
			>
			<div class="flex flex-col">
				<div class="text-lg font-semibold">{item.label || ''}</div>
				<div>{item.data?.player.role || ''}</div>
			</div>
		</div>
	{/snippet}
	{#snippet selectionContainerSnippet({ values, disabled, unselect })}
		<div class="flex gap-2 items-center">
			{#each values as selectedPlayer}
				<div class="relative">
					<button
						{disabled}
						class="absolute -top-2 -right-2"
						onclick={stopPropagation(() => {
							unselect(selectedPlayer)
						})}
					>
						<Icon name="mdi-close-circle" --icon-size="20px" --icon-color="red"></Icon>
					</button>
					<PlayerMarker
						opponent={selectedPlayer.data?.player.isOpponent}
						friend={!selectedPlayer.data?.player.isOpponent}
					>
						{selectedPlayer.data?.player.shirtNumber}
					</PlayerMarker>
				</div>
				<div>
					{TeammatesService.getTeammateName({
						teammate: selectedPlayer.data?.player.teammate,
						player: selectedPlayer.data?.player
					})}
				</div>
			{/each}
		</div>
	{/snippet}
</Autocomplete>
