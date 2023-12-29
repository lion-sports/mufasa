<script lang="ts">
  import { Button } from "@likable-hair/svelte"
  import { createEventDispatcher } from "svelte";

  let clazz: string = '';
	export { clazz as class };

  export let loading: boolean = false,
    disabled: boolean = false

  let dispatch = createEventDispatcher<{
    'click': {
      nativeEvent: MouseEvent
    }
  }>()

  function handleClick(event: CustomEvent<{ nativeEvent: MouseEvent }>) {
    if(!disabled && !loading) dispatch('click', {
      nativeEvent: event.detail.nativeEvent
    })
  }
</script>

<Button
  on:click={handleClick}
  bind:loading={loading}
  disabled={disabled}
  class="!box-border {clazz || ''}"
>
  <div
    style:display="flex"
    style:align-items="center"
    style:justify-content="center"
    style:height="100%"
    style:font-size="1rem"
    style:white-space="nowrap"
  >
    <slot></slot>
  </div>
</Button>
