<script lang="ts">
	import { createEventDispatcher } from "svelte"
  import PlayerMarker from "../PlayerMarker.svelte";
	import type { Scout, ScoutEventPlayer } from "@/lib/services/scouts/scouts.service"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
  import { Icon } from "@likable-hair/svelte";
	import StandardDialog from "../../common/StandardDialog.svelte"
	import { liberoSubstitution, playerSubstitution } from "@/lib/stores/scout/studio"
	import PlayersService from "@/lib/services/players/players.service"

  let dispatch = createEventDispatcher<{
  }>()

  export let scout: Scout

  let insidePlayers: ScoutEventPlayer[] = []
  $: if(!!scout.stash?.playersServePositions) {
    insidePlayers = []

    if(!!scout.stash?.playersServePositions.enemy) {
      for(const [position, value] of Object.entries(scout.stash?.playersServePositions.enemy)) {
        insidePlayers = [
          ...insidePlayers,
          value.player
        ]
      }
    }

    if(!!scout.stash?.playersServePositions.friends) {
      for(const [position, value] of Object.entries(scout.stash?.playersServePositions.friends)) {
        insidePlayers = [
          ...insidePlayers,
          value.player
        ]
      }
    }
  } else insidePlayers = []

  $: openLiberoSubstitutions = scout.stash?.currentSetOpenLiberoSubstitution || []

  let substituted: ScoutEventPlayer[] = [],
    closedSubstitutions: ScoutEventPlayer[] = [];
  $: if(!!scout.stash?.currentSetSubstitutionsMade) {
    substituted = []
    closedSubstitutions = []
    for(let i = 0; i < scout.stash.currentSetSubstitutionsMade.enemy.length; i += 1) {
      let sub = scout.stash.currentSetSubstitutionsMade.enemy[i]
      let closedSub = scout.stash.currentSetSubstitutionsMade.enemy.find(s => s.playerOut.id == sub.playerIn.id)

      substituted = [
        ...substituted,
        sub.playerOut
      ]

      if(!!closedSub) closedSubstitutions = [
        ...closedSubstitutions,
        sub.playerIn
      ]
    }

    for(let i = 0; i < scout.stash.currentSetSubstitutionsMade.friends.length; i += 1) {
      let sub = scout.stash.currentSetSubstitutionsMade.friends[i]
      let closedSub = scout.stash.currentSetSubstitutionsMade.friends.find(s => s.playerOut.id == sub.playerIn.id)

      substituted = [
        ...substituted,
        sub.playerOut
      ]

      if(!!closedSub) closedSubstitutions = [
        ...closedSubstitutions,
        sub.playerIn
      ]
    }
  } else substituted = []

  $: expandedPlayers = scout.players.map((p) => {
    return {
      ...p,
      isInside: insidePlayers.some((ip) => ip.id == p.id),
      isSubstituted: substituted.some((ip) => ip.id == p.id),
      isClosed: closedSubstitutions.some((cs) => cs.id == p.id),
      isOutForLibero: openLiberoSubstitutions.some((ols) => ols.playerId == p.id)
    }
  }).filter((ep) => !ep.isInside)
  $: friendsPlayers = expandedPlayers.filter((p) => !p.isOpponent)
  $: opponentsPlayers = expandedPlayers.filter((p) => p.isOpponent)

  let changePlayerDialog: boolean = false,
    changePlayer: typeof expandedPlayers[number] | undefined = undefined
  function handlePlayerClick(player: typeof changePlayer) {
    changePlayerDialog = true
    changePlayer = player
  }

  async function handleOutPlayerClick(player: ScoutEventPlayer) {
    let confirmed = confirm('Vuoi davverso sotituire il giocatore?')
    
    if(confirmed && !!changePlayer) {
      if(changePlayer.role == 'libero') {
        await liberoSubstitution({
          inOrOut: 'in',
          libero: changePlayer,
          player: player
        })
      } else if(player.role == 'libero') {
        await liberoSubstitution({
          inOrOut: 'out',
          libero: player,
          player: changePlayer
        })
      } else {
        await playerSubstitution({
          playerIn: changePlayer,
          playerOut: player
        })
      }

      changePlayerDialog = false
      changePlayer = undefined
    }
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex justify-between gap-4">
    <div class="basis-1/2">
      <div class="text-2xl font-bold mb-4">{scout.event.team.name}</div>
    </div>
    <div class="basis-1/2 text-right">
      <div class="text-2xl font-bold mb-4">{scout.scoutInfo.general.opponent?.name}</div>
    </div>
  </div>

  <div class="flex justify-between gap-4">
    <div class="basis-1/2">
      <div class="mb-2">Liberi</div>
      <div class="flex flex-col w-full mb-2">
        {#each friendsPlayers.filter(fp => fp.role == 'libero') as libero}
          <button 
            on:click={() => handlePlayerClick(libero)}
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
              <div>{PlayersService.translateRole(libero.role)}</div>
            </div>
            <div>
              <Icon name="mdi-arrow-up"></Icon>
            </div>
          </button>
        {:else}
          <div class="w-full font-light">Nessun libero</div>
        {/each}
      </div>
    </div>
    <div class="basis-1/2 text-right">
      <div class="mb-2">Liberi</div>
      <div class="flex flex-col w-full mb-2">
        {#each opponentsPlayers.filter(fp => fp.role == 'libero') as libero}
          <button 
            on:click={() => handlePlayerClick(libero)}
            class="flex text-right items-center justify-end gap-4 hover:bg-[rgb(var(--global-color-background-300))] p-1 w-full rounded-sm"
          >
            <div>
              {#if libero.isSubstituted && !libero.isClosed}
                <Icon name="mdi-arrow-down"></Icon>
              {:else if libero.isClosed}
                <Icon name="mdi-close"></Icon>
              {:else}
                <Icon name="mdi-arrow-up"></Icon>
              {/if}
            </div>
            <div class="flex-grow">
              <div class="text-lg font-medium">
                {TeammatesService.getTeammateName({
                  player: libero,
                  teammate: libero.teammate
                }) || 'Non specificato'}
              </div>
              <div>{PlayersService.translateRole(libero.role)}</div>
            </div>
            <div>
              <PlayerMarker opponent libero>{libero.shirtNumber}</PlayerMarker>
            </div>
          </button>
        {:else}
          <div class="w-full font-light">Nessun giocatore</div>
        {/each}
      </div>
    </div>
  </div>

  <div class="flex justify-between gap-4">
    <div class="basis-1/2">
      <div class="mb-2">Altri giocatori</div>
      <div class="flex flex-col w-full">
        {#each friendsPlayers.filter(fp => fp.role != 'libero') as player}
          <button 
            on:click={() => handlePlayerClick(player)}
            class="flex text-left items-center gap-4 hover:bg-[rgb(var(--global-color-background-300))] py-1 px-2 w-full rounded-sm"
          >
            <div>
              <PlayerMarker friend>{player.shirtNumber}</PlayerMarker>
            </div>
            <div class="flex-grow">
              <div class="text-lg font-medium">
                {TeammatesService.getTeammateName({
                  player: player,
                  teammate: player.teammate
                })}
              </div>
              <div>{PlayersService.translateRole(player.role)}</div>
            </div>
            <div>
              {#if player.isSubstituted && !player.isClosed}
                <Icon name="mdi-arrow-down"></Icon>
              {:else if player.isClosed}
                <Icon name="mdi-close"></Icon>
              {:else if player.isOutForLibero}
                <span class="text-purple-600 font-black">L</span>
              {:else}
                <Icon name="mdi-arrow-up"></Icon>
              {/if}
            </div>
          </button>
        {:else}
          <div class="w-full font-light">Nessun giocatore</div>
        {/each}
      </div>
    </div>
    <div class="basis-1/2 text-right">
      <div class="mb-2">Altri giocatori</div>
      <div class="flex flex-col w-full">
        {#each opponentsPlayers.filter(fp => fp.role != 'libero') as player}
          <button 
            on:click={() => handlePlayerClick(player)}
            class="flex text-right items-center justify-end gap-4 hover:bg-[rgb(var(--global-color-background-300))] p-1 w-full rounded-sm px-2"
          >
            <div class="flex-grow text-left">
              {#if player.isSubstituted && !player.isClosed}
                <Icon name="mdi-arrow-down"></Icon>
              {:else if player.isClosed}
                <Icon name="mdi-close"></Icon>
              {:else if player.isOutForLibero}
                <span class=" text-purple-600 font-black">L</span>
              {:else}
                <Icon name="mdi-arrow-up"></Icon>
              {/if}
            </div>
            <div>
              <div class="text-lg font-medium">
                {TeammatesService.getTeammateName({
                  player: player,
                  teammate: player.teammate
                }) || 'Non specificato'}
              </div>
              <div>{PlayersService.translateRole(player.role)}</div>
            </div>
            <div>
              <PlayerMarker opponent>{player.shirtNumber}</PlayerMarker>
            </div>
          </button>
        {:else}
          <div class="w-full font-light">Nessun giocatore</div>
        {/each}
      </div>
    </div>
  </div>
</div>

<StandardDialog
  title={!!changePlayer ? 
    'Cambia ' + TeammatesService.getTeammateName({
      player: changePlayer,
      teammate: changePlayer.teammate
    }) :
    "Cambia giocatore"
  }
  bind:open={changePlayerDialog}
>
  {#if !!changePlayer}
    <div class="flex flex-col p-2 w-[min(90vw,500px)]">
      {#each insidePlayers.filter(ip => 
        ip.isOpponent == changePlayer?.isOpponent && ((
          changePlayer.isOutForLibero && ip.role === 'libero'
        ) || (
          !changePlayer?.isOutForLibero && ip.role !== 'libero'
        ))
      ) as player}
        <button 
          on:click={() => handleOutPlayerClick(player)}
          class="flex text-left items-center gap-4 hover:bg-[rgb(var(--global-color-background-400),.3)] py-2 px-2 w-full rounded-sm"
        >
          <div>
            <PlayerMarker 
              friend={!changePlayer.isOpponent}
              opponent={changePlayer.isOpponent}
            >{player.shirtNumber}</PlayerMarker>
          </div>
          <div class="flex-grow">
            <div class="text-lg font-medium">
              {TeammatesService.getTeammateName({
                player: player,
                teammate: player.teammate
              })}
            </div>
            <div>{PlayersService.translateRole(player.role)}</div>
          </div>
        </button>
      {:else}
        <div class="w-full font-light">Nessun giocatore</div>
      {/each}
    </div>
  {/if}
</StandardDialog>