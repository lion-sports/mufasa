<script lang="ts">
	import StandardDialog from "$lib/components/common/StandardDialog.svelte"
  import UserAvatar from "$lib/components/common/UserAvatar.svelte"
	import ShirtDropdown from "$lib/components/shirts/ShirtDropdown.svelte"
	import type { Player, Scout } from "$lib/services/scouts/scouts.service"
	import TeammatesService from "$lib/services/teammates/teammates.service"
	import type { Teammate } from "$lib/services/teams/teams.service"
	import { Icon } from "@likable-hair/svelte"
	import ScoutRoleAutocomplete from "../ScoutRoleAutocomplete.svelte"
	import StandardTabSwitcher from "$lib/components/common/StandardTabSwitcher.svelte"
  import { SelectableVerticalList } from "@likable-hair/svelte"
	import StandardButton from "$lib/components/common/StandardButton.svelte"
	import LabelAndCheckbox from "$lib/components/common/LabelAndCheckbox.svelte"

  export let scout: Scout

  $: if(!scout.scoutInfo.general.opponent) scout.scoutInfo.general.opponent = {}

  function getPlayerFullname(params: { player: Scout['players'][0] }): string {
    return TeammatesService.getTeammateName({
      teammate: params.player.teammate
    })
  }

  let addTeamPlayerDialog: boolean = false,
    addTeamPlayerSelectedTab: string = 'create',
    addTeamPlayerImportShirts: boolean = true,
    addTeamPlayerImportRoles: boolean = true
</script>

<div class="flex gap-2">
  <div class="basis-5/12">
    <div class="text-right text-2xl font-bold">{scout.event.team.name}</div>
    <div class="flex flex-col gap-2 mt-8">
      {#each scout.players as player}
        <div class="flex justify-end items-center gap-4">
          <ScoutRoleAutocomplete
            values={[]}
            height="auto"
          ></ScoutRoleAutocomplete>
          <ShirtDropdown
            items={player.teammate.shirts}
          ></ShirtDropdown>
          <UserAvatar
            src={player.teammate.user.avatarUrl}
            username={getPlayerFullname({ player })}
            description={player.role}
            reverse
            --descriptive-avatar-image-gap="16px"
          />
        </div>
      {/each}
      <div class="flex justify-center">
        <button
          on:click={() => {
            addTeamPlayerDialog = true
            addTeamPlayerSelectedTab = 'importConvocation'
          }}
        >
          <Icon name="mdi-plus"></Icon>
        </button>
      </div>
    </div>
  </div>
  <div class="w-[24px] text-center basis-2/12 mt-2">
    vs
  </div>
  <div class="basis-5/12 text-2xl font-bold">
    {#if !!scout.scoutInfo.general.opponent}
      <input 
        type="text"
        placeholder="Avversari"
        class="bg-transparent border-none outline-none"
        bind:value={scout.scoutInfo.general.opponent.name}
      />
    {/if}
  </div>
</div>

<StandardDialog
  title="Aggiungi giocatore"
  bind:open={addTeamPlayerDialog}
>
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
      bind:selected={addTeamPlayerSelectedTab}
    ></StandardTabSwitcher>
    <div class="mt-4 max-h-[80vh] overflow-auto">
      {#if addTeamPlayerSelectedTab == 'importConvocation'}
        <div class="mb-2">
          <LabelAndCheckbox
            label="Importa maglie"
            id="import-shirt"
            bind:value={addTeamPlayerImportShirts}
          ></LabelAndCheckbox>
        </div>
        <div class="mb-2">
          <LabelAndCheckbox
            label="Importa ruoli"
            id="import-shirt"
            bind:value={addTeamPlayerImportRoles}
          ></LabelAndCheckbox>
        </div>
        <div class="mb-2">
          <StandardButton>Importa tutti</StandardButton>
        </div>
        <div class="flex flex-col gap-1">
          {#each scout.event.convocations as convocation}
            <button class="flex gap-2 hover:bg-[rgb(var(--global-color-background-400))] p-4 rounded transition-all">
              <div>
                {#if convocation.confirmationStatus == 'confirmed' }
                  <Icon name="mdi-check" --icon-color="rgb(var(--global-color-success))"></Icon>
                {:else if convocation.confirmationStatus == 'denied'}
                  <Icon name="mdi-close" --icon-color="rgb(var(--global-color-error-500))"></Icon>
                {:else}
                  <Icon name="mdi-minus" --icon-color="rgb(var(--global-color-primary-400))"></Icon>
                {/if}
              </div>
              <div>
                {TeammatesService.getTeammateName({ teammate: convocation.teammate })}
              </div>
              <div class="ml-auto">
                {#if scout.players.some((p) => p.convocationId == convocation.id)}
                  <Icon name="mdi-refresh"></Icon>
                {:else}
                  <Icon name="mdi-download"></Icon>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {:else if addTeamPlayerSelectedTab == 'create'}
        create
      {/if}
    </div>
  </div>
</StandardDialog>