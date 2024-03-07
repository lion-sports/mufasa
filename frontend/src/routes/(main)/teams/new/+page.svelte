<script lang="ts">
	import TeamsService from '$lib/services/teams/teams.service'
	import { goto } from '$app/navigation'
	import TeamForm from '$lib/components/teams/TeamForm.svelte'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'

	let team: {
		name?: string
		notes?: string
	} = {}
	let loading = false

	function handleSubmit() {
		let service = new TeamsService({ fetch })
		loading = true
		service
			.create(team)
			.then(() => {
				loading = false
				goto('/teams')
			})
			.catch((error) => {
				console.log(error)
				loading = false
			})
	}

	function handleCancel() {
		goto('/teams')
	}
</script>

<PageTitle title="Nuovo team" prependVisible={true} />

<div style:margin-top="20px">
	<TeamForm bind:team />
	<ConfirmOrCancelButtons
		bind:loading
		on:confirm-click={handleSubmit}
		on:cancel-click={handleCancel}
	/>
</div>
