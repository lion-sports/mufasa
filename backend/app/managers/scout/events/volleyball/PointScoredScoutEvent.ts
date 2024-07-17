import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";

export type PointScoredScoutExtraProperties = {
  opponent: boolean,
  newPoints: VolleyballPoints
}
export type PointScoredScoutEventJson = ScoutEventJson<'pointScored', 'volleyball'> & PointScoredScoutExtraProperties

export default class TimeoutScoutEvent extends ScoutEvent<
  PointScoredScoutExtraProperties,
  'pointScored',
  VolleyballPoints
> {
  public type = 'pointScored' as const

  constructor(params) {
    super({
      ...params
    })
    this.type = params.type
  }

  protected getExtraProperties(): PointScoredScoutExtraProperties {
    return {
      opponent: this.event.opponent,
      newPoints: this.event.newPoints
    }
  }
}