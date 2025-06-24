<script lang="ts">
	import type { Place } from "@/lib/services/places/places.service"
	import type { BookingState } from "@/lib/services/bookings/bookings.svelte"
	import StandardDatepicker from "../common/StandardDatepicker.svelte"
	import StandardTimePicker from "../common/StandardTimePicker.svelte"
	import { DateTime } from "luxon"
	import PlacesAutocomplete from "../places/PlacesAutocomplete.svelte"

  type Props = {
    bookingState: BookingState,
    places?: Place[]
  }

  let {
    bookingState = $bindable(),
    places = []
  }: Props = $props()

  let dirtyValues: (keyof Place)[] = $state([])

  let formattedFrom: string | undefined = $derived.by(() => {
    return !!bookingState.booking.from ? 
      DateTime.fromJSDate(bookingState.booking.from).toFormat('HH:mm') : 
      undefined
  })

  let formattedTo: string | undefined = $derived.by(() => {
    return !!bookingState.booking.to ? 
      DateTime.fromJSDate(bookingState.booking.to).toFormat('HH:mm') : 
      undefined
  })

  function handleFromTimeChange(e: Event) {
    // @ts-ignore
    let stringValue = e.target?.value

    if (!bookingState.booking.from) bookingState.booking.from = new Date()

    bookingState.booking.from = DateTime.fromJSDate(bookingState.booking.from)
			.set({
				hour: stringValue.split(':')[0],
				minute: stringValue.split(':')[1]
			})
			.toJSDate()
  }

  function handleToTimeChange(e: Event) {
    // @ts-ignore
    let stringValue = e.target?.value

    if (!bookingState.booking.to) bookingState.booking.to = new Date()

    bookingState.booking.to = DateTime.fromJSDate(bookingState.booking.to)
			.set({
				hour: stringValue.split(':')[0],
				minute: stringValue.split(':')[1]
			})
			.toJSDate()
  }

  function handleSelectPlace(e: {
    detail: {
      selection: {
        value: string | number,
        data?: {
          place: Place
        }
      }[]
    }
  }) {
    let selectedPlace = e.detail.selection[0]?.data?.place
    if(!!selectedPlace) {
      bookingState.booking.place = selectedPlace
      bookingState.booking.placeId = selectedPlace?.id
    } else {
      bookingState.booking.place = undefined
      bookingState.booking.placeId = undefined
    }
  }
</script>

<div class="@container">
  <div class="flex flex-col gap-3 w-full">
    <div class="grid grid-cols-1 md:grid-cols-2 duration-infos gap-2">
      <div>
        <div class="mb-2">Inizio</div>
        <div class="flex gap-2">
          <div class="grow">
            <StandardDatepicker placeholder="Inizio" bind:value={bookingState.booking.from} --simple-textfield-width="100%" />
          </div>
          <div>
            <StandardTimePicker value={formattedFrom} name="from-time" oninput={handleFromTimeChange} />
          </div>
        </div>
      </div>
      <div>
        <div class="mb-2">Fine</div>
        <div class="flex gap-2">
          <div class="grow">
            <StandardDatepicker placeholder="Fine" bind:value={bookingState.booking.to} --simple-textfield-width="100%" />
          </div>
          <div>
            <StandardTimePicker value={formattedTo} name="to-time" oninput={handleToTimeChange} />
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="font-medium mt-4 mb-2 ml-2">Campo o palestra</div>
      <PlacesAutocomplete
        {places}
        values={!!bookingState.booking.place ? [ bookingState.booking.place ] : undefined}
        onchange={handleSelectPlace}
      ></PlacesAutocomplete>
    </div>
  </div>
</div>