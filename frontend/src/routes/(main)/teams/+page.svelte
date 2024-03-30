<script lang="ts" context="module">
	import type { Team } from '$lib/services/teams/teams.service'
	import type { Invitation } from '$lib/services/invitations/invitations.service'
</script>

<script lang="ts">
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import OptionMenu from '$lib/components/common/OptionMenu.svelte'
	import TeamsBoxList from '$lib/components/teams/TeamsBoxList.svelte'
	import TeamsService from '$lib/services/teams/teams.service'
	import InvitationsService from '$lib/services/invitations/invitations.service'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import InvitationToAccept from '$lib/components/invitations/InvitationToAccept.svelte'
	import type { PageData } from './$types'

	export let data: PageData

	async function loadTeams() {
		let service = new TeamsService({ fetch })
		let paginationData = await service.list()
		data.teams = paginationData.data
	}

	let invitationsToAccept: Invitation[]
	async function loadInvitations() {
		let service = new InvitationsService({ fetch })
		invitationsToAccept = await service.invitationToAccept()
	}

	async function handleTeamClick(event: any) {
		goto('/teams/' + event.detail.team.id + '/general')
	}

	async function reload() {
		await loadTeams()
		await loadInvitations()
	}

	onMount(() => {
		loadTeams()
		loadInvitations()
	})

	function handleOptionClick(event: any) {
		if (event.detail?.element?.name == 'new') goto('/teams/new')
	}
</script>

<PageTitle title="Teams">
	<svelte:fragment slot="append">
		<OptionMenu
			options={[
				{
					name: 'new',
					title: 'Nuovo',
					icon: 'mdi-plus'
				}
			]}
			on:select={handleOptionClick}
		/>
	</svelte:fragment>
</PageTitle>

<div>
	<TeamsBoxList searchable marginTop="20px" teams={data.teams} on:teams-click={handleTeamClick} />
</div>
<div class="font-bold mt-4">I miei inviti</div>
<div style:margin-top="10px">
	<InvitationToAccept invitations={invitationsToAccept} on:accept={reload} on:reject={reload} />
</div>
