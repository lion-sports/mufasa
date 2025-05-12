<script lang="ts">
	import type { Club } from "@/lib/services/clubs/clubs.service"
	import { Icon } from "@likable-hair/svelte"
  import { SPORT_ICON } from "@/lib/services/sport";
	import { DateTime } from "luxon"
	import SportChip from "../common/SportChip.svelte"
	import ClubsMediaService from "@/lib/services/media/clubsMedia.service"
  import MediaImage from "../media/MediaImage.svelte";

  type Props = {
    club: Club
  }

  let {
    club
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

<div class="flex flex-col gap-2 @container">
  <div class="rounded bg-[rgb(var(--global-color-primary-500))] flex w-full h-[160px] justify-center items-center overflow-hidden">
    {#if !!club.headerMediaId}
      <MediaImage
        mediaId={club.headerMediaId}
        --media-image-width="100%"
        --media-image-height="100%"
        thumbnail
        {fetchBlob}
      ></MediaImage>
    {:else}
      <Icon 
        name={!!club.sport ? SPORT_ICON[club.sport] : 'mdi-account-multiple'} 
        --icon-color="rgb(var(--global-color-primary-foreground))"
        --icon-size="40px"
      ></Icon>
    {/if}
  </div>
  <div class="flex">
    <div class="grow flex flex-col">
      <div class="text-lg font-semibold">{club.completeName}</div>
      <div class="text-sm font-thin">@{club.name}</div>
    </div>
    <div class="flex flex-col">
      <div class="text-sm opacity-50">Dal {DateTime.fromJSDate(club.createdAt).get('year')}</div>
    </div>
  </div>
  {#if !!club.sport}
    <div class="flex">
      <SportChip sport={club.sport}></SportChip>
    </div>
  {/if}
  <!-- <div class="prose dark:prose-invert h-[160px] overflow-hidden relative">
    <div class="absolute bottom-0 left-0 right-0 h-[80px] gradient"></div>
    <div class="flex absolute bottom-0 left-0 right-0 justify-center items-center">
      <button class="rounded-full bg-[rgb(var(--global-color-primary-500))] px-3 py-1 text-[rgb(var(--global-color-primary-foreground))] text-xs">Visualizza</button>
    </div>
    {@html club.bio}
  </div> -->
</div>

<style>
  .gradient {
    background: linear-gradient(to bottom, transparent, rgb(var(--global-color-background-100)));
  }
</style>