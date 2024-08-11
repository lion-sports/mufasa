<script lang="ts">
	import LabelAndCheckbox from "../../common/LabelAndCheckbox.svelte"
  import StandardTabSwitcher from "../../common/StandardTabSwitcher.svelte";
  import StandardButton from "../../common/StandardButton.svelte";
	import ScoutsService, { type Scout } from "@/lib/services/scouts/scouts.service"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
	import { CircularLoader, Icon } from "@likable-hair/svelte"
	import StudioPlayerForm from "./StudioPlayerForm.svelte"
	import type { Player } from "@/lib/services/players/players.service"
	import type { Convocation } from "@/lib/services/convocations/convocations.service"
	import PlayersService from "@/lib/services/players/players.service"
	import { reload } from "@/lib/stores/scout/studio"
	import { createEventDispatcher } from "svelte"

  let dispatch = createEventDispatcher<{
    'create': {
      player: Player
    }
  }>()

  export let selectedTab: string = '',
    importShirtsActive: boolean = true,
    importRolesActive: boolean = true,
    importAbsentsActive: boolean = false,
    loadingImportAll: boolean = false,
    loadingImportConvocation: number | undefined = undefined,
    loadingCreatePlayer: boolean = false,
    newPlayer: Partial<Player> = {
      aliases: []
    },
    scout: Scout

  async function importAllTeammates() {
    let confirmed = confirm('Vuoi davvero importare tutte le convocazioni?')

    if(confirmed) {
      loadingImportAll = true
      let scoutService = new ScoutsService({ fetch })
      await scoutService.importTeammates({
        id: scout.id,
        importAbsents: importAbsentsActive,
        importRoles: importRolesActive,
        importShirts: importShirtsActive
      })
      loadingImportAll = false
    }
  }

  async function importTeammate(convocation: Convocation) {
    let confirmed = confirm('Vuoi davvero importare la convocazione?')

    if(confirmed) {
      loadingImportConvocation = convocation.id
      let playerService = new PlayersService({ fetch })
      await playerService.create({
        scoutId: scout.id,
        convocationId: convocation.id
      })
      await reload()
      loadingImportConvocation = undefined
    }
  }

  $: newPlayer.scoutId = scout.id

  async function createPlayer() {
    let confirmed = confirm('Sei sicuro di voler creare il giocatore?')

    if(confirmed) {
      loadingCreatePlayer = true
      let playerService = new PlayersService({ fetch })
      let player = await playerService.create({
        scoutId: scout.id,
        ...newPlayer
      })

      await reload()
      loadingCreatePlayer = false

      dispatch('create', {
        player
      })
    }
  }
</script>

<div class="min-w-[min(95vw,400px)] max-w-[min(95vw,400px)]">
  <StandardTabSwitcher 
    tabs={[
      {
        name: 'importConvocation',
        label: 'Da convocazioni',
      }, {
        name: 'create',
        label: 'Nuovo',
      }
    ]}
    bind:selected={selectedTab}
  ></StandardTabSwitcher>
  <div class="mt-4 max-h-[80vh] overflow-auto">
    {#if selectedTab == 'importConvocation'}
      <div class="grid grid-cols-2 gap-2 items-center">
        <div class="mb-2">
          <LabelAndCheckbox
            label="Importa maglie"
            id="import-shirt"
            bind:value={importShirtsActive}
          ></LabelAndCheckbox>
        </div>
        <div class="mb-2">
          <LabelAndCheckbox
            label="Importa ruoli"
            id="import-roles"
            bind:value={importRolesActive}
          ></LabelAndCheckbox>
        </div>
        <div class="mb-2">
          <LabelAndCheckbox
            label="Importa assenti"
            id="import-absents"
            bind:value={importAbsentsActive}
          ></LabelAndCheckbox>
        </div>
      </div>
      <div class="mb-2 w-full">
        <StandardButton
          on:click={importAllTeammates}
          --button-width="100%"
        >Importa tutti</StandardButton>
      </div>
      <div class="flex flex-col gap-1">
        {#each scout.event.convocations as convocation}
          <button 
            class="flex gap-2 hover:bg-[rgb(var(--global-color-background-400))] p-4 rounded transition-all"
            on:click={() => importTeammate(convocation)}
          >
            <div>
              {#if convocation.confirmationStatus == 'confirmed' }
                <Icon name="mdi-check" --icon-color="rgb(var(--global-color-success))"></Icon>
              {:else if convocation.confirmationStatus == 'denied'}
                <Icon name="mdi-close" --icon-color="rgb(var(--global-color-error-500))"></Icon>
              {:else}
                <Icon name="mdi-account" --icon-color="rgb(var(--global-color-primary-400))"></Icon>
              {/if}
            </div>
            <div>
              {TeammatesService.getTeammateName({ teammate: convocation.teammate })}
            </div>
            <div class="ml-auto">
              {#if loadingImportConvocation == convocation.id}
                <CircularLoader --circular-loader-width="12px" --circular-loader-height="12px"></CircularLoader>
              {:else if scout.players.some((p) => p.convocationId == convocation.id)}
                <Icon name="mdi-refresh"></Icon>
              {:else}
                <Icon name="mdi-download"></Icon>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {:else if selectedTab == 'create'}
      <div class="px-2">
        <StudioPlayerForm
          name={newPlayer?.aliases?.[0] || ''}
          on:input={(e) => {
            if(e.detail.field == 'name') {
              if(!!e.detail.value) {
                newPlayer.aliases = [e.detail.value]
              } else {
                newPlayer.aliases = []
              }
            }
          }}
          bind:shirtNumber={newPlayer.shirtNumber}
          bind:shirtPrimaryColor={newPlayer.shirtPrimaryColor}
          bind:shirtSecondaryColor={newPlayer.shirtSecondaryColor}
          bind:isOpponent={newPlayer.isOpponent}
          bind:role={newPlayer.role}
          --simple-textfield-background-color="rgb(var(--global-color-background-200))"
          --simple-textfield-width="100%"
        ></StudioPlayerForm>
      </div>
      <div class="mt-4">
        <StandardButton
          on:click={createPlayer}
          --button-width="100%"
        >Crea</StandardButton>
      </div>
    {/if}
  </div>
</div>