<script lang="ts">
	import ConfirmOrCancelButtons from './ConfirmOrCancelButtons.svelte'
	import StandardDialog from './StandardDialog.svelte'

	export let open: boolean = false,
		title: string = 'Conferma',
		description: string = "Sicuro di confermare l'operazione?",
		confirmText: string = 'Conferma',
		cancelText: string = 'Annulla'
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
