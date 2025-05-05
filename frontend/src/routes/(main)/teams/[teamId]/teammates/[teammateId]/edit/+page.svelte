<script lang="ts">
	import { page } from '$app/stores'
	import team from '$lib/stores/teams/teamsShow'
	import TeammateForm from '$lib/components/teammates/TeammateForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import TeammateService from '$lib/services/teammates/teammates.service'
	import type { PageData } from './$types'
	import { invalidate } from '$app/navigation'

	interface Props {
		data: PageData;
	}

	let { data = $bindable() }: Props = $props();
  let teammate = $state(data.teammate)

	team.subscribe((value) => {
		if (!!value) {
			let tm = value.teammates.find((tm) => tm.id == parseInt($page.params.teammateId))
			if (!!tm) {
				teammate = { ...tm }
			}
		}
	})

	let loading = $state(false)
	async function handleConfirmClick() {
		loading = true

		let service = new TeammateService({ fetch })
		await service.update({
      id: teammate.id,
      alias: teammate.alias,
      groupId: teammate.group?.id,
      defaultRole: teammate.defaultRole,
      availableRoles: teammate.availableRoles
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
    bind:alias={teammate.alias} 
    bind:group={teammate.group} 
    teamGroups={data.team.groups} 
    bind:defaultRole={teammate.defaultRole}
    bind:availableRoles={teammate.availableRoles}
  />
</div>

<ConfirmOrCancelButtons
  on:confirm-click={handleConfirmClick}
  on:cancel-click={handleCancelClick}
  {loading}
/>
