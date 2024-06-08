import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Teammate } from '$lib/services/teams/teams.service'
import type { User } from '../auth/auth.service';
import type { Player } from '../scouts/scouts.service';

export default class TeammatesService extends FetchBasedService {
	public async update(params: { id: number; alias?: string; groupId?: number }): Promise<Teammate> {
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

  public static getTeammateName(params: {
    teammate: {
      alias?: Teammate['alias'],
      user: {
        firstname: User['firstname'],
        lastname: User['lastname']
      }
    },
    player?: {
      aliases?: Player['aliases']
    }
  }): string {
    let fullnameFromTeammate = [params.teammate.user.firstname, params.teammate.user.lastname].filter(v => !!v).join(' ')
    let aliasFromTeammate = params.teammate.alias
    return aliasFromTeammate || fullnameFromTeammate
  }
}