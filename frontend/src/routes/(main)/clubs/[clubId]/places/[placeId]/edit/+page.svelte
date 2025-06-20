<script lang="ts">
	import PageTitle from '@/lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
  import { addErrorToast } from '@/lib/components/ui/sonner';
	import { goto } from '$app/navigation'
	import { PlaceState } from '@/lib/services/places/places.svelte'
	import PlaceService from '@/lib/services/places/places.service'
	import PlaceForm from '@/lib/components/places/PlaceForm.svelte'

  let { data }: { data: PageData } = $props();

  let placeState = $state(new PlaceState({
      place: data.place
    })),
    loading: boolean = $state(false)

  async function handleUpdate() {
    if(!placeState.validatedPlace) return

    loading = true
    let service = new PlaceService({ fetch })
    try {
      let createdPlace = await service.update({
        id: data.place.id,
        ...placeState.validatedPlace,
      })

      if(!!placeState.validatedPlace.cover) {
        await service.uploadMedia({
          placeId: createdPlace.id,
          cover: placeState.place.cover?.[0]
        })
      }

      goto(`/clubs/${data.club.id}/places`)
    } catch(err) {
      addErrorToast({
        title: 'Operazione fallita',
        options: {
          description: 'L\'operazione non è andata a buon fine'
        }
      })
    }

    loading = false
  }
</script>

<PageTitle
  title={data.place.name}
  prependVisible
  prependRoute={`/clubs/${data.club.id}/places`}
></PageTitle>

<div class="flex justify-center">
  <div style:max-width="min(100vw,800px)" class="w-full">
    <div>
      <PlaceForm
        bind:placeState={placeState}
      ></PlaceForm>
    </div>
    <div class="flex flex-col gap-2 w-full mt-4">
      <div class="w-full">
        <StandardButton
          --button-width="100%"
          on:click={handleUpdate}
          {loading}
          disabled={!placeState.isValid}
        >
          <span class="mr-2">
            Salva
          </span>
          <Icon name="mdi-floppy"></Icon>
        </StandardButton>
      </div>
      <div class="w-full">
        <a class="w-full block p-2 text-center" href={`/clubs/${data.club.id}/places`}>
          Annulla
        </a>
      </div>
    </div>
  </div>
</div>
