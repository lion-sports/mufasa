<script lang="ts">
	import LabelAndTextfield from "../common/LabelAndTextfield.svelte"
	import TipTapEditor from "../common/TipTapEditor.svelte"
	import MediaImageUpload from "../media/MediaImageUpload.svelte"
	import type { PlaceState } from "@/lib/services/places/places.svelte"
	import type { Place } from "@/lib/services/places/places.service"
	import PlacesMediaService from "@/lib/services/media/placesMedia.service"


  type Props = {
    placeState: PlaceState
  }

  let {
    placeState = $bindable()
  }: Props = $props()

  let dirtyValues: (keyof Place)[] = $state([])

  async function getBlob(params: { mediaId: number }): Promise<Blob | undefined> {
    let service = new PlacesMediaService({ fetch })
    return await service.getBlob(params)
  }
</script>

<div class="@container">
  <div class="flex flex-col gap-3 w-full">
    <div class="flex justify-center">
      <MediaImageUpload
        mediaId={placeState.place.coverId}
        bind:files={placeState.place.cover}
        noImageText=""
        --media-image-upload-border-radius="8px"
        --media-image-upload-width="100%"
        --media-image-upload-background-color="rgb(var(--global-color-primary-500),.5)"
        fetchBlob={getBlob}
      ></MediaImageUpload>
    </div>
    <div class="flex justify-center mb-4">
    </div>
    <div>
      <LabelAndTextfield
        label="Nome *"
        bind:value={placeState.place.name}
        name="name"
        --simple-textfield-width="100%"
        --simple-textfield-hint-margin-left="4px"
        error={dirtyValues.includes('name') && placeState.validationData.name?.error}
        hint={dirtyValues.includes('name') ? placeState.validationData.name?.message : undefined}
        oninput={() => {
          dirtyValues.push('name')
        }}
      ></LabelAndTextfield>
    </div>
    <div>
      <LabelAndTextfield
        label="Indirizzo"
        bind:value={placeState.place.address}
        name="address"
        --simple-textfield-width="100%"
        --simple-textfield-hint-margin-left="4px"
        error={dirtyValues.includes('address') && placeState.validationData.address?.error}
        hint={dirtyValues.includes('address') ? placeState.validationData.address?.message : undefined}
        oninput={() => {
          dirtyValues.push('address')
        }}
      ></LabelAndTextfield>
    </div>
    <div>
      <div class="font-medium mt-4 mb-2 ml-2">Descrizione</div>
      <TipTapEditor
        bind:content={placeState.place.description}
      ></TipTapEditor>
    </div>
  </div>
</div>