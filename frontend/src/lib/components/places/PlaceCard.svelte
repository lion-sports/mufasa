<script lang="ts">
	import type { Club } from "@/lib/services/clubs/clubs.service"
	import { Icon } from "@likable-hair/svelte"
  import { SPORT_ICON } from "@/lib/services/sport";
	import { DateTime } from "luxon"
	import SportChip from "../common/SportChip.svelte"
	import ClubsMediaService from "@/lib/services/media/clubsMedia.service"
  import MediaImage from "../media/MediaImage.svelte";
	import type { Place } from "@/lib/services/places/places.service"
	import PlacesMediaService from "@/lib/services/media/placesMedia.service"

  type Props = {
    place: Place
  }

  let {
    place
  }: Props = $props()

  async function fetchBlob({
    mediaId, 
    thumbnail
  }: {
    mediaId: number,
    thumbnail: boolean
  }) {
    let mediaService = new PlacesMediaService({ fetch })
    if(thumbnail) {
      return await mediaService.getThumbnailBlob({ mediaId })
    } else {
      return await mediaService.getBlob({ mediaId })
    }
  }
</script>

<div class="flex flex-col gap-2 @container">
  <div class="rounded bg-[rgb(var(--global-color-primary-500))] flex w-full h-[160px] justify-center items-center overflow-hidden">
    {#if !!place.coverId}
      <MediaImage
        mediaId={place.coverId}
        --media-image-width="100%"
        --media-image-height="100%"
        thumbnail
        {fetchBlob}
      ></MediaImage>
    {:else}
      <Icon 
        name="mdi-domain"
        --icon-color="rgb(var(--global-color-primary-foreground))"
        --icon-size="40px"
      ></Icon>
    {/if}
  </div>
  <div class="flex">
    <div class="grow flex flex-col">
      <div class="text-lg font-semibold">{place.name}</div>
      <div class="text-sm font-thin">{@html place.description}</div>
    </div>
    <div class="flex flex-col">
      <div class="text-sm opacity-50">Dal {DateTime.fromJSDate(place.createdAt).get('year')}</div>
    </div>
  </div>
</div>