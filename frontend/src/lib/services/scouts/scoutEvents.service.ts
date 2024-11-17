import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { VolleyballScoutEventParameters } from './volleyball'
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';

let subject = new Subject<{
  event: VolleyballScoutEventParameters,
  service: ScoutEventsService
}>()
subject.pipe(
  concatMap(async (e) => {
    await e.service.add({ event: e.event })
    return e
  })
).subscribe(() => {
  eventsPendingNumber -= 1
})

export let eventsPendingNumber: number = 0

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

  public enqueueAdd(params: {
    event: VolleyballScoutEventParameters
  }) {
    subject.next({ event: params.event, service: this })
    eventsPendingNumber += 1
  }
}
