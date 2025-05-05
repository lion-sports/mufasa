<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
	import { ToolTip } from "@likable-hair/svelte"

	

  interface Props {
    class?: string | undefined;
    friend?: boolean;
    opponent?: boolean;
    libero?: boolean;
    selected?: boolean;
    tooltip?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let {
    class: clazz = undefined,
    friend = false,
    opponent = false,
    libero = false,
    selected = false,
    tooltip,
    children
  }: Props = $props();

  let activator: HTMLElement | undefined = $state()
</script>

{#if activator}
  <ToolTip 
    bind:activator
    appearTimeout={400}
  >
    <div class="bg-[rgb(var(--global-color-background-200))] p-1 rounded-sm {clazz}">
      {@render tooltip?.()}
    </div>
  </ToolTip>
{/if}

<button
  class="
    relative marker rounded-full flex justify-center items-center text-white
    {libero ? 'rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : ''}
  "
  style:--background-color={friend && !libero ? '#3b82f6' : opponent && !libero ? '#ef4444' : undefined}
  class:selected
  bind:this={activator}
  onclick={bubble('click')}
>
  {@render children?.()}
</button>

<style>
  .marker {
    height: var(--player-marker-height, 40px);
    width: var(--player-marker-width, 40px);
    font-size: var(--player-marker-font-size, inherit);
    background-color: var(--background-color);
    transition: all
  }

  .selected::before {
    content: '';
    top: -15px;
    left: -15px;
    bottom: -15px;
    right: -15px;
    position: absolute;
    border-radius: 9999px;
    border: 8px solid var(--background-color, #a855f7);
  }
</style>