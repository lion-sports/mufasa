import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { User } from '../auth/auth.service'

export const USER_SETTINGS_KEY = ['clubsSectionVisible'] as const
export type UserSettingKey = typeof USER_SETTINGS_KEY[number]
type UserSettingStructure = {
  [Key in UserSettingKey]: UserSettingStructureDefinition[Key] | undefined | null
}
export type UserSettingStructureDefinition = {
  clubsSectionVisible: boolean
}

export type UserSetting = {
  id: number
  settings: UserSettingStructure
  userId: number
  user: User
  createdAt: Date
  updatedAt: Date
}

export default class UserSettingService extends FetchBasedService {
  public async set<Key extends UserSettingKey>(params: {
    key: Key,
    value: UserSettingStructureDefinition[Key]
	}): Promise<UserSetting> {
		let response = await this.client.post({
			url: '/userSettings/set',
			body: params
		})

		return response
	}

  public async get<Key extends UserSettingKey>(params: {
    key: Key,
  }): Promise<UserSettingStructureDefinition[Key]> {
    let response = await this.client.get({
      url: '/userSettings/get',
      params: params
    })

    return response
  }
}
