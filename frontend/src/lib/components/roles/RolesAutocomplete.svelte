<script lang="ts">
	import RolesService from '$lib/services/roles/roles.service'

	export let team: { id: number },
		width: string | undefined = undefined,
		values: Item[] = []

	let items: Item[]
	onMount(() => {
		loadRoles()
	})

	async function loadRoles() {
		if (!!team) {
			let service = new RolesService({ fetch })
			let response = await service.list({ team: team })
			items = response.data.map((role) => {
				return {
					value: role.id.toString(),
					label: role.name
				}
			})
		}
	}

	$: if (!!team) loadRoles()

	import StandardAutocomplete from '$lib/components/common/StandardAutocomplete.svelte'
	import { onMount } from 'svelte'
</script>
