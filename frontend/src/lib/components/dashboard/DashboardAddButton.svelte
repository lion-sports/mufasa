<script lang="ts">
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import { Icon } from '@likable-hair/svelte'
</script>

<button class="add-button" onclick={bubble('click')}>
	<Icon name="mdi-plus" --icon-default-size="1.5rem" />
	<div class="description">Add widget</div>
</button>

<style>
	.add-button {
		width: 100%;
		height: 100%;
		min-height: 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgb(var(--global-color-background-300));
		border-radius: 8px;
	}

	.description {
		font-size: 0.9rem;
		font-weight: 300;
		opacity: 0.7;
	}
</style>
