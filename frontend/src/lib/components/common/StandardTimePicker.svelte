<script lang="ts">
  import StandardTextfield from "./StandardTextfield.svelte";

  export let value: string = '',
    name: string;

</script>

<StandardTextfield
  bind:value={value}
  appendInnerIcon="mdi-clock"
  type="time"
  --simple-textfield-width="fit-content"
></StandardTextfield>