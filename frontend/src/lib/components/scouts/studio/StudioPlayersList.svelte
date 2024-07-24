<script lang="ts">
  import UserAvatar from "$lib/components/common/UserAvatar.svelte"
	import ShirtDropdown from "$lib/components/shirts/ShirtDropdown.svelte"
	import type { Scout } from "$lib/services/scouts/scouts.service"
	import TeammatesService from "$lib/services/teammates/teammates.service"
	import { CircularLoader, Icon, TabSwitcher } from "@likable-hair/svelte"
	import ScoutRoleAutocomplete from "../ScoutRoleAutocomplete.svelte"
	import ScoutsService, { ROLES } from "$lib/services/scouts/scouts.service"
	import { createEventDispatcher } from "svelte"
	import type { Player } from "@/lib/services/players/players.service"
	import PlayersService from "@/lib/services/players/players.service"
	import { reload } from "@/lib/stores/scout/studio"

  let dispatch = createEventDispatcher<{
    add: {
      friendsOrOpponents: 'friends' | 'opponents'
    }
  }>()

  export let scout: Scout

  $: if(!scout.scoutInfo.general.opponent) scout.scoutInfo.general.opponent = {}

  function getPlayerFullname(params: { player: Scout['players'][0] }): string {
    return TeammatesService.getTeammateName({
      teammate: params.player.teammate,
      player: params.player
    })
  }

  let selectedTab: string = 'friends'

  let loadingDelete: number | undefined = undefined
  async function deletePlayer(player: Player) {
    let confirmed = confirm('sei sicuro di voler eliminare il giocatore?')

    if(confirmed) {
      loadingDelete = player.id
      let playerService = new PlayersService({ fetch })
      await playerService.destroy({ id: player.id })
      await reload()
      loadingDelete = undefined
    }
  }

  let loadingUpdateScoutInfo: boolean = false
  async function updateScoutInfo() {
    loadingUpdateScoutInfo = true
    let service = new ScoutsService({ fetch })
    await service.update({
      id: scout.id,
      scoutInfo: scout.scoutInfo
    })
    loadingUpdateScoutInfo = false
  }
</script>

<div class="">
  <TabSwitcher
    tabs={[
      { name: 'friends', label: scout.event.team.name },
      { name: 'opponents', label: scout.scoutInfo.general.opponent?.name || 'Avversari' }
    ]}
    bind:selected={selectedTab}
  ></TabSwitcher>

  {#if selectedTab == 'friends'}
    <div class="flex flex-col gap-2 mt-8">
      {#each scout.players.filter((p) => !p.isOpponent) as player}
        <div class="flex items-center gap-4">
          <div class="pl-2">
            <button on:click={() => deletePlayer(player)} disabled={loadingDelete !== undefined}>
              {#if loadingDelete == player.id}
                <CircularLoader></CircularLoader>
              {:else}
                <Icon name="mdi-delete" --icon-color="rgb(var(--global-color-error-500))"></Icon>
              {/if}
            </button>
          </div>
          <div class="basis-3/12">
            <UserAvatar
              src={player.teammate?.user.avatarUrl}
              username={getPlayerFullname({ player })}
              description={player.role}
              --descriptive-avatar-image-gap="16px"
            />
          </div>
          <ShirtDropdown
            items={player.teammate?.shirts || []}
            values={player.shirtNumber !== undefined ? [{
              id: player.shirtId,
              number: player.shirtNumber,
              primaryColor: player.shirtPrimaryColor || undefined,
              secondaryColor: player.shirtSecondaryColor || undefined,
              teammateId: player.teammateId || undefined
            }] : []}
          ></ShirtDropdown>
          <ScoutRoleAutocomplete
            values={!!player.role ? [player.role] : []}
            roles={player.teammate?.availableRoles || ROLES}
            height="auto"
          ></ScoutRoleAutocomplete>
        </div>
      {/each}
      <div class="flex justify-center">
        <button
          on:click={() => {
            dispatch('add', {
              friendsOrOpponents: 'friends'
            })
          }}
        >
          <Icon name="mdi-plus"></Icon>
        </button>
      </div>
    </div>
  {:else}
    <div class="mt-2 pl-2">
      {#if !!scout.scoutInfo.general.opponent}
        <input 
          type="text"
          placeholder="Avversari"
          class="bg-transparent border-none outline-none text-2xl font-bold"
          bind:value={scout.scoutInfo.general.opponent.name}
        />
        {#if loadingUpdateScoutInfo}
          <CircularLoader 
            --circular-loader-height="20px" 
            --circular-loader-width="20px"
          ></CircularLoader>
        {:else}
          <button on:click={updateScoutInfo}>
            <Icon name="mdi-check"></Icon>
          </button>
        {/if}
      {/if}
      <div class="flex flex-col gap-2 mt-8">
        {#each scout.players.filter((p) => p.isOpponent) as opponentPlayer}
          <div class="flex items-center gap-4">
            <div class="pl-2">
              <button on:click={() => deletePlayer(opponentPlayer)} disabled={loadingDelete !== undefined}>
                {#if loadingDelete == opponentPlayer.id}
                  <CircularLoader></CircularLoader>
                {:else}
                  <Icon name="mdi-delete" --icon-color="rgb(var(--global-color-error-500))"></Icon>
                {/if}
              </button>
            </div>
            <div class="basis-3/12">
              <UserAvatar
                username={getPlayerFullname({ player: opponentPlayer })}
                description={opponentPlayer.role}
                --descriptive-avatar-image-gap="16px"
              />
            </div>
          </div>
        {/each}
      </div>
      <div class="flex justify-center">
        <button
          on:click={() => {
            dispatch('add', {
              friendsOrOpponents: 'opponents'
            })
          }}
        >
          <Icon name="mdi-plus"></Icon>
        </button>
      </div>
    </div>
  {/if}
</div>