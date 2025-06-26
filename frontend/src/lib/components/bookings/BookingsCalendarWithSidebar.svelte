<script lang="ts">
	import type { ComponentProps } from "svelte"
	import BookingsCalendar from "./BookingsCalendar.svelte"
	import { DateTime } from "luxon"
	import BookingService from "@/lib/services/bookings/bookings.service"
	import { Icon, MediaQuery } from "@likable-hair/svelte"

  type Props = {
    selectedDate?: ComponentProps<typeof BookingsCalendar>['selectedDate']
    selectedView?: ComponentProps<typeof BookingsCalendar>['selectedView']
    bookings?: ComponentProps<typeof BookingsCalendar>['bookings']
  } & ComponentProps<typeof BookingsCalendar>

  let {
    selectedDate = $bindable(),
    selectedView = $bindable('dayGridMonth'),
    bookings = $bindable(),
    ...restProps
  }: Props = $props()

  let currentDateBookings = $derived(bookings.filter((b) => {
    if(!selectedDate) return false
    let luxonReference = DateTime.fromJSDate(selectedDate)

    let startOfDateMillis = luxonReference.startOf('day').toMillis()
    let endOfDateMillis = luxonReference.endOf('day').toMillis()
    let currentBookingsFromMillis = DateTime.fromJSDate(b.from).toMillis()
    return startOfDateMillis <= currentBookingsFromMillis && currentBookingsFromMillis <= endOfDateMillis
  }))
</script>


<MediaQuery>
  {#snippet defaultSnippet({ mAndUp })}
    <div 
      class="w-full h-full grid grid-cols-12"
    >
      {#if mAndUp || !selectedDate || selectedView !== 'dayGridMonth'}
        <div 
          class:full-calendar-container={!selectedDate || selectedView !== 'dayGridMonth'}
          class:half-calendar-container={!!selectedDate && selectedView === 'dayGridMonth'}
        >
          <BookingsCalendar
            bind:selectedDate
            bind:selectedView
            bind:bookings
            availableViews={[]}
            {...restProps}
          ></BookingsCalendar>
        </div>
      {/if}
      {#if !!selectedDate && selectedView == 'dayGridMonth'}
        <div class="col-span-12 md:col-span-4 p-4">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between gap-2">
              <div class="text-2xl font-semibold">
                {DateTime.fromJSDate(selectedDate).setLocale('it-IT').toLocaleString(DateTime.DATE_MED)}
              </div>
              <button class="text-left" onclick={() => {
                selectedDate = undefined
              }}>
                <Icon name="mdi-close"></Icon>
              </button>
            </div>
            {#if currentDateBookings.length > 0}
              {#each currentDateBookings as booking}
                {@const colorInfo = BookingService.getBookingColor(booking)}
                <button
                  class="rounded p-2 text-left"
                  style:background-color={colorInfo.background}
                  style:color={colorInfo.foreground}
                  onclick={() => {
                    if(!!restProps.bookingClick) {
                      restProps.bookingClick({ booking })
                    }
                  }}
                >
                  <div class="text-xs">
                    {DateTime.fromJSDate(booking.from).toFormat("HH:mm")}
                    -
                    {DateTime.fromJSDate(booking.to).toFormat("HH:mm")}
                  </div>
                  <div class="text-xl font-semibold">{booking.place.name}</div>
                  {#if restProps.canUpdate && !!booking.notes}            
                    <div class="whitespace-pre-line break-all">{booking.notes}</div>
                  {/if}
                </button>
              {/each}
            {:else}
              <div class="w-full flex justify-center items-center h-[200px] text-xs">Nessuna prenotazione</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/snippet}
</MediaQuery>

<style>
  @media (max-width: 767.98px){
    .full-calendar-container {
      grid-column: span 12 / span 12;
    }

    .half-calendar-container {
      grid-column: span 12 / span 12;
    }
  }

  @media (min-width: 768px){
    .full-calendar-container {
      grid-column: span 12 / span 12;
    }

    .half-calendar-container {
      grid-column: span 8 / span 8;
    }
  }
</style>