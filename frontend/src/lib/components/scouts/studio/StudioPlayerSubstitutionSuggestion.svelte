<script lang="ts">
	import type { Scout, ScoutEventPlayer } from "@/lib/services/scouts/scouts.service"
	import { liberoSubstitution, playerSubstitution } from "@/lib/stores/scout/studio"
	import PlayerMarker from "../PlayerMarker.svelte"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
	import { Icon } from "@likable-hair/svelte"

  export let player: ScoutEventPlayer,
    scout: Scout

  $: friendsPlayers = scout.players.filter((p) => !p.isOpponent)
  $: opponentsPlayers = scout.players.filter((p) => p.isOpponent)
  $: openLiberoSubstitutions = scout.stash?.currentSetOpenLiberoSubstitution || []

  async function handleSubstitutionClick(playerIn: ScoutEventPlayer) {
    let confirmed = confirm('Vuoi davverso sotituire il giocatore?')
    
    if(confirmed) {
      if(playerIn.role == 'libero') {
        await liberoSubstitution({
          inOrOut: 'in',
          libero: playerIn,
          player: player
        })
      } else if(player.role == 'libero') {
        await liberoSubstitution({
          inOrOut: 'out',
          libero: player,
          player: playerIn
        })
      } else {
        await playerSubstitution({
          playerIn: playerIn,
          playerOut: player
        })
      }
    }
  }
</script>

<div class="flex flex-col gap-2">

</div>

{#if player.role == 'middleBlocker'}
  {#each scout.players.filter(fp => fp.role == 'libero' && fp.isOpponent == player.isOpponent) as libero}
    <button 
      on:click={() => handleSubstitutionClick(libero)}
      class="flex text-left items-center gap-4 hover:bg-[rgb(var(--global-color-background-300))] py-1 px-2 w-full rounded-sm"
    >
      <div>
        <PlayerMarker friend libero>{libero.shirtNumber}</PlayerMarker>
      </div>
      <div class="flex-grow">
        <div class="text-lg font-medium">
          {TeammatesService.getTeammateName({
            player: libero,
            teammate: libero.teammate
          })}
        </div>
        <div>{libero.role}</div>
      </div>
      <div>
        <Icon name="mdi-arrow-up"></Icon>
      </div>
    </button>
  {/each}
{/if}