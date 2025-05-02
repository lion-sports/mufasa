import type { HttpContext } from '@adonisjs/core/http'
import ScoutAnalysisManager from '#app/managers/scout/analysis/scoutAnalysis.manager'

export default class ScoutAnalysisController {
  public async totalSpikeForPosition({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalSpikeForPosition({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalSpikeForPlayer({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalSpikeForPlayer({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalSpikeForPlayerAndPosition({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalSpikeForPlayerAndPosition({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalServe({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalServe({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalServeByPlayer({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalServeByPlayer({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalBlock({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalBlock({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalBlockByPlayer({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalBlockByPlayer({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalReceive({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalReceive({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalReceiveByPlayer({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalReceiveByPlayer({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async pointsHistory({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.pointsHistory({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async trend({ request }: HttpContext) {
    const manager = new ScoutAnalysisManager()

    return await manager.trend({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team'),
        type: request.input('type'),
        window: request.input('window')
      }
    })
  }
}
