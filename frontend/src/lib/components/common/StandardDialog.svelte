<script lang="ts">
  export let open: boolean = false,
    title: string | undefined = undefined,
    titlePadding: string = "10px",
    bodyPadding: string = "10px",
    cardPadding: string | undefined = undefined,
    footerPadding: string = "10px",
    width: string | undefined = undefined,
    height: string | undefined = "auto"

  import { Dialog } from "@likable-hair/svelte"
  import StandardCard from "$lib/components/common/StandardCard.svelte"
  import Subtitle from "$lib/components/common/Subtitle.svelte";
</script>

<Dialog
  bind:open={open}
  overlayOpacity="60%"
>
  <StandardCard
    height={height}
    padding={cardPadding}
    maxHeight="90vh"
    width={width}
  >
    <div
      slot="header"
      style:padding={titlePadding}
    >
      <slot name="header">
        <Subtitle subtitle={title}></Subtitle>
      </slot>
    </div>
    <div
      style:padding={bodyPadding}
    >
      <slot></slot>
    </div>
    <div
      slot="footer"
      style:padding={footerPadding}
    >
      <slot name="footer"></slot>
    </div>
  </StandardCard>
</Dialog>