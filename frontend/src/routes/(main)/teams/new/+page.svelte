<script lang="ts">
	import TeamsService from '$lib/services/teams/teams.service'
	import { goto } from '$app/navigation'
	import TeamForm from '$lib/components/teams/TeamForm.svelte'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import { TeamState } from '@/lib/services/teams/team.svelte'
	import { addErrorToast, addSuccessToast } from '@/lib/components/ui/sonner'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import type { PageData } from './$types'

  let { data }: { data: PageData } = $props();

	let teamState: TeamState = $state(new TeamState({
      team: {
        clubId: data.selectedClub?.id,
        club: data.selectedClub
      },
      disabledFields: {
        clubId: !!data.selectedClub,
        club: !!data.selectedClub
      }
    })),
    loading = $state(false)

	async function handleSubmit() {
    if(!teamState.validatedTeam) return

		let service = new TeamsService({ fetch })
		loading = true
    try {
      await service.create({
        ...teamState.validatedTeam
      })

      addSuccessToast({
        title: 'Operazione conclusa',
        options: {
          description: 'L\'operazione è andata a buon fine'
        }
      })
      goto('/teams')
    } catch(e) {
      addErrorToast({
        title: 'Operazione fallita',
        options: {
          description: 'L\'operazione non è andata a buon fine'
        }
      })
    }

    loading = false
	}
</script>

<PageTitle title="Nuovo team" prependVisible={true} />


<div class="flex justify-center">
  <div style:max-width="min(100vw,800px)" class="w-full">
    <div>
      <TeamForm
        bind:teamState={teamState}
        clubs={data.paginatedClubs.data}
      ></TeamForm>
    </div>
    <div class="flex flex-col gap-2 w-full mt-4">
      <div class="w-full">
        <StandardButton
          --button-width="100%"
          on:click={handleSubmit}
          {loading}
          disabled={!teamState.isValid}
        >
          <span class="mr-2">
            Crea
          </span>
          <Icon name="mdi-arrow-right"></Icon>
        </StandardButton>
      </div>
    </div>
  </div>
</div>
