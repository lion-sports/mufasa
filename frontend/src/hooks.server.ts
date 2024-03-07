import type { Handle } from '@sveltejs/kit'
export const handle = (async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			html = html.replace('%theme%', event.cookies.get('theme') || '')
			return html
		}
	})

	return response
}) satisfies Handle
