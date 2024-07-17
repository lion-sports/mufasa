import User from "App/Models/User"
import ScoutEvent from "./ScoutEvent"
import Scout from "App/Models/Scout"
import { AuthorizationHelpers } from "../authorization.manager"
import { TYPE_TO_VOLLEYBALL_SCOUT_EVENT, VolleyballScoutEventJson } from "./events/volleyball/VolleyballScoutEvent"

export type ScoutSocketEventMapping = {
  'scout:add': VolleyballScoutEventJson
}

class ScoutSocket {
  constructor() { }

  public async handleEvent<Event extends keyof ScoutSocketEventMapping>(params: {
    event: Event,
    data: ScoutSocketEventMapping[Event],
    user: User
  }) {
    // check if user can manage the scout
    let scout = await Scout.query()
      .preload('event')
      .where('id', params.data.scoutId)
      .firstOrFail()
    
    let canManageScout = await AuthorizationHelpers.userCanInTeam({
      data: {
        user: params.user,
        team: { id: scout.event.teamId },
        action: 'manage',
        resource: 'scout'
      }
    })

    if (!canManageScout) {
      throw new Error('cannot manage the scout')
    }

    if(params.event == 'scout:add') {
      this.handleAdd({ scoutEvent: params.data, user: params.user })
    }
  }

  private async handleAdd(params: {
    scoutEvent: VolleyballScoutEventJson,
    user: User
  }) {
    let Cl = TYPE_TO_VOLLEYBALL_SCOUT_EVENT[params.scoutEvent.type]
    let event = new Cl({ 
      ...params.scoutEvent,
      createdByUserId: params.user.id
    })
    await event.save()
  }
}

export default new ScoutSocket()