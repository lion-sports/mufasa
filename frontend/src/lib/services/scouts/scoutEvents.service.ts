import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { VolleyballScoutEventParameters } from './volleyball'

export default class ScoutEventsService extends FetchBasedService {
  public async add(params: {
    event: VolleyballScoutEventParameters
  }): Promise<void> {
    let response = await this.client.post({
      url: `/scouts/${params.event.scoutId}/events/add`,
      body: params
    })

    return response
  }
}
