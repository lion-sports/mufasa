import ClubsService from '@/lib/services/clubs/clubs.service'
import type { LayoutLoad } from './$types'
import GroupsService from '@/lib/services/groups/groups.service'

export const load = (async ({ params, parent, fetch, depends }) => {
  depends('club:detail')
	let parentData = await parent()

	let service = new ClubsService({ fetch, token: parentData.token })
	let club = await service.get({ id: Number(params.clubId) })

	let currentMember = club.members?.find((m) => m.userId == parentData.user?.id)
	const isOwner = !!club.ownerId && !!parentData.user && club.ownerId == parentData.user.id

	let groupedPermissions = GroupsService.getGroupedPermissions({
		owner: isOwner,
		group: currentMember?.group
	})

	return {
		club,
		groupedPermissions,
		isOwner
	}
}) satisfies LayoutLoad
