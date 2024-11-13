import ScoutEvent from "../../ScoutEvent";
import type { TimeoutScoutExtraProperties, VolleyballPoints } from 'lionn-common'

export default class TimeoutScoutEvent extends ScoutEvent<
  TimeoutScoutExtraProperties, 
  'timeout', 
  VolleyballPoints
> {
  public type = 'timeout' as const

  constructor(params) {
    if(params.opponent === null || params.opponent === undefined) params.opponent = false

    super({
      ...params
    })
    this.type = params.type
  }

  protected getExtraProperties(): TimeoutScoutExtraProperties {
    return {
      opponent: this.event.opponent
    }
  }
}