import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ScoutAnalysisManager from 'App/managers/scout/analysis/scoutAnalysis.manager'

export default class WidgetsController {
  public async loadDistribution({ request }: HttpContextContract) {
    let scoutId = request.input('scoutId')
    let sets = request.input('sets')
    let team = request.input('team')

    const manager = new ScoutAnalysisManager()
    let totalSpikeForPosition = await manager.totalSpikeForPosition({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let totalSpikeForPlayer = await manager.totalSpikeForPlayer({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let totalSpikeForPlayerAndPosition = await manager.totalSpikeForPlayerAndPosition({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let previousTotalSpikeForPosition: typeof totalSpikeForPosition = []
    let previousTotalSpikeForPlayer: typeof totalSpikeForPlayer = []
    let previousTotalSpikeForPlayerAndPosition: typeof totalSpikeForPlayerAndPosition = []

    let previousSet = Math.min(...(sets || []))
    if(previousSet !== Infinity && previousSet !== 1 && sets.length === 1) {
      previousSet -= 1
      previousTotalSpikeForPosition = await manager.totalSpikeForPosition({
        data: {
          scoutId,
          sets: [previousSet],
          team
        }
      })

      previousTotalSpikeForPlayer = await manager.totalSpikeForPlayer({
        data: {
          scoutId,
          sets: [previousSet],
          team
        }
      })

      previousTotalSpikeForPlayerAndPosition = await manager.totalSpikeForPlayerAndPosition({
        data: {
          scoutId,
          sets,
          team
        }
      })
    }

    return {
      totalSpikeForPosition,
      totalSpikeForPlayer,
      totalSpikeForPlayerAndPosition,
      previousTotalSpikeForPosition,
      previousTotalSpikeForPlayer,
      previousTotalSpikeForPlayerAndPosition
    }
  }
}
