import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import AuthService from '$lib/services/auth/auth.service';

export const GET: RequestHandler = async ({ fetch, cookies }) => {
  let service = new AuthService({ fetch, cookies })

  try {
    await service.deleteTokenCoockie()
  } catch (error) {
    return json({ success: false })
  }

  return json({ success: true })
};