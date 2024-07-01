import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { User } from '../auth/auth.service'

export type Reward ={
  username: string
  password: string
}
export default class SolanaService extends FetchBasedService {
	public async reward(params: Reward) {
		if (!params.username) throw new Error('username must be defined')

		let response = await this.client.post({
			url: '/rewardLionToken',
			body: {
				username: params.username,
				password: params.password
			}
		})
	}
}
