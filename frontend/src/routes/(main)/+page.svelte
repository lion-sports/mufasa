<script lang="ts" context="module">
	import type { Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import type { PageData } from './$types'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import { onMount } from 'svelte'
	import TeamsService from '$lib/services/teams/teams.service'
	import { goto } from '$app/navigation'
	import EventsHorizontalList from '$lib/components/events/EventsHorizontalList.svelte'
  import user from '$lib/stores/auth/user'
	import TeamsLatestAbsencesChart from '$lib/components/teams/TeamsLatestAbsencesChart.svelte'
  import TeamsLatestPresencesChart from '$lib/components/teams/TeamsLatestPresencesChart.svelte';
  import MostAbsentTeammates from '$lib/components/teammates/MostAbsentTeammates.svelte'
  import TeamsBoxList from '$lib/components/teams/TeamsBoxList.svelte';

	export let data: PageData

	let teams: Team[] = []
	async function loadTeams() {
		let service = new TeamsService({ fetch })
		let paginationData = await service.list()
		teams = paginationData.data
	}

	let loadingEvents: boolean = false

	async function handleTeamClick(event: any) {
		goto('/teams/' + event.detail.team.id + '/general')
	}

	onMount(() => {
		loadTeams()
	})
</script>

<PageTitle title={`Benvenuto ${$user?.firstname} 👋 su Lion Sports`} />
<div class="font-bold mt-4">Prossimi appuntamenti</div>
<div style:margin-top="10px">
	{#if loadingEvents}
		Caricamento eventi ...
	{:else}
		<EventsHorizontalList events={data.nextEvents} />
	{/if}
</div>
<div class="font-bold mt-4">Andamento convocazioni</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  <div class="bg-[rgb(var(--global-color-background-300))] p-4 flex flex-col gap-3 rounded-md">
    <div class="text-xl font-bold">Ultime assenze</div>
    <TeamsLatestAbsencesChart
      absences={data.absencesInLatestEvents}
    ></TeamsLatestAbsencesChart>
  </div>
  <div class="bg-[rgb(var(--global-color-background-300))] p-4 flex flex-col gap-3 rounded-md">
    <div class="text-xl font-bold">Ultime presenze</div>
    <TeamsLatestPresencesChart
      presences={data.absencesInLatestEvents}
    ></TeamsLatestPresencesChart>
  </div>
</div>
<div class="bg-[rgb(var(--global-color-background-300))] p-4 flex flex-col gap-3 rounded-md mt-4">
  <div class="text-xl font-bold">Assenze per giocatori</div>
  <MostAbsentTeammates
    data={data.mostAbsenceForTeammate}
  ></MostAbsentTeammates>
</div>
<div class="font-bold mt-4">I miei teams</div>
<div>
  <TeamsBoxList searchable={false} marginTop="20px" teams={data.teams} on:teams-click={handleTeamClick} />
</div>
