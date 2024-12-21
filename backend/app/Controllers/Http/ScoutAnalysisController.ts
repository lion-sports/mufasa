import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ScoutAnalysisManager from 'App/managers/scout/analysis/scoutAnalysis.manager'

export default class ScoutAnalysisController {
  public async totalSpikeForPosition({ request }: HttpContextContract) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalSpikeForPosition({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalSpikeForPlayer({ request }: HttpContextContract) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalSpikeForPlayer({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalSpikeForPlayerAndPosition({ request }: HttpContextContract) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalSpikeForPlayerAndPosition({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalServe({ request }: HttpContextContract) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalServe({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalServeByPlayer({ request }: HttpContextContract) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalServeByPlayer({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalBlock({ request }: HttpContextContract) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalBlock({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }

  public async totalBlockByPlayer({ request }: HttpContextContract) {
    const manager = new ScoutAnalysisManager()

    return await manager.totalBlockByPlayer({
      data: {
        scoutId: request.input('scoutId'),
        sets: request.input('sets'),
        team: request.input('team')
      }
    })
  }
}
