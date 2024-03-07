import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Teammate } from '$lib/services/teams/teams.service'

export default class TeammatesService extends FetchBasedService {

	public async update(params: { id: number; alias?: string; roleId?: number }): Promise<Teammate> {
		let response = await this.client.put({
			url: '/teammates/' + params.id,
			body: params
		})

		return response
	}

  public async mostAbsenceForTeammates(): Promise<{
    team: {
      id: number,
      name: string
    }
    teammate: {
      id: number,
      alias: string
    }
    user: {
      email: string
      firstname?: string
      lastname?: string
    }
    absenceCount: number
  }[]> {
    let response = await this.client.get({
      url: '/teammates/mostAbsenceForTeammates',
    })

    return response
  }
}
