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
					groupId: teammate.group?.id
				})
				.then(() => {
					loading = false

					if (!!$team) {
						let tm = $team.teammates.find((tm) => tm.id == parseInt($page.params.teammateId))
						if (!!tm) {
							let group = $team.groups?.find((r) => r.id == teammate?.group?.id)
							if (!!group) {
								tm.group = { ...group }
							} else {
								tm.group = undefined
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

	<TeammateForm bind:alias={teammate.alias} bind:group={teammate.group} teamGroups={data.team.groups} />
	<ConfirmOrCancelButtons
		on:confirm-click={handleConfirmClick}
		on:cancel-click={handleCancelClick}
		{loading}
	/>
{/if}
