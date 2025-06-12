<script lang="ts">
	import { Icon } from '@likable-hair/svelte'

	interface Props {
		difference: number
		postfix?: string | undefined
		invertPositivity?: boolean
		showIcon?: boolean
	}

	let {
		difference,
		postfix = undefined,
		invertPositivity = false,
		showIcon = true
	}: Props = $props()
</script>

{#if difference !== 0}
	{#if (invertPositivity && difference < 0) || difference > 0}
		<div class="text-green-500">
			+ {difference}
			{postfix || ''}
			{#if showIcon}
				<span>
					<Icon name="mdi-arrow-up"></Icon>
				</span>
			{/if}
		</div>
	{:else}
		<div class="text-red-500">
			- {Math.abs(difference)}
			{postfix || ''}
			{#if showIcon}
				<span>
					<Icon name="mdi-arrow-down"></Icon>
				</span>
			{/if}
		</div>
	{/if}
{/if}
