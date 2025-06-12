import type { User } from "../auth/auth.service"
import type { Club } from "../clubs/clubs.service"
import type { Group } from "../groups/groups.service"

export type Member = {
	id: number
  alias: string
  fullname?: string
  userId: number
  user: User
  clubId: number
  club: Club
  groupId?: number
  group?: Group
	createdAt: Date
	updatedAt: Date
}