<script lang="ts">
	import { ToolTip } from "@likable-hair/svelte"

  let clazz: string | undefined = undefined;
	export { clazz as class };

  export let friend: boolean = false,
    opponent: boolean = false,
    libero: boolean = false,
    selected: boolean = false

  let activator: HTMLElement
</script>

<ToolTip 
  bind:activator
  appearTimeout={400}
>
  <div class="bg-[rgb(var(--global-color-background-200))] p-1 rounded-sm {clazz}">
    <slot name="tooltip"></slot>
  </div>
</ToolTip>

<button
  class="
    relative marker rounded-full flex justify-center items-center text-white
    {libero ? 'rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : ''}
  "
  style:--background-color={friend && !libero ? '#3b82f6' : opponent && !libero ? '#ef4444' : undefined}
  class:selected
  bind:this={activator}
  on:click
>
  <slot></slot>
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