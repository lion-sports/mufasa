<script lang="ts">
  import StandardButton from "$lib/components/common/StandardButton.svelte";
  import { Icon } from "@likable-hair/svelte";

  export let loading: boolean = false,
    disabled: boolean = false,
    icon: string,
    iconSize: number = 12,
    type: 'impact' | 'standard' = 'impact'
</script>

<StandardButton 
  on:click 
  loading={loading}
  disabled={disabled}
  type={type}
>
  <Icon name={icon} size={iconSize}></Icon>
  <span 
    style:margin-left="8px"
  >
    <slot></slot>
  </span>
</StandardButton>