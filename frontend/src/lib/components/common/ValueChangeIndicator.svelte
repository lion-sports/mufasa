<script lang="ts">
	import { Icon } from "@likable-hair/svelte"

  export let difference: number,
    postfix: string | undefined = undefined,
    invertPositivity: boolean = false,
    showIcon: boolean = true
</script>

{#if difference !== 0}
  {#if (invertPositivity && difference < 0) || difference > 0}
    <div
      class="text-green-500"
    >
      + {difference} {postfix || ''}
      {#if showIcon}
        <span>
          <Icon name="mdi-arrow-up"></Icon>
        </span>
      {/if}
    </div>
  {:else}
    <div
      class="text-red-500"
    >
      - {Math.abs(difference)} {postfix || ''}
      {#if showIcon}
        <span>
          <Icon name="mdi-arrow-down"></Icon>
        </span>
      {/if}
    </div>
  {/if}
{/if}