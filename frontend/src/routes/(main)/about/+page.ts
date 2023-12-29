import type { PageLoad } from './$types';
import AuthService from '$lib/services/auth/auth.service';

export const load = (async ({ fetch, parent }) => {
  let { token } = await parent()

  let service = new AuthService({ fetch, token })
  let currentUser = await service.me()

  return {
    email: currentUser.email
  };
}) satisfies PageLoad;