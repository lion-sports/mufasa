<script lang="ts" module>
	export type Team = {
		name?: string
		notes?: string
	}
</script>

<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import LabelAndTextarea from '$lib/components/common/LabelAndTextarea.svelte'

	interface Props {
		team?: Team;
		mode?: 'create' | 'update';
		padding?: string | undefined;
		margin?: string | undefined;
		width?: string | undefined;
		height?: string | undefined;
	}

	let {
		team = $bindable({
			name: undefined,
			notes: undefined
		}),
		mode = 'create',
		padding = undefined,
		margin = undefined,
		width = undefined,
		height = undefined
	}: Props = $props();
</script>

<form style:padding style:margin style:width style:height>
	<LabelAndTextfield label="Nome" name="name" bind:value={team.name} />
	<LabelAndTextarea label="Note" name="notes" bind:value={team.notes} />
</form>
