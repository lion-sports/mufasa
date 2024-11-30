import ScoutEvent from "../../ScoutEvent";
import { 
  rotate,
  type VolleyballPoints, 
  type VolleyballPlayersPosition,
  type TeamRotationScoutExtraProperties,
  type RotationType
} from "lionn-common";

export default class TeamRotationScoutEvent extends ScoutEvent<
  {
    opponent: boolean,
    rotationType: RotationType,
    fromPositions: VolleyballPlayersPosition
  }, 
  'teamRotation', 
  VolleyballPoints,
  TeamRotationScoutExtraProperties
> {
  public type = 'teamRotation' as const
  public newPositions: VolleyballPlayersPosition

  constructor(params) {
    let newPositions = rotate({
      position: params.fromPositions,
      opponent: params.opponent,
      rotationType: params.rotationType
    })

    super({
      ...params,
      opponent: params.opponent,
      rotationType: params.rotationType,
      newPositions: newPositions
    })
    this.newPositions = newPositions
    this.type = params.type
  }

  protected getExtraProperties(): TeamRotationScoutExtraProperties {
    return {
      opponent: this.event.opponent,
      newPositions: this.newPositions,
      rotationType: this.event.rotationType
    }
  }
}