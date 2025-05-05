<script lang="ts">
	import TeamService from '$lib/services/teams/teams.service'
	import { MediaQuery } from '@likable-hair/svelte'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import TeamForm from '$lib/components/teams/TeamForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let loading = false
	function handleConfirmClick() {
		loading = true

		let service = new TeamService({ fetch })
		service.update(data.team).then(() => {
			loading = false
			window.history.back()
		})
	}

	function handleCancelClick() {
		goto('/teams/' + data.team.id + '/general')
	}
</script>

<PageTitle title={data.team?.name} prependVisible={true} />

{#if !!data.team}
	<div style:margin-top="20px">
		<TeamForm team={data.team} mode="update" />
		<ConfirmOrCancelButtons
			on:confirm-click={handleConfirmClick}
			on:cancel-click={handleCancelClick}
		/>
	</div>
{:else}
	no team
{/if}
