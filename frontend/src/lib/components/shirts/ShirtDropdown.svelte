<script lang="ts">
	import type { Shirt } from "$lib/services/shirts/shirts.service"
  import { Autocomplete, Dropdown, Icon } from "@likable-hair/svelte";
  import { createEventDispatcher, type ComponentProps } from "svelte";
	import ShirtIcon from "./ShirtIcon.svelte"

  type Item = NonNullable<ComponentProps<Dropdown>['items']>[number]

  let dispatch = createEventDispatcher<{
    change: {
      unselect: Shirt | undefined;
      select: Shirt | undefined;
      selection: Shirt[];
    }
  }>()

  export let items: Shirt[] = [],
    values: Shirt[] = [],
    disabled: boolean = false,
    width: string | undefined = "auto",
    minWidth: string | undefined = "auto",
    menuWidth: string | undefined = "auto"

  let dropdownValues: ComponentProps<Dropdown>['items'] = []

  $: dropdownValues = values.map((e) => ({
    value: e.id,
    data: {
      shirt: e
    }
  }))

  $: dropDownItems = items.map((e) => ({
    value: e.id,
    data: {
      shirt: e
    }
  }))

  function handleChange(event: CustomEvent<{
    unselect: Item | undefined;
    select: Item | undefined;
    selection: Item[];
  }>) {
    values = event.detail.selection.map((e) => e.data.shirt)

    dispatch('change', {
      unselect: !!event.detail.unselect ? event.detail.unselect.data.shirt : undefined,
      select: !!event.detail.select ? event.detail.select.data.shirt : undefined,
      selection: values
    })
  }
</script>

<Autocomplete
  items={dropDownItems}
  placeholder=""
  bind:disabled
  bind:values={dropdownValues}
  on:change={handleChange}
  {width}
  {minWidth}
  {menuWidth}
  mobileDrawer
>
  <svelte:fragment slot="selection-container" let:openMenu let:handleKeyDown let:values>
    <button
      class="unstyled-button"
      on:click={openMenu}
      on:keydown={(event) => {
        handleKeyDown(event)
        if(event.key == 'ArrowDown' || event.key == 'ArrowUp') {
          event.stopPropagation()
          event.preventDefault()
        }
      }}
    >
      {#if values.length == 1}
        <ShirtIcon 
          primaryColor={values[0].data.shirt.primaryColor}
          secondaryColor={values[0].data.shirt.secondaryColor}
          number={values[0].data.shirt.number}
        ></ShirtIcon>
      {:else}
        <ShirtIcon 
          primaryColor="transparent"
          secondaryColor="transparent"
          number={undefined}
        ></ShirtIcon>
      {/if}
    </button>
  </svelte:fragment>
  <svelte:fragment slot="item-label" let:item>
    <div class="label-container">
      <ShirtIcon 
        primaryColor={item.data.shirt.primaryColor}
        secondaryColor={item.data.shirt.secondaryColor}
        number={item.data.shirt.number}
      ></ShirtIcon>
      <div>{item.data.shirt.name || ''}</div>
    </div>
  </svelte:fragment>
</Autocomplete>

<style>
  .label-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
</style>