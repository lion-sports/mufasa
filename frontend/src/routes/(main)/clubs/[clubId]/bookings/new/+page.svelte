<script lang="ts">
	import PageTitle from '@/lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
  import { addErrorToast } from '@/lib/components/ui/sonner';
	import { goto } from '$app/navigation'
	import { BookingState } from '@/lib/services/bookings/bookings.svelte'
	import BookingService from '@/lib/services/bookings/bookings.service'
	import BookingForm from '@/lib/components/bookings/BookingForm.svelte'

  let { data }: { data: PageData } = $props();

  let bookingState = $state(new BookingState()),
    loading: boolean = $state(false)

  async function handleCreate() {
    if(!bookingState.validatedBooking) return

    loading = true
    let service = new BookingService({ fetch })
    try {
      await service.request({
        ...bookingState.validatedBooking,
      })

      goto(`/clubs/${data.club.id}/bookings`)
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
  title="Nuova prenotazione"
  prependVisible
  prependRoute={`/clubs/${data.club.id}/bookings`}
></PageTitle>

<div class="flex justify-center">
  <div style:max-width="min(100vw,800px)" class="w-full">
    <div>
      <BookingForm
        bind:bookingState={bookingState}
        places={data.club.places}
      ></BookingForm>
    </div>
    <div class="flex flex-col gap-2 w-full mt-4">
      <div class="w-full">
        <StandardButton
          --button-width="100%"
          on:click={handleCreate}
          {loading}
          disabled={!bookingState.isValid}
        >
          <span class="mr-2">
            Crea
          </span>
          <Icon name="mdi-arrow-right"></Icon>
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
