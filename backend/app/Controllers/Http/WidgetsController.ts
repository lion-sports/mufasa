import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ScoutAnalysisManager from 'App/managers/scout/analysis/scoutAnalysis.manager'
import WidgetManager from 'App/managers/widget.manager'

export default class WidgetsController {
  public async show({ params }: HttpContextContract) {
    let id = params.id

    let manager = new WidgetManager()
    return manager.get({
      data: {
        id
      }
    })
  }

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

  public async loadServeSummary({ request }: HttpContextContract) {
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

  public async loadBlockSummary({ request }: HttpContextContract) {
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


  public async loadReceiveSummary({ request }: HttpContextContract) {
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
}
