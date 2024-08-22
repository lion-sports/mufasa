<script lang="ts">
	import { Icon } from "@likable-hair/svelte"
	import CircularProgressIndicator from "../../common/CircularProgressIndicator.svelte"

  export let icon: string,
    progress: number | undefined = undefined,
    iconClass: string | undefined = undefined

</script>

<button 
  class="text-left p-2 rounded-md w-full hover:bg-[var(--hover-background-color)] bg-[var(--background-color)] flex items-center gap-2"
  on:click
>
  <div class="mr-2 {iconClass || ''}">
    <Icon name={icon}></Icon>
  </div>
  <div>
    <slot></slot>
  </div>
  <div class="ml-auto">
    {#if progress !== undefined}
      <CircularProgressIndicator {progress}></CircularProgressIndicator>
    {/if}
  </div>
</button>