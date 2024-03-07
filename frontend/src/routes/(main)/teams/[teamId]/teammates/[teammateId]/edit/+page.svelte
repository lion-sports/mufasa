<script lang="ts" context="module">
	import type { Teammate } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import team from '$lib/stores/teams/teamsShow'
	import TeammateForm from '$lib/components/teammates/TeammateForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import TeammateService from '$lib/services/teammates/teammates.service'
	import { onMount } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	let teammate: Teammate | undefined

	onMount(() => {
		if (!!$team) {
			let tm = $team.teammates.find((tm) => tm.id == parseInt($page.params.teammateId))
			if (!!tm) {
				teammate = { ...tm }
			}
		}
	})

	team.subscribe((value) => {
		if (!!value) {
			let tm = value.teammates.find((tm) => tm.id == parseInt($page.params.teammateId))
			if (!!tm) {
				teammate = { ...tm }
			}
		}
	})

	let loading = false
	function handleConfirmClick() {
		loading = true

		let service = new TeammateService({ fetch })
		if (!!teammate) {
			service
				.update({
					id: teammate.id,
					alias: teammate.alias,
					roleId: teammate.role?.id
				})
				.then(() => {
					loading = false

					if (!!$team) {
						let tm = $team.teammates.find((tm) => tm.id == parseInt($page.params.teammateId))
						if (!!tm) {
							let role = $team.roles?.find((r) => r.id == teammate?.role?.id)
							if (!!role) {
								tm.role = { ...role }
							} else {
								tm.role = undefined
							}

							tm.alias = teammate?.alias
						}
					}

					window.history.back()
				})
		}
	}

	function handleCancelClick() {
		window.history.back()
	}
</script>

{#if !!teammate}
	<div
		style:font-weight="600"
		style:font-size="1.3rem"
		style:margin-top="20px"
		style:margin-bottom="20px"
	>
		{teammate.user.firstname}
		{teammate.user.lastname}
	</div>

	<TeammateForm bind:alias={teammate.alias} bind:role={teammate.role} teamRoles={data.team.roles} />
	<ConfirmOrCancelButtons
		on:confirm-click={handleConfirmClick}
		on:cancel-click={handleCancelClick}
		{loading}
	/>
{/if}
