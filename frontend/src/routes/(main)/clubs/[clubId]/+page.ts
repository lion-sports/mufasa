import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  throw redirect(302, `/clubs/${params.clubId}/general`)
}) satisfies PageLoad;