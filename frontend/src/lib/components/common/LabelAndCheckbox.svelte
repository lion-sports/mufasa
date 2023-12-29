<script lang="ts">
  import StandardCheckbox from "$lib/components/common/StandardCheckbox.svelte";

  export let label: string,
    id: string,
    value: boolean = false,
    disabled: boolean = false
</script>


<div class="container">
  <StandardCheckbox
    bind:value={value}
    id={id}
    on:change
    disabled={disabled}
  ></StandardCheckbox>
  <label
    style:margin-left="0.7rem"
    for={id}>{label}
  </label>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
  }
</style>