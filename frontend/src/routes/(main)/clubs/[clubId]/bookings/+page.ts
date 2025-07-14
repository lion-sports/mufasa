import BookingService from '@/lib/services/bookings/bookings.service';
import type { PageLoad } from './$types';
import { FilterBuilder } from '@likable-hair/svelte';
import { DateTime } from 'luxon';

export const load = (async ({ fetch, parent }) => {
  let parentData = await parent()

  let start = DateTime.now().startOf('month').toJSDate(),
    end = DateTime.now().startOf('month').toJSDate()

  let filtersBuilder = new FilterBuilder()
  filtersBuilder.where('from', '>=', start)
    .where('from', '<=', end)

  let service = new BookingService({ fetch, token: parentData.token })
  let paginatedBookings = await service.list({
    page: 1,
    perPage: 500,
    filtersBuilder
  })

  return {
    paginatedBookings
  };
}) satisfies PageLoad;