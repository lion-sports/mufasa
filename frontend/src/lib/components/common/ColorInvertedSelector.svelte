<script lang="ts" context="module">
  export type Option = {
    label: string,
    name: string
  }
</script>

<script lang="ts">
  import { Icon } from "@likable-hair/svelte";
  import { createEventDispatcher } from "svelte";

  let dispatch = createEventDispatcher<{
    'select': {
      option: Option,
      selectedIndex: number
    },
    'delete': {
      option: Option,
      index: number
    }
  }>()

  export let options: Option[],
    selectedIndex: number


  function handleOptionClick(option: Option, index: number) {
    dispatch('select', {
      option: option,
      selectedIndex
    })
    
    selectedIndex = index
  }

  function handleClickClose(option: Option, index: number) {
    dispatch('delete', {
      option: option,
      index: index
    })
  }
</script>

<div class="selector-container">
  {#each options as option, index}
    <div
      class="element"
      class:selected={selectedIndex == index}
      on:click={() => handleOptionClick(option, index)}
      on:keydown={() => { }}
    >
      <div>{option.name}</div>
      <div
        on:click|stopPropagation={() => { }}
        on:keydown={() => { }}
      >
        <Icon
          name="mdi-close"
          click
          on:click={() => handleClickClose(option, index)}
          on:keydown={() => { }}
        ></Icon>
      </div>
    </div>
  {/each}
</div>

<style>
  .selector-container {
    background-color: var(--global-thin-contrast-color);
    border-radius: 5px;
    padding: 10px 10px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .element {
    padding: 5px 5px 5px 10px;
    cursor: pointer;
    transition: all .1s ease-in;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .selected {
    color: var(--global-background-color);
    background-color: var(--global-primary-color);
    font-weight: 700;
  }
</style>