<script lang="ts">
	import { page } from '$app/stores'
	import team from '$lib/stores/teams/teamsShow'
	import TeammateForm from '$lib/components/teammates/TeammateForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import TeammateService from '$lib/services/teammates/teammates.service'
	import type { PageData } from './$types'
	import { invalidate } from '$app/navigation'

	export let data: PageData

	team.subscribe((value) => {
		if (!!value) {
			let tm = value.teammates.find((tm) => tm.id == parseInt($page.params.teammateId))
			if (!!tm) {
				data.teammate = { ...tm }
			}
		}
	})

	let loading = false
	async function handleConfirmClick() {
		loading = true

		let service = new TeammateService({ fetch })
		await service.update({
      id: data.teammate.id,
      alias: data.teammate.alias,
      groupId: data.teammate.group?.id,
      defaultRole: data.teammate.defaultRole,
      availableRoles: data.teammate.availableRoles
    })
				
		loading = false

    await invalidate('teams:[teamId]')
    window.history.back()
	}

	function handleCancelClick() {
		window.history.back()
	}

</script>

<div class="mt-4">
  <TeammateForm
    bind:alias={data.teammate.alias} 
    bind:group={data.teammate.group} 
    bind:teamGroups={data.team.groups} 
    bind:defaultRole={data.teammate.defaultRole}
    bind:availableRoles={data.teammate.availableRoles}
  />
</div>

<ConfirmOrCancelButtons
  on:confirm-click={handleConfirmClick}
  on:cancel-click={handleCancelClick}
  {loading}
/>
