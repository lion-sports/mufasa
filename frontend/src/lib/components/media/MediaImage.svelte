<script lang="ts">
	import { onMount } from "svelte"
  import MediaService from "$lib/services/media/media.service";

  export let mediaId: number | undefined = undefined,
    alt: string = 'media image',
    thumbnail: boolean = false,
    fetchBlob: (params: { mediaId: number, thumbnail: boolean }) => Promise<Blob | undefined>

  let mounted: boolean = false,
    loaded: boolean = false,
    url: string | undefined = undefined

  onMount(() => {
    mounted = true
  })

  $: if(mounted && !!mediaId) {
    fetchBlob(({ mediaId, thumbnail })).then((blob) => {
      if (!blob) return
        url = URL.createObjectURL(blob)
        loaded = true
    })
  }
</script>

<img
  src={url}
  {alt}
  class="media-image"
>

<style>
  .media-image {
    height: var(--media-image-height, 100px);
    width: var(--media-image-width, 100px);
    object-fit: cover;
  }
</style>