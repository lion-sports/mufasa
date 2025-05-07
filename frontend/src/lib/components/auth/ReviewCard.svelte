<script lang="ts">
	interface Props {
		reviewContent: import('svelte').Snippet
		icon: import('svelte').Snippet
	}

	let { reviewContent, icon }: Props = $props()
</script>

<div class="p-2.5 border border-[rgb(var(--global-color-background-400))] rounded-md shadow-sm">
	<div class="w-full flex gap-3">
		<div class="flex flex-col items-center justify-center">
			{@render icon()}
		</div>
		<div class="w-full flex flex-col text-sm text-[rgb(var(--global-color-contrast-500))]">
			{@render reviewContent()}
		</div>
	</div>
</div>
