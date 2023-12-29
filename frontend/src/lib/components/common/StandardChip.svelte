<script lang="ts">

  export let close: boolean = false,
    closeIcon: string = "mdi-close",
    text: string | undefined = undefined,
    fontWeight: number | undefined = undefined

  import { Chip } from '@likable-hair/svelte'
</script>

<Chip
  label
  {close}
  {closeIcon}
  on:click
  on:close
>
  <div
    style:min-height="30px"
    style:display="flex"
    style:align-items="center"
    style:font-weight={fontWeight}
  >
    <slot>
      {text}
    </slot>
  </div>
</Chip>