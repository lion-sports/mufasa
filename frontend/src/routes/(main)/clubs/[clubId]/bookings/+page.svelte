<script lang="ts">
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
  import type { PageData } from './$types';
	import { Icon } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'
	import BookingsCalendarWithSidebar from '@/lib/components/bookings/BookingsCalendarWithSidebar.svelte'

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

<BookingsCalendarWithSidebar
  club={data.club}
  places={data.club.places}
  bookings={data.paginatedBookings.data}
  bookingClick={({ booking }) => {
		goto(`/clubs/${data.club.id}/bookings/${booking.id}/edit`)
  }}
></BookingsCalendarWithSidebar>