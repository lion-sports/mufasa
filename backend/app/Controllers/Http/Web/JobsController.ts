import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import Bull from '@ioc:Breeze'

export default class JobsController {
  public async index({ request, view }: HttpContextContract) {
    let queues: {
      name: string,
      jobs: {
        timestamp: number,
        state: string,
        data: any
      }[]
    }[] = []

    const viewOnlyState = request.input('viewOnlyState')

    for(let [name, queue] of Object.entries(Bull.queues)) {
      let foundedJobs = await queue.bull.getJobs(
          !! viewOnlyState ?
          [ viewOnlyState ] :
          ['active', 'delayed', 'completed', 'failed']
        , 0, 50)

      let jobs: (typeof queues)[0]['jobs'] = []
      for(let i = 0; i < foundedJobs.length; i += 1) {
        jobs.push({
          timestamp: foundedJobs[i].timestamp,
          state: await foundedJobs[i].getState(),
          data: JSON.stringify(foundedJobs[i].data)
        })
      }

      queues.push({
        name,
        jobs: jobs.sort((a, b) => b.timestamp - a.timestamp)
      })
    }

    return view.render('jobs/list', {
      queues,
      DateTime,
      viewOnlyState
    })
  }
}
