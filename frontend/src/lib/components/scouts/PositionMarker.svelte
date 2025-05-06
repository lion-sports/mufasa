<script lang="ts">
	interface Props {
		friend?: boolean
		opponent?: boolean
		children?: import('svelte').Snippet
	}

	let { friend = false, opponent = false, children }: Props = $props()
</script>

<div
	class="rounded-md w-[56px] h-[56px] flex justify-center items-center text-white bg-gr"
	class:bg-gray-500={friend || opponent}
>
	{@render children?.()}
</div>
