import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { User } from '../auth/auth.service'

export type Reward = {
	solanaPublicKey: string
	amount: number
}
export default class SolanaService extends FetchBasedService {
	public async reward(params: Reward) {
		if (!params.solanaPublicKey) throw new Error('solanaPublicKey must be defined')

		let response = await this.client.post({
			url: '/solana/reward',
			body: {
				solanaPublicKey: params.solanaPublicKey,
				amount: params.amount
			}
		})
	}
}
