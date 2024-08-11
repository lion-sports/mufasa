import User from "App/Models/User"
import ScoutEvent from "./ScoutEvent"
import Scout from "App/Models/Scout"
import { AuthorizationHelpers } from "../authorization.manager"
import { TYPE_TO_VOLLEYBALL_SCOUT_EVENT, VolleyballScoutEventJson } from "./events/volleyball/VolleyballScoutEvent"
import ScoutsManager from "./scouts.manager"
import { FIRST_POINT } from "./events/volleyball/common"

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
      await this.handleAdd({ scoutEvent: params.data, user: params.user, scout })
    }
  }

  private async handleAdd(params: {
    scoutEvent: VolleyballScoutEventJson
    scout: Scout
    user: User
  }) {
    if (!params.scoutEvent.points) params.scoutEvent.points = params.scout.stash?.points
    if (!params.scoutEvent.points) params.scoutEvent.points = FIRST_POINT

    let Cl = TYPE_TO_VOLLEYBALL_SCOUT_EVENT[params.scoutEvent.type]
    let event = new Cl({ 
      ...params.scoutEvent,
      createdByUserId: params.user.id
    })
    await event.preReceived({ 
      data: {
        scout: params.scout
      }
    })
    await event.save()
    await event.postReceived({
      data: {
        scout: params.scout
      }
    })

    let scoutManager = new ScoutsManager()
    await scoutManager.recalculateStash({ 
      data: { id: params.scout.id },
      context: {
        user: params.user
      }
    })
  }
}

export default new ScoutSocket()