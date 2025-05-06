<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	let dispatch = createEventDispatcher<{
		'confirm-click': {
			nativeEvent: MouseEvent
		}
		'cancel-click': {
			nativeEvent: MouseEvent | KeyboardEvent
		}
	}>()

	function handleConfirm(event: any) {
		if (!confirmDisable) {
			dispatch('confirm-click', {
				nativeEvent: event.detail.nativeEvent
			})
		}
	}

	function handleCancel(nativeEvent: MouseEvent | KeyboardEvent) {
		if (!cancelDisable) {
			dispatch('cancel-click', {
				nativeEvent
			})
		}
	}

	import StandardButton from '$lib/components/common/StandardButton.svelte'
	interface Props {
		loading?: boolean
		marginTop?: string
		cancelText?: string
		confirmText?: string
		confirmDisable?: boolean
		cancelDisable?: boolean
	}

	let {
		loading = $bindable(false),
		marginTop = '20px',
		cancelText = 'Annulla',
		confirmText = 'Salva',
		confirmDisable = false,
		cancelDisable = false
	}: Props = $props()
</script>

<div style:margin-top={marginTop} class="button-container">
	<div class="link-button-container">
		<div></div>
		<button class="text-button" onclick={handleCancel}>{cancelText}</button>
	</div>
	<StandardButton {loading} on:click={handleConfirm} disabled={confirmDisable}
		>{confirmText}</StandardButton
	>
</div>

<style>
	@media (max-width: 768px) {
		.button-container {
			flex-direction: column-reverse;
		}
	}

	@media (min-width: 769px) {
		.button-container {
			justify-content: end;
			align-items: center;
			gap: 15px;
		}
	}

	.text-button {
		font-family: inherit;
		font-size: 100%;
		font-weight: inherit;
		line-height: inherit;
		color: inherit;
		margin: 0;
		padding: 0;
		background-color: transparent;
		background-image: none;
	}

	.button-container {
		display: flex;
	}

	.link-button-container {
		height: 45px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
