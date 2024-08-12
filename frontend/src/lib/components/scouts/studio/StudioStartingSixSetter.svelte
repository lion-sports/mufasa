<script lang="ts">
	import type { VolleyballPlayersPosition, VolleyballScoutEventPosition } from "@/lib/services/scouts/volleyball"
	import StandardTabSwitcher from "../../common/StandardTabSwitcher.svelte"
	import type { Player } from "@/lib/services/players/players.service"
	import { Icon } from "@likable-hair/svelte"
	import ScoutPlayerAutocomplete from "../ScoutPlayerAutocomplete.svelte"
	import { createEventDispatcher } from "svelte"
	import type { ScoutEventPlayer } from "@/lib/services/scouts/scouts.service"

  let dispatch = createEventDispatcher<{
    change: {
      position: VolleyballScoutEventPosition,
      player: ScoutEventPlayer | undefined
    }
  }>()

  export let selectedTab: string = '',
    playersPosition: VolleyballPlayersPosition | undefined = undefined,
    players: Player[] = []

  $: notLiberoPlayers = players.filter((p) => p.role !== 'libero')

  $: friendsPlayer = notLiberoPlayers.filter((p) => !p.isOpponent)
  $: opponentsPlayer = notLiberoPlayers.filter((p) => p.isOpponent)

  $: notSelectedFriendsPlayer = friendsPlayer.filter((fp) => {
    return !playersPosition || (
      Object.values(playersPosition.friends).filter(v => !!v && !!v.player).every(p => Number(p.player.id) !== Number(fp.id))
    )
  })

  $: notSelectedOpponentsPlayer = opponentsPlayer.filter((fp) => {
    return !playersPosition || (
      Object.values(playersPosition.enemy).filter(v => !!v && !!v.player).every(p => Number(p.player.id) !== Number(fp.id))
    )
  })

  let positions: VolleyballScoutEventPosition[] = [1, 2, 3, 4, 5, 6]
</script>

<div class="min-w-[min(95vw,400px)] max-w-[min(95vw,400px)]">
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
              on:change={(e) => {
                let selection = e.detail.selection[0]

                if(!playersPosition) playersPosition = {
                  friends: {},
                  enemy: {}
                }

                if(selectedTab == 'opponents') {
                  if(!playersPosition.enemy[position]) {
                    playersPosition.enemy[position] = {
                      player: selection?.data?.player
                    }
                  } else playersPosition.enemy[position].player = selection?.data?.player
                } else {
                  if(!playersPosition.friends[position]) {
                    playersPosition.friends[position] = {
                      player: selection?.data?.player
                    }
                  } else playersPosition.friends[position].player = selection?.data?.player
                }

                dispatch('change', {
                  position: position,
                  player: selection?.data?.player
                })
              }}
              values={
                selectedTab == 'opponents' ?
                [playersPosition?.enemy[position]?.player].filter(v => !!v) :
                [playersPosition?.friends[position]?.player].filter(v => !!v)
              }
            ></ScoutPlayerAutocomplete>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>