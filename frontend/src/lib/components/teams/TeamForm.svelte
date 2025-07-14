<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import type { TeamState } from '@/lib/services/teams/team.svelte'
	import type { Team } from '@/lib/services/teams/teams.service'
	import TipTapEditor from '../common/TipTapEditor.svelte'
	import ClubsAutocomplete from '../clubs/ClubsAutocomplete.svelte'
	import type { Club } from '@/lib/services/clubs/clubs.service'

	interface Props {
		teamState: TeamState,
    clubs?: Club[]
	}

  let dirtyValues: (keyof Team)[] = $state([])

	let {
		teamState = $bindable(),
    clubs = []
	}: Props = $props()

  function handleSelectClub(e: {
    detail: {
      selection: {
        value: string | number,
        data?: {
          club: Club
        }
      }[]
    }
  }) {
    let selectedClub = e.detail.selection[0].data?.club
    teamState.team.club = selectedClub
    teamState.team.clubId = selectedClub?.id
  }
</script>

<div class="@container">
  <div class="flex flex-col gap-3 w-full">
    <div>
      <LabelAndTextfield 
        label="Nome" 
        name="name" 
        bind:value={teamState.team.name} 
        --simple-textfield-width="100%"
        --simple-textfield-hint-margin-left="4px"
        error={dirtyValues.includes('name') && teamState.validationData.name?.error}
        hint={dirtyValues.includes('name') ? teamState.validationData.name?.message : undefined}
        oninput={() => {
          dirtyValues.push('name')
        }}
        disabled={teamState.disabledFields.name}
      />
    </div>
    <div>
      <div class="font-medium mt-4 mb-2 ml-2">Bio</div>
      <TipTapEditor
        bind:content={teamState.team.notes}
        placeholder="Team bio ..."
        disabled={teamState.disabledFields.notes}
      ></TipTapEditor>
    </div>
    {#if !teamState.hiddenFields.clubId}
      <div>
        <div class="font-medium mt-4 mb-2 ml-2">Club</div>
        <ClubsAutocomplete
          {clubs}
          values={!!teamState.team.club ? [ teamState.team.club ] : undefined}
          onchange={handleSelectClub}
          disabled={teamState.disabledFields.clubId}
        ></ClubsAutocomplete>
      </div>
    {/if}
  </div>
</div>
