<script lang="ts">
	import type { Team } from '@/lib/services/teams/teams.service'
  import type { PageData } from './$types';
	import ClubsTeamsList from '@/lib/components/clubs/ClubsTeamsList.svelte'
	import { goto } from '$app/navigation'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'

  let { data }: { data: PageData } = $props();

  function handleTeamClick(e: {
    team: Team
  }) {
    goto(`/teams/${e.team.id}`)
  }
</script>

{#if !!data.club.teams && data.club.teams.length > 0}
  <div class="w-full flex justify-end mr-2 my-2">
    <StandardButton
    href={`/teams/new?clubId=${data.club.id}`}
    >
      <div class="mr-2">
        <Icon name="mdi-plus"></Icon>
      </div>
      Nuovo
    </StandardButton>
  </div>
{/if}
<ClubsTeamsList
  teams={data.club.teams || []}
  onclick={handleTeamClick}
>
  {#snippet noData()}
    <div class="flex flex-col justify-center items-center h-[132px]">
      <div class="text-sm opacity-50">Nessun team</div>
      <a
        href={`/teams/new?clubId=${data.club.id}`}
        class="underline text-[rgb(var(--global-color-primary-500))]"
      >Creane uno</a>
    </div>
  {/snippet}
</ClubsTeamsList>