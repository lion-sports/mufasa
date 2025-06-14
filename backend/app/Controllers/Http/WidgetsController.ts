import type { HttpContext } from '@adonisjs/core/http'
import ScoutAnalysisManager from '#app/managers/scout/analysis/scoutAnalysis.manager'
import WidgetManager from '#app/managers/widget.manager'

export default class WidgetsController {
  public async show({ params }: HttpContext) {
    let id = params.id

    let manager = new WidgetManager()
    return manager.get({
      data: {
        id
      }
    })
  }

  public async loadDistribution({ request }: HttpContext) {
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

  public async loadServeSummary({ request }: HttpContext) {
    let scoutId = request.input('scoutId')
    let sets = request.input('sets')
    let team = request.input('team')

    const manager = new ScoutAnalysisManager()
    let totalServe = await manager.totalServe({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let totalServeByPlayer = await manager.totalServeByPlayer({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let previousTotalServeByPlayer: typeof totalServeByPlayer = []

    let previousSet = Math.min(...(sets || []))
    if (previousSet !== Infinity && previousSet !== 1 && sets.length === 1) {
      previousSet -= 1
      previousTotalServeByPlayer = await manager.totalServeByPlayer({
        data: {
          scoutId,
          sets: [previousSet],
          team
        }
      })
    }

    return {
      totalServe,
      totalServeByPlayer,
      previousTotalServeByPlayer
    }
  }

  public async loadBlockSummary({ request }: HttpContext) {
    let scoutId = request.input('scoutId')
    let sets = request.input('sets')
    let team = request.input('team')

    const manager = new ScoutAnalysisManager()
    let totalBlock = await manager.totalBlock({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let totalBlockByPlayer = await manager.totalBlockByPlayer({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let previousTotalBlockByPlayer: typeof totalBlockByPlayer = []

    let previousSet = Math.min(...(sets || []))
    if (previousSet !== Infinity && previousSet !== 1 && sets.length === 1) {
      previousSet -= 1
      previousTotalBlockByPlayer = await manager.totalBlockByPlayer({
        data: {
          scoutId,
          sets: [previousSet],
          team
        }
      })
    }

    return {
      totalBlock,
      totalBlockByPlayer,
      previousTotalBlockByPlayer
    }
  }


  public async loadReceiveSummary({ request }: HttpContext) {
    let scoutId = request.input('scoutId')
    let sets = request.input('sets')
    let team = request.input('team')

    const manager = new ScoutAnalysisManager()
    let totalReceive = await manager.totalReceive({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let totalReceiveByPlayer = await manager.totalReceiveByPlayer({
      data: {
        scoutId,
        sets,
        team
      }
    })

    let previousTotalReceiveByPlayer: typeof totalReceiveByPlayer = []

    let previousSet = Math.min(...(sets || []))
    if (previousSet !== Infinity && previousSet !== 1 && sets.length === 1) {
      previousSet -= 1
      previousTotalReceiveByPlayer = await manager.totalReceiveByPlayer({
        data: {
          scoutId,
          sets: [previousSet],
          team
        }
      })
    }

    return {
      totalReceive,
      totalReceiveByPlayer,
      previousTotalReceiveByPlayer
    }
  }

  public async loadTrend({ request }: HttpContext) {
    let scoutId = request.input('scoutId')
    let sets = request.input('sets')
    let team = request.input('team')
    let type = request.input('type')
    let window = request.input('window')

    const manager = new ScoutAnalysisManager()
    let totalTrend = await manager.trend({
      data: {
        scoutId,
        sets,
        team,
        type,
        window
      }
    })

    let trendForType: {
      [Key in 'block' | 'serve' | 'spike' | 'receive']?: Awaited<ReturnType<ScoutAnalysisManager['trend']>>
    } = {}

    if(!!type && type.length >= 0) {
      for(let i = 0; i < type.length; i += 1) {
        let currentType = type[i] as keyof typeof trendForType
        trendForType[currentType] = await manager.trend({
          data: {
            scoutId,
            sets,
            team,
            type: [currentType],
            window
          }
        })
      }
    }

    return {
      totalTrend,
      trendForType
    }
  }
}
