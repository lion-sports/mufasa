<script lang="ts">
  import UserAvatar from "$lib/components/common/UserAvatar.svelte"
	import type { Scout } from "$lib/services/scouts/scouts.service"
	import TeammatesService from "$lib/services/teammates/teammates.service"
	import { CircularLoader, Icon, TabSwitcher } from "@likable-hair/svelte"
	import ScoutsService, { ROLES } from "$lib/services/scouts/scouts.service"
	import { createEventDispatcher } from "svelte"
	import type { Player } from "@/lib/services/players/players.service"
	import PlayersService from "@/lib/services/players/players.service"
	import { reload } from "@/lib/stores/scout/studio"
	import StandardDialog from "../../common/StandardDialog.svelte"
	import StudioPlayerForm from "./StudioPlayerForm.svelte"
	import ConfirmOrCancelButtons from "../../common/ConfirmOrCancelButtons.svelte"
	import ShirtIcon from "../../shirts/ShirtIcon.svelte"

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

  let editingPlayer: Player | undefined = undefined,
    editPlayerDialog: boolean = false,
    loadingSave: boolean = false

  async function handleSaveEditPlayer() {
    if(!editingPlayer) return

    loadingSave = true

    let service = new PlayersService({ fetch })
    await service.update({
      ...editingPlayer
    })

    await reload()
    loadingSave = false
    editPlayerDialog = false
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
        <div class="flex items-center gap-4 hover:bg-[rgb(var(--global-color-background-300))] p-1">
          <div class="pl-2">
            <button on:click={() => deletePlayer(player)} disabled={loadingDelete !== undefined}>
              {#if loadingDelete == player.id}
                <CircularLoader></CircularLoader>
              {:else}
                <Icon name="mdi-delete" --icon-color="rgb(var(--global-color-error-500))"></Icon>
              {/if}
            </button>
          </div>
          <div class="flex-grow">
            <UserAvatar
              src={player.teammate?.user.avatarUrl}
              username={getPlayerFullname({ player })}
              description={player.role}
              --descriptive-avatar-image-gap="16px"
            />
          </div>
          <div>
            <ShirtIcon
              number={player.shirtNumber}
              primaryColor={player.shirtPrimaryColor || 'blue'}
              secondaryColor={player.shirtSecondaryColor || 'white'}
            ></ShirtIcon>
          </div>
          <div class="flex-shrink pr-4">
            <button on:click={() => {
              editPlayerDialog = true
              editingPlayer = player
            }}>
              <Icon name="mdi-pencil"></Icon>
            </button>
          </div>
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
          <div class="flex items-center gap-4 hover:bg-[rgb(var(--global-color-background-300))] p-1">
            <div class="pl-2 flex-shrink">
              <button on:click={() => deletePlayer(opponentPlayer)} disabled={loadingDelete !== undefined}>
                {#if loadingDelete == opponentPlayer.id}
                  <CircularLoader></CircularLoader>
                {:else}
                  <Icon name="mdi-delete" --icon-color="rgb(var(--global-color-error-500))"></Icon>
                {/if}
              </button>
            </div>
            <div class="flex-grow">
              {#if !!getPlayerFullname({ player: opponentPlayer })}
                <UserAvatar
                  username={getPlayerFullname({ player: opponentPlayer })}
                  description={opponentPlayer.role}
                  --descriptive-avatar-image-gap="16px"
                />
              {:else if !!opponentPlayer.role}
                <div class="text-xl">{opponentPlayer.role}</div>
              {/if}
            </div>
            <div class="flex-shrink">
              <ShirtIcon
                number={opponentPlayer.shirtNumber}
                primaryColor={opponentPlayer.shirtPrimaryColor || 'blue'}
                secondaryColor={opponentPlayer.shirtSecondaryColor || 'white'}
              ></ShirtIcon>
            </div>
            <div class="flex-shrink pr-4">
              <button on:click={() => {
                editPlayerDialog = true
                editingPlayer = opponentPlayer
              }}>
                <Icon name="mdi-pencil"></Icon>
              </button>
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

<StandardDialog
  title={!!editingPlayer ? getPlayerFullname({ player: editingPlayer }) : 'Modifica giocatore'}
  bind:open={editPlayerDialog}
>
  {#if editingPlayer !== undefined}
    <StudioPlayerForm
      name={editingPlayer?.aliases?.[0] || getPlayerFullname({ player: editingPlayer })}
      on:input={(e) => {
        if(e.detail.field == 'name' && !!editingPlayer) {
          editingPlayer.aliases = [e.detail.value || '']
          editingPlayer.aliases = editingPlayer.aliases.filter(e => !!e)
        }
      }}
      bind:shirtNumber={editingPlayer.shirtNumber}
      bind:shirtPrimaryColor={editingPlayer.shirtPrimaryColor}
      bind:shirtSecondaryColor={editingPlayer.shirtSecondaryColor}
      bind:isOpponent={editingPlayer.isOpponent}
      bind:role={editingPlayer.role}
    ></StudioPlayerForm>
  {/if}
  <ConfirmOrCancelButtons
    confirmText="Salva"
    on:confirm-click={handleSaveEditPlayer}
    on:cancel-click={() => {
      editPlayerDialog = false
      editingPlayer = undefined
    }}
    loading={loadingSave}
  ></ConfirmOrCancelButtons>
</StandardDialog>