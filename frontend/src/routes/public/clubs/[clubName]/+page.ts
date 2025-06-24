import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  throw redirect(302, `/public/clubs/${params.clubName}/general`)
}) satisfies PageLoad;