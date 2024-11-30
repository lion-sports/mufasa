import User from "App/Models/User"
import Scout from "App/Models/Scout"
import { AuthorizationHelpers } from "../authorization.manager"
import { TYPE_TO_VOLLEYBALL_SCOUT_EVENT } from "./events/volleyball/VolleyballScoutEvent"
import ScoutsManager from "./scouts.manager"
import Ws from "App/Services/Ws"
import { Context, withTransaction, withUser } from "../base.manager"
import PlayersManager from "../players.manager"
import { TransactionClientContract } from "@ioc:Adonis/Lucid/Database"
import { FIRST_POINT, getNextAutomatedEvents, type VolleyballScoutEventParameters } from 'lionn-common'

export type ScoutSocketEventMapping = {
  'scout:add': VolleyballScoutEventParameters,
  'scout:stashReload': {
    scout: Scout
  },
  'scout:lastEventReload': {
    scoutId: number
  },
  'scout:analysisReload': {
    scoutId: number
  },
  'scout:undo': {
    scoutId: number
  },
  'scout:restart': {
    scoutId: number
  }
}

class ScoutSocket {
  constructor() { }

  public async emit<
    EventName extends keyof ScoutSocketEventMapping,
    EventData extends ScoutSocketEventMapping[EventName]
  >(params: {
    data: {
      event: EventName,
      data: EventData
    },
    context?: Context
  }) {
    if (params.data.event == 'scout:stashReload') {
      let data = params.data.data as ScoutSocketEventMapping['scout:stashReload']

      let scout = await Scout.query({ client: params.context?.trx })
        .preload('event', b => b.preload('team'))
        .where('id', data.scout.id)
        .firstOrFail()

      let roomName = Ws.roomName({
        team: scout.event.team,
        namespace: 'scout'
      })

      let eventName = Ws.roomName({
        team: scout.event.team,
        namespace: 'scout:stashReload'
      })

      Ws.io.to(roomName).emit(eventName, data)
    } else if (params.data.event == 'scout:lastEventReload') {
      let data = params.data.data as ScoutSocketEventMapping['scout:lastEventReload']

      let scout = await Scout.query({ client: params.context?.trx })
        .preload('event')
        .preload('players')
        .where('id', data.scoutId)
        .firstOrFail()

      let roomName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout'
      })

      let eventName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout:lastEventReload'
      })

      let playersManager = new PlayersManager()
      let lastEventsForPlayers = await playersManager.lastScoutEventsForMany({
        data: {
          players: scout.players,
          scout: scout
        },
        context: params.context
      })

      Ws.io.to(roomName).emit(eventName, {
        lastEventsForPlayers
      })
    } else if (params.data.event == 'scout:analysisReload') {
      let data = params.data.data as ScoutSocketEventMapping['scout:analysisReload']

      let scout = await Scout.query({ client: params.context?.trx })
        .preload('event')
        .preload('players')
        .where('id', data.scoutId)
        .firstOrFail()

      let roomName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout'
      })

      let eventName = Ws.roomName({
        team: {
          id: scout.event.teamId
        },
        namespace: 'scout:analysisReload'
      })

      let scoutManager = new ScoutsManager()
      let analysis = await scoutManager.analysis({
        data: {
          id: scout.id
        },
        context: params.context
      })

      Ws.io.to(roomName).emit(eventName, {
        analysis
      })
    }
  }

  @withUser
  @withTransaction
  public async handleEvent<
    Event extends keyof ScoutSocketEventMapping,
    EventData extends ScoutSocketEventMapping[Event]
  >(params: {
    data: {
      event: Event,
      data: EventData,
    },
    context?: Context
  }) {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    if (params.data.event == 'scout:add' || params.data.event == 'scout:undo' || params.data.event == 'scout:restart') {
      let data = params.data.data as ScoutSocketEventMapping['scout:add']

      // check if user can manage the scout
      let scout = await Scout.query({ client: trx })
        .preload('event')
        .preload('scoutInfo')
        .preload('scoringSystem')
        .where('id', data.scoutId)
        .firstOrFail()

      let canManageScout = await AuthorizationHelpers.userCanInTeam({
        data: {
          user: user,
          team: { id: scout.event.teamId },
          action: 'manage',
          resource: 'scout'
        },
        context: {
          user, trx
        }
      })

      if (!canManageScout) {
        throw new Error('cannot manage the scout')
      }

      if (params.data.event == 'scout:add') {
        await this.handleAdd({ data: { scoutEvent: data, scout }, context: { user, trx } })
      } else if (params.data.event == 'scout:undo') {
        await this.handleUndo({ user, scout })
      } else if (params.data.event == 'scout:restart') {
        await this.handleRestart({ user, scout })
      }
    }
  }

  @withUser
  @withTransaction
  public async handleAdd(params: {
    data: {
      scoutEvent: VolleyballScoutEventParameters
      scout: Scout
      avoidRecalculateStash?: boolean
      avoidAutomations?: boolean
    },
    context?: Context
  }) {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    if (!params.data.scoutEvent.points) params.data.scoutEvent.points = params.data.scout.stash?.points
    if (!params.data.scoutEvent.points) params.data.scoutEvent.points = FIRST_POINT

    let Cl = TYPE_TO_VOLLEYBALL_SCOUT_EVENT[params.data.scoutEvent.type]
    let event = new Cl({
      ...params.data.scoutEvent,
      createdByUserId: user.id
    })
    await event.preReceived({
      data: {
        scout: params.data.scout
      },
      context: { user, trx }
    })
    await event.save()
    await event.postReceived({
      data: {
        scout: params.data.scout
      },
      context: { user, trx }
    })

    if (!params.data.avoidAutomations) {
      let { events: automatedEvents } = getNextAutomatedEvents({
        event: params.data.scoutEvent,
        context: {
          scoutInfo: params.data.scout.scoutInfo,
          scoringSystem: params.data.scout.scoringSystem.config,
          stash: params.data.scout.stash
        }
      })
  
      if(!!automatedEvents && automatedEvents.length > 0) {
        for(let i = 0; i < automatedEvents.length; i += 1) {
          let automatedEvent = automatedEvents[i]
          await this.handleAdd({
            data: {
              scoutEvent: automatedEvent,
              scout: params.data.scout,
              avoidRecalculateStash: true,
              avoidAutomations: true
            },
            context: { user, trx }
          })
        }
      }
    }

    if(!params.data.avoidRecalculateStash) {
      let scoutManager = new ScoutsManager()
      await scoutManager.recalculateStash({
        data: { id: params.data.scout.id },
        context: { user, trx }
      })
    }
  }

  private async handleUndo(params: {
    scout: Scout
    user: User
  }) {
    let scoutManager = new ScoutsManager()
    await scoutManager.undo({
      data: { id: params.scout.id },
      context: {
        user: params.user
      }
    })
  }

  private async handleRestart(params: {
    scout: Scout
    user: User
  }) {
    let scoutManager = new ScoutsManager()
    await scoutManager.restart({
      data: { id: params.scout.id },
      context: {
        user: params.user
      }
    })
  }
}

export default new ScoutSocket()