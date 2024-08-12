<script lang="ts">
	import { ToolTip } from "@likable-hair/svelte"

  export let friend: boolean = false,
    opponent: boolean = false

  let activator: HTMLElement
</script>

<ToolTip 
  bind:activator
  appearTimeout={400}
>
  <div class="bg-[rgb(var(--global-color-background-200))] p-1 rounded-sm">
    <slot name="tooltip"></slot>
  </div>
</ToolTip>

<div
  class="rounded-full w-[40px] h-[40px] flex justify-center items-center text-white"
  class:bg-blue-500={friend}
  class:bg-red-500={opponent}
  bind:this={activator}
>
  <slot></slot>
</div>