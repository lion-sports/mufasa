<script lang="ts">
  import type { PageData } from './$types';
	import BookingsCalendarWithSidebar from '@/lib/components/bookings/BookingsCalendarWithSidebar.svelte'

  let { data }: { data: PageData } = $props();
</script>

<div class="mt-4">
  <BookingsCalendarWithSidebar
    club={data.club}
    places={data.club.places}
    bookings={data.paginatedBookings.data}
    canUpdate={false}
  ></BookingsCalendarWithSidebar>
</div>