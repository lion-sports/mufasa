<script lang="ts">
	import { Dialog, Icon } from '@likable-hair/svelte'
	
	interface Props {
		open: boolean
		title?: string | undefined
		_overlayOpacity?: string | undefined
		children?: import('svelte').Snippet
    titlePrepend?: import('svelte').Snippet
    titleAppend?: import('svelte').Snippet
	}

	let { open = $bindable(), title = undefined, _overlayOpacity = '60%', children, titlePrepend, titleAppend }: Props = $props()
</script>

<Dialog bind:open {_overlayOpacity} _overlayBackdropFilter="blur(2px)">
	<div class="card max-h-[90vh] max-w-[90vw] overflow-y-auto">
		{#if !!title}
			<div class="flex gap-1">
				{#if !!titlePrepend}
					<div>
						{@render titlePrepend()}
					</div>
				{/if}
				<div class="font-bold text-2xl py-3 px-4">{title}</div>
				<div class="flex-grow h-full py-3">
          {#if !!titleAppend}
            {@render titleAppend()}
          {:else}
            <div class="flex justify-end items-center mr-3">
              <button
                class="h-[36px] w-[36px] rounded-full hover:bg-[rgb(var(--global-color-contrast-900),.1)]"
                onclick={() => (open = false)}
              >
                <Icon name="mdi-close" />
              </button>
            </div>
          {/if}
				</div>
			</div>
			<div class="separator"></div>
		{/if}
    <div class="content h-[calc(100%-64px)] overflow-y-auto">
      {@render children?.()}
    </div>
	</div>
</Dialog>

<style>
	.card {
		background-color: var(
			--standard-dialog-background-color,
			rgb(var(--global-color-background-100))
		);
		border-radius: var(--standard-dialog-border-radius, 4px);
	}

  .content {
		padding: var(--standard-dialog-padding, 12px);
	}

	.separator {
		height: 1px;
		background-color: rgb(var(--global-color-background-400), 0.4);
	}
</style>
