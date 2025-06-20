<script lang="ts">
	import type { Club } from "@/lib/services/clubs/clubs.service"
	import { Icon } from "@likable-hair/svelte"
  import MediaImage from "../media/MediaImage.svelte";
	import ClubsMediaService from "@/lib/services/media/clubsMedia.service"
	import PageTitle from "../common/PageTitle.svelte"
	import type { ComponentProps } from "svelte"

  type Props = {
    club: Club,
    prependVisible?: boolean,
    prependRoute?: string,
    append?: ComponentProps<typeof PageTitle>['append']
  }

  let { 
    club,
    prependVisible = true,
    prependRoute = '/clubs',
    append
  }: Props = $props()

  async function fetchBlob({
    mediaId, 
    thumbnail
  }: {
    mediaId: number,
    thumbnail: boolean
  }) {
    let mediaService = new ClubsMediaService({ fetch })
    if(thumbnail) {
      return await mediaService.getThumbnailBlob({ mediaId })
    } else {
      return await mediaService.getBlob({ mediaId })
    }
  }
</script>


<div class="rounded h-[40vh] header-image bg-[rgb(var(--global-color-background-300))] flex justify-center items-center overflow-hidden">
  {#if !!club.headerMediaId}
    <MediaImage
      mediaId={club.headerMediaId}
      --media-image-width="100%"
      --media-image-height="100%"
      {fetchBlob}
    ></MediaImage>
  {/if}
</div>
<div class="mt-[-132px] w-full">
  <div class="flex items-center md:items-start md:justify-start md:pl-12 w-full gap-[24px] md:gap-[64px] flex-col md:flex-row">
    <div class="h-[300px] w-[300px] dark:bg-[rgb(var(--global-color-primary-700))] bg-[rgb(var(--global-color-primary-400))] rounded-full overflow-hidden">
      {#if !!club.logoMediaId}
        <MediaImage
          mediaId={club.logoMediaId}
          --media-image-width="100%"
          --media-image-height="100%"
          {fetchBlob}
        ></MediaImage>
      {:else}
        <div class="w-full h-full flex justify-center items-center">
          <Icon name="mdi-domain" --icon-size="80px" --icon-color="rgb(var(--global-color-primary-foreground))"></Icon>
        </div>
      {/if}
    </div>
    <div class="md:mt-[148px] md:flex-grow md:w-auto w-full">
      <div class="w-full">
        <PageTitle
          title={club.completeName}
          subtitle={"@" + club.name}
          {prependVisible}
          {prependRoute}
          {append}
        ></PageTitle>
      </div>
    </div>
  </div>
</div>