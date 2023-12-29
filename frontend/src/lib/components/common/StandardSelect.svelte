<script lang="ts" context="module">
  export type Option = {
    value: string | number | undefined,
    text: string
  };
</script>

<script lang="ts">
  export let options: Option[],
    value: string | number | undefined = undefined,
    disabled: boolean = false;
</script>

<select
  bind:value={value}
  on:change
  class="select"
  style:color="rgb(var(--global-color-contrast-900))"
  style:background-color="transparent"
  style:border-radius="5px"
  style:border="1px solid rgb(var(--global-color-contrast-900), .3)"
  style:font-family = "inherit"
  style:font-size = "inherit"
  style:padding-left="5px"
  style:padding-right="5px"
  disabled={disabled}
>
  {#each options as option}
    <option value={option.value} style:padding="10px">
      {option.text}
    </option>
  {/each}
</select>

<style>
  .select {
    height: 35px;
    width: 100%;
    color: var(--global-contrast-color);
    background-color: var(--global-background-color);
    border-color: var(--global-thin-contrast-color);
  }

  .select:focus {
    outline: none;
  }
</style>