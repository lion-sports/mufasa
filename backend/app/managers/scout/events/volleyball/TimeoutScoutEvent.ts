import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";

export type TimeoutScoutExtraProperties = {
  opponent: boolean
}
export type TimeoutScoutEventJson = ScoutEventJson<'timeout', 'volleyball'> & TimeoutScoutExtraProperties

export default class TimeoutScoutEvent extends ScoutEvent<
  TimeoutScoutExtraProperties, 
  'timeout', 
  VolleyballPoints
> {
  public type = 'timeout' as const

  constructor(params) {
    if(params.opponent === null || params.opponent === undefined) params.opponent = false
    console.log(params)

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