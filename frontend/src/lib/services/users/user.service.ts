import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import { FilterBuilder } from '@likable-hair/svelte'
import type { User } from '../auth/auth.service'

export default class UserService extends FetchBasedService {
	public async search(params: { searchText: string, perPage?: number }): Promise<User[]> {
    if (!params.searchText) throw new Error('searchText must be defined')

    let filtersBuilder = new FilterBuilder()
    filtersBuilder.where('email', 'ILIKE', `%${params.searchText}%`)

		let response = await this.client.get({
			url: '/users',
			params: {
        filtersBuilder: filtersBuilder.toJson(),
        perPage: params.perPage
			}
		})

		return response.data
	}
}
