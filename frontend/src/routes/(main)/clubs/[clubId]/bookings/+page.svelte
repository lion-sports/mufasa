<script lang="ts">
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
  import type { PageData } from './$types';
  import BookingsCalendar from '@/lib/components/bookings/BookingsCalendar.svelte';
	import { Icon } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'

  let { data }: { data: PageData } = $props();
</script>

<div class="my-2 flex justify-end">
  <StandardButton
    href={`/clubs/${data.club.id}/bookings/new`}
  >
    <span class="mr-2">
      <Icon name="mdi-plus"></Icon>
    </span>
    Aggiungi
  </StandardButton>
</div>

<BookingsCalendar
  club={data.club}
  places={data.club.places}
  bookings={data.paginatedBookings.data}
  bookingClick={({ booking }) => {
		goto(`/clubs/${data.club.id}/bookings/${booking.id}/edit`)
  }}
></BookingsCalendar>