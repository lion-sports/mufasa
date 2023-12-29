import type { RequestHandler } from '../$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
  const dark: boolean = url.searchParams.get('dark') == 'true'
  const theme = dark ? 'dark' : 'light'
  cookies.set('theme', theme, {
    httpOnly: true,
    path: '/'
  })
  return new Response();
};