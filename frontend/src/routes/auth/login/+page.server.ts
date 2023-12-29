import AuthService from '$lib/services/auth/auth.service';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, cookies }) => {
  let service = new AuthService({ fetch, cookies })
  if(!!service.authToken) {
    let error: boolean = false
    try {
      await service.me()
    } catch(error) {
      await service.deleteTokenCoockie()
      error = true
    }

    if(!error) throw redirect(302, '/')
  } 
  else return { }
}) satisfies PageServerLoad;