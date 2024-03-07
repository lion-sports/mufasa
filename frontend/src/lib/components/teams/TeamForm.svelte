<script lang="ts" context="module">
	export type Team = {
		name?: string
		notes?: string
	}
</script>

<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import LabelAndTextarea from '$lib/components/common/LabelAndTextarea.svelte'

	export let team: Team = {
			name: undefined,
			notes: undefined
		},
		mode: 'create' | 'update' = 'create',
		padding: string | undefined = undefined,
		margin: string | undefined = undefined,
		width: string | undefined = undefined,
		height: string | undefined = undefined
</script>

<form style:padding style:margin style:width style:height>
	<LabelAndTextfield label="Nome" name="name" bind:value={team.name} />
	<LabelAndTextarea label="Note" name="notes" bind:value={team.notes} />
</form>
