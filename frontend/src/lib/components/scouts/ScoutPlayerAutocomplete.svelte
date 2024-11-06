<script lang="ts">
  import type { ScoutEventPlayer } from "lionn-common";
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "../common/StandardAutocomplete.svelte"
	import type { Player } from "@/lib/services/players/players.service"
  import TeammatesService from "@/lib/services/teammates/teammates.service";
	import PlayerMarker from "./PlayerMarker.svelte"
	import { Autocomplete, Icon } from "@likable-hair/svelte"

  export let values: ScoutEventPlayer[] = [],
    multiple: boolean = false,
    players: (ScoutEventPlayer | Player)[] = [],
    height: ComponentProps<StandardAutocomplete>['height'] = '44px'

  let selectedValues: ComponentProps<StandardAutocomplete>['values'] = []
  $: selectedValues = values?.map(p => ({
    label: TeammatesService.getTeammateName({
      teammate: p.teammate,
      player: p
    }),
    value: p.id.toString(),
    data: {
      player: p
    }
  }))

  function handleChange() {
    values = selectedValues?.map((sv) => sv.data.player)
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
  on:change={handleChange}
  on:change
  bind:multiple
  {height}
>
  <svelte:fragment slot="item-label" let:item>
    <div class="flex gap-2 items-center">
      <PlayerMarker
        opponent={item.data.player.isOpponent}
        friend={!item.data.player.isOpponent}
      >{item.data.player.shirtNumber}</PlayerMarker>
      <div class="flex flex-col">
        <div class="text-lg font-semibold">{item.label || ''}</div>
        <div>{item.data.player.role || ''}</div>
      </div>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="selection-container" let:values let:disabled let:unselect>
    <div class="flex gap-2 items-center">
      {#each values as selectedPlayer}
        <div class="relative">
          <button {disabled} class="absolute -top-2 -right-2" on:click|stopPropagation={() => {
            unselect(selectedPlayer)
          }}>
            <Icon name="mdi-close-circle" --icon-size="20px" --icon-color="red"></Icon>
          </button>
          <PlayerMarker
            opponent={selectedPlayer.data.player.isOpponent}
            friend={!selectedPlayer.data.player.isOpponent}
          >
            {selectedPlayer.data.player.shirtNumber}
          </PlayerMarker>
        </div>
        <div>
          {TeammatesService.getTeammateName({ teammate: selectedPlayer.data.player.teammate, player: selectedPlayer.data.player })}
        </div>
      {/each}
    </div>
  </svelte:fragment>
</Autocomplete>