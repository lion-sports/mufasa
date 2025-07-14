import BookingService from '@/lib/services/bookings/bookings.service';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, parent, params }) => {
  let parentData = await parent()

  let service = new BookingService({ fetch, token: parentData.token })
  let booking = await service.get({ id: Number(params.bookingId) })

  return {
    booking
  };
}) satisfies PageLoad;