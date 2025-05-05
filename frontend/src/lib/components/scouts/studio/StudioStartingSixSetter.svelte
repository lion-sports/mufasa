<script lang="ts">
  import { run } from 'svelte/legacy';

	import { ORDERED_POSITIONS, type VolleyballPlayersPosition, type VolleyballScoutEventPosition } from "@/lib/services/scouts/volleyball"
	import StandardTabSwitcher from "../../common/StandardTabSwitcher.svelte"
	import type { Player } from "@/lib/services/players/players.service"
	import { Icon } from "@likable-hair/svelte"
	import ScoutPlayerAutocomplete from "../ScoutPlayerAutocomplete.svelte"
	import { createEventDispatcher } from "svelte"
  import type { ScoutEventPlayer } from 'lionn-common'
	import studio, { suggestPlayer } from "@/lib/stores/scout/studio"
	import PlayerMarker from "../PlayerMarker.svelte"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
  import lodash from 'lodash'
	import ScoutsService from "@/lib/services/scouts/scouts.service"

  let dispatch = createEventDispatcher<{
    change: {
      position: VolleyballScoutEventPosition,
      player: ScoutEventPlayer | undefined
    }
  }>()

  interface Props {
    selectedTab?: string;
    playersPosition?: VolleyballPlayersPosition | undefined;
    players?: Player[];
    showSuggestion?: boolean;
    reloadFirstSetStartingSix?: boolean;
    firstSetStartingSix?: VolleyballPlayersPosition | undefined;
  }

  let {
    selectedTab = $bindable(''),
    playersPosition = $bindable(undefined),
    players = [],
    showSuggestion = $bindable(true),
    reloadFirstSetStartingSix = $bindable(true),
    firstSetStartingSix = $bindable(undefined)
  }: Props = $props();

  let notLiberoPlayers = $derived(players.filter((p) => p.role !== 'libero'))

  let friendsPlayer = $derived(notLiberoPlayers.filter((p) => !p.isOpponent))
  let opponentsPlayer = $derived(notLiberoPlayers.filter((p) => p.isOpponent))

  let notSelectedFriendsPlayer = $derived(friendsPlayer.filter((fp) => {
    return !playersPosition || (
      Object.values(playersPosition.friends).filter(v => !!v && !!v.player).every(p => Number(p.player.id) !== Number(fp.id))
    )
  }))

  let notSelectedOpponentsPlayer = $derived(opponentsPlayer.filter((fp) => {
    return !playersPosition || (
      Object.values(playersPosition.enemy).filter(v => !!v && !!v.player).every(p => Number(p.player.id) !== Number(fp.id))
    )
  }))

  let positions: VolleyballScoutEventPosition[] = [1, 2, 3, 4, 5, 6]
  let playerSuggestion: {
    enemy: Partial<Record<VolleyballScoutEventPosition, ScoutEventPlayer[]>>,
    friends: Partial<Record<VolleyballScoutEventPosition, ScoutEventPlayer[]>>
  } = $state({
    enemy: {},
    friends: {}
  })

  run(() => {
    if(!!playersPosition) {
      playerSuggestion = {
        enemy: {},
        friends: {}
      }

      for(let i = 0; i < ORDERED_POSITIONS.length; i += 1) {
        let position = ORDERED_POSITIONS[i]
        let suggestions = suggestPlayer({
          position,
          players: players.filter((p) => !p.isOpponent),
          playersPosition: playersPosition.friends,
          avoidPlayers: Object.values(playersPosition.friends).filter(v => !!v && !!v.player).map((v) => v.player)
        })

        playerSuggestion.friends[position] = lodash.cloneDeep(suggestions)

        suggestions = suggestPlayer({
          position,
          players: players.filter((p) => p.isOpponent),
          playersPosition: playersPosition.enemy,
          avoidPlayers: Object.values(playersPosition.enemy).filter(v => !!v && !!v.player).map((v) => v.player)
        })

        playerSuggestion.enemy[position] = lodash.cloneDeep(suggestions)
      }
    }
  });

  function handleAcceptSuggestion(position: VolleyballScoutEventPosition, suggestion: ScoutEventPlayer) {
    if(!!playersPosition) {
      if(selectedTab == 'opponents') {
        playersPosition.enemy[position] = {
          player: suggestion
        }
      } else {
        playersPosition.friends[position] = {
          player: suggestion
        }
      }
    }
    dispatch('change', {
      position: position,
      player: suggestion
    })
  }

  function handleRotateForward() {
    if(!!playersPosition) {
      if(selectedTab == 'opponents') {
        let firstPlayerSwapped = lodash.cloneDeep(playersPosition.enemy[1])
        playersPosition.enemy[1] = playersPosition.enemy[2]
        playersPosition.enemy[2] = playersPosition.enemy[3]
        playersPosition.enemy[3] = playersPosition.enemy[4]
        playersPosition.enemy[4] = playersPosition.enemy[5]
        playersPosition.enemy[5] = playersPosition.enemy[6]
        playersPosition.enemy[6] = firstPlayerSwapped
        dispatchAllPlayers({ enemy: true })
      } else {
        playersPosition.friends[1] = playersPosition.friends[2]
        playersPosition.friends[2] = playersPosition.friends[3]
        playersPosition.friends[3] = playersPosition.friends[4]
        playersPosition.friends[4] = playersPosition.friends[5]
        playersPosition.friends[5] = playersPosition.friends[6]
        playersPosition.friends[6] = playersPosition.friends[1]
        dispatchAllPlayers({ friends: true })
      }
    }
  }

  function handleRotateBackward() {
    if(!!playersPosition) {
      if(selectedTab == 'opponents') {
        let firstPlayerSwapped = lodash.cloneDeep(playersPosition.enemy[6])
        playersPosition.enemy[6] = playersPosition.enemy[5]
        playersPosition.enemy[5] = playersPosition.enemy[4]
        playersPosition.enemy[4] = playersPosition.enemy[3]
        playersPosition.enemy[3] = playersPosition.enemy[2]
        playersPosition.enemy[2] = playersPosition.enemy[1]
        playersPosition.enemy[1] = firstPlayerSwapped
        dispatchAllPlayers({ enemy: true })
      } else {
        let firstPlayerSwapped = lodash.cloneDeep(playersPosition.friends[6])
        playersPosition.friends[6] = playersPosition.friends[5]
        playersPosition.friends[5] = playersPosition.friends[4]
        playersPosition.friends[4] = playersPosition.friends[3]
        playersPosition.friends[3] = playersPosition.friends[2]
        playersPosition.friends[2] = playersPosition.friends[1]
        playersPosition.friends[1] = firstPlayerSwapped
        dispatchAllPlayers({ friends: true })
      }
    }
  }

  function handleInsertFirstSetStartingSix() {
    if(!!firstSetStartingSix && !!playersPosition) {
      if(selectedTab == 'opponents') {
        playersPosition.enemy[1] = firstSetStartingSix.enemy[1]
        playersPosition.enemy[2] = firstSetStartingSix.enemy[2]
        playersPosition.enemy[3] = firstSetStartingSix.enemy[3]
        playersPosition.enemy[4] = firstSetStartingSix.enemy[4]
        playersPosition.enemy[5] = firstSetStartingSix.enemy[5]
        playersPosition.enemy[6] = firstSetStartingSix.enemy[6]
        dispatchAllPlayers({ enemy: true })
      } else {
        playersPosition.friends[1] = firstSetStartingSix.friends[1]
        playersPosition.friends[2] = firstSetStartingSix.friends[2]
        playersPosition.friends[3] = firstSetStartingSix.friends[3]
        playersPosition.friends[4] = firstSetStartingSix.friends[4]
        playersPosition.friends[5] = firstSetStartingSix.friends[5]
        playersPosition.friends[6] = firstSetStartingSix.friends[6]
        dispatchAllPlayers({ friends: true })
      }
    }
  }

  function dispatchAllPlayers(params: {
    friends?: boolean,
    enemy?: boolean
  }) {
    if(!!playersPosition) {
      if(params.enemy) {
        for(const [key, playerSpec] of Object.entries(playersPosition.enemy)) {
          let position = key as unknown as VolleyballScoutEventPosition
          dispatch('change', {
            position,
            player: playerSpec.player
          })
        }
      }

      if(params.friends) {
        for(const [key, playerSpec] of Object.entries(playersPosition.friends)) {
          let position = key as unknown as VolleyballScoutEventPosition
          dispatch('change', {
            position,
            player: playerSpec.player
          })
        }
      }
    }
  }

  async function loadFirstSetStartingSix() {
    if(!$studio) return

    let scoutService = new ScoutsService({ fetch })
    firstSetStartingSix = await scoutService.getFirstSetStartingSix({ id: $studio.scout.id })
  }

  run(() => {
    if(!!reloadFirstSetStartingSix) {
      loadFirstSetStartingSix()
      reloadFirstSetStartingSix = false
    }
  });

  function getPlayerValueInPosition(position: VolleyballScoutEventPosition, playersPosition: VolleyballPlayersPosition | undefined): ScoutEventPlayer[] {
    return selectedTab == 'opponents' ?
    [playersPosition?.enemy[position]?.player].filter(v => !!v) as ScoutEventPlayer[] :
    [playersPosition?.friends[position]?.player].filter(v => !!v) as ScoutEventPlayer[]
  }
