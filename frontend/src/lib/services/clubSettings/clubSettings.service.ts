import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { User } from '../auth/auth.service'
import type { Club } from '../clubs/clubs.service'

export const CLUB_SETTING_KEYS = [
  'bookingsActive',
  'bookingsConfirmationRequired',
] as const
export type ClubSettingKey = typeof CLUB_SETTING_KEYS[number]
type ClubSettingStructure = {
  [Key in ClubSettingKey]?: ClubSettingStructureDefinition[Key] | undefined | null
}
export type ClubSettingStructureDefinition = {
  bookingsActive: boolean,
  bookingsConfirmationRequired: boolean
}

export type ClubSetting = {
  id: number
  settings: ClubSettingStructure
  clubId: number
  club: Club
  createdAt: Date
  updatedAt: Date
}

export default class ClubSettingService extends FetchBasedService {
  public async set<Key extends ClubSettingKey>(params: {
    clubId: number,
    key: Key,
    value: ClubSettingStructureDefinition[Key]
	}): Promise<ClubSetting> {
		let response = await this.client.post({
			url: '/clubSettings/set',
			body: params
		})

		return response
	}

  public async get<Key extends ClubSettingKey>(params: {
    clubId: number,
    key: Key,
  }): Promise<ClubSettingStructureDefinition[Key]> {
    let response = await this.client.get({
      url: '/clubSettings/get',
      params: params
    })

    return response
  }
}
