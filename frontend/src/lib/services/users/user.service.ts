import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { User } from '../auth/auth.service'

export default class UserService extends FetchBasedService {
	public async search(params: { email: string }): Promise<User[]> {
		if (!params.email) throw new Error('email must be defined')

		let response = await this.client.get({
			url: '/users',
			params: {
				filters: {
					email: params.email
				}
			}
		})

		return response.data
	}
}