</script>

<div class="min-w-[min(95vw,400px)] w-[700px] max-w-[95vw]">
  <StandardTabSwitcher 
    tabs={[
      {
        name: 'friends',
        label: 'Amici',
      },
      {
        name: 'opponents',
        label: 'Avversari',
      }
    ]}
    bind:selected={selectedTab}
  ></StandardTabSwitcher>
  <div class="mt-4 max-h-[80vh] overflow-auto">
    <div class="flex gap-4">
      <button class="underline" onclick={() => showSuggestion = !showSuggestion}>
        {showSuggestion ? 'Nascondi suggerimenti' : 'Mostra suggerimenti'}
      </button>
      <button class="underline" onclick={handleRotateForward}>
        Ruota in avanti
      </button>
      <button class="underline" onclick={handleRotateBackward}>
        Ruota indietro
      </button>
      {#if !!firstSetStartingSix}
        <button class="underline" onclick={handleInsertFirstSetStartingSix}>
          Inserisci sestetto primo set
        </button>
      {/if}
    </div>
    <div class="flex flex-col gap-2">
      {#each positions as position}
        <div class="p-2 flex gap-4 items-center">
          <div
            class="rounded-md w-[40px] h-[40px] flex justify-center items-center text-white bg-gray-500"
          >{position}</div>
          <div>
            <Icon 
              name="mdi-arrow-right"
              --icon-size="24px"
            ></Icon>
          </div>
          <div class="flex-grow">
            <ScoutPlayerAutocomplete
              --autocomplete-background-color="rgb(var(--global-color-background-400))"
              --autocomplete-width="100%"
              players={selectedTab == 'opponents' ? notSelectedOpponentsPlayer : notSelectedFriendsPlayer}
              onchange={(e) => {
                let selection = e.detail.selection[0]

                if(!playersPosition) playersPosition = {
                  friends: {},
                  enemy: {}
                }

                // @ts-ignore
                let selectedPlayer = selection?.data?.player as Player

                if(selectedTab == 'opponents') {
                  if(!playersPosition.enemy[position]) {
                    playersPosition.enemy[position] = {
                      player: selectedPlayer
                    }
                  } 
                  else playersPosition.enemy[position].player = selectedPlayer
                } else {
                  if(!playersPosition.friends[position]) {
                    playersPosition.friends[position] = {
                      player: selectedPlayer
                    }
                  }
                  else playersPosition.friends[position].player = selectedPlayer
                }

                dispatch('change', {
                  position: position,
                  player: selectedPlayer
                })
              }}
              values={getPlayerValueInPosition(position, playersPosition)}
            ></ScoutPlayerAutocomplete>
          </div>
          {#if showSuggestion}
            <div class="flex flex-col gap-1">
              {#each 
                selectedTab == 'opponents' ?
                (playerSuggestion.enemy[position] || []) :
                (playerSuggestion.friends[position] || [])
              as suggestion}
                <button class="flex gap-2 items-center" onclick={() => handleAcceptSuggestion(position, suggestion)}>
                  <PlayerMarker
                    opponent={suggestion.isOpponent}
                    friend={!suggestion.isOpponent}
                  >{suggestion.shirtNumber}</PlayerMarker>
                  <div class="flex flex-col">
                    <div class="text-left text-lg font-semibold">{TeammatesService.getTeammateName({ teammate: suggestion.teammate, player: suggestion})}</div>
                    <div class="text-left">{suggestion.role || ''}</div>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>