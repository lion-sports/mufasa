import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballScoutEventPosition } from "./common";
import Scout from "App/Models/Scout";
import { Context } from "App/managers/base.manager";
import scoutsSocket from "../../scouts.socket";

export type SpikeScoutEventResult = 'error' | 'point' | 'defense'

export type SpikeScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: SpikeScoutEventResult,
  position: VolleyballScoutEventPosition
}
export type SpikeScoutEventJson = ScoutEventJson<'spike', 'volleyball'> & SpikeScoutExtraProperties

export default class SpikeScoutEvent extends ScoutEvent<SpikeScoutExtraProperties, 'spike', VolleyballPoints> {
  public type = 'spike' as const

  constructor(params) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    super({
      ...params,
      playerId: params.playerId,
    })
    this.type = params.type
  }

  protected getExtraProperties(): SpikeScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      result: this.event.result,
      position: this.event.position
    }
  }

  public async postReceived(params: {
    data: {
      scout: Scout
    }
    context?: Context
  }): Promise<void> {
    scoutsSocket.emit({
      data: {
        event: 'scout:lastEventReload',
        data: {
          scoutId: params.data.scout.id
        }
      },
      context: params.context
    })
  }
}