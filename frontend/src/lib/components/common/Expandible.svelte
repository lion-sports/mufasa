<script lang="ts">
	import { Icon } from "@likable-hair/svelte";
  import Divider from "$lib/components/common/Divider.svelte";
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  let dispatch = createEventDispatcher<{
    'change': {
      expanded: boolean
    }
  }>()

  export let expanded: boolean = false,
    title: string | undefined = undefined,
    description: string | undefined = undefined


  function handleHeaderClick() {
    expanded = !expanded

    dispatch('change', {
      expanded
    })
  }
</script>

<div class="expandible-container">
  <div
    class="header-container"
    on:click={handleHeaderClick}
    on:keypress={handleHeaderClick}
  >
    <div class="header">
      <slot name="header">
        <span class="title">{title}</span>
      </slot>
    </div>
    <div class="append">
      <slot name="append">
        <div
          class="icon"
          class:rotated={expanded}
        >
          <Icon name="mdi-chevron-down"></Icon>
        </div>
      </slot>
    </div>
  </div>
  {#if expanded}
    <div class="body" transition:slide|local={{duration: 200}}>
      <slot name="body">
        <span class="description">{description}</span>
      </slot>
    </div>
  {/if}
  <Divider
    marginLeft="0px"
  ></Divider>
</div>

<style>
  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
  }

  .header {
    flex-grow: 1;
  }

  .title {
    font-size: 1.8rem;
    font-weight: 600;
  }

  .icon {
    transition: all .2s cubic-bezier(0.075, 0.82, 0.165, 1);
  }

  .rotated {
    transform: rotate(180deg);
  }
</style>