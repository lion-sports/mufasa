<script lang="ts">
	import ConfirmOrCancelButtons from './ConfirmOrCancelButtons.svelte'
	import StandardDialog from './StandardDialog.svelte'

	interface Props {
		open: boolean
		title?: string
		description?: string
		confirmText?: string
		cancelText?: string
	}

	let {
		open = $bindable(),
		title = 'Conferma',
		description = "Sicuro di confermare l'operazione?",
		confirmText = 'Conferma',
		cancelText = 'Annulla'
	}: Props = $props()
</script>

<StandardDialog bind:open {title}>
	<div class="mb-4">
		{description}
	</div>
	<ConfirmOrCancelButtons
		marginTop="0px"
		{confirmText}
		{cancelText}
		on:cancel-click
		on:confirm-click
	/>
</StandardDialog>
