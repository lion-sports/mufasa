<script lang="ts">
	import BookingsCalendar from '@/lib/components/bookings/BookingsCalendar.svelte'
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="mt-4">
  <BookingsCalendar
    club={data.club}
    places={data.club.places}
    bookings={data.paginatedBookings.data}
    canUpdate={false}
  ></BookingsCalendar>
</div>