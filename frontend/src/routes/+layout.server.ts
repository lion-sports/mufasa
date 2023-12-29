import AuthService from '$lib/services/auth/auth.service';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ fetch, cookies, url }) => {
  let service = new AuthService({ fetch, cookies })

  let fetchedUser
  if(url.pathname != '/auth/login') {
    try {
      fetchedUser = await service.me()
    } catch(error) {
      await service.deleteTokenCoockie()
      throw redirect(302, '/auth/login')
    }
  }

  return {
    user: fetchedUser,
    token: cookies.get('session')
  }
}) satisfies LayoutServerLoad;