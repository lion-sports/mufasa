<script lang="ts">
  import { Textarea } from "@likable-hair/svelte"

  export let label: string = "",
    placeholder: string = "",
    value: string = ""
</script>

<Textarea
  label={label}
  placeholder={placeholder}
  bind:value={value}
  backgroundColor="transparent"
  paddingBottom="8px"
  paddingTop="6px"
  paddingRight="10px"
  paddingLeft="10px"
  fontSize="1rem"
  width="90%"
  height="130px"
  focusedBoxShadow="rgb(149 157 165 / 20%) 2px 2px 10px"
  on:input
></Textarea>
