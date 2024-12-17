<script lang="ts">
	import { Icon } from "@likable-hair/svelte"

  export let difference: number,
    postfix: string | undefined = undefined,
    invertPositivity: boolean = false
</script>

{#if (invertPositivity && difference < 0) || difference > 0}
  <div
    class="text-green-500"
  >
    + {difference} {postfix || ''}
    <span>
      <Icon name="mdi-arrow-up"></Icon>
    </span>
  </div>
{:else}
  <div
    class="text-red-500"
  >
    - {Math.abs(difference)} {postfix || ''}
    <span>
      <Icon name="mdi-arrow-down"></Icon>
    </span>
  </div>
{/if}