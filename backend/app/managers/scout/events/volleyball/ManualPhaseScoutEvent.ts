import ScoutEvent from "../../ScoutEvent";
import type { ManualPhaseScoutExtraProperties, VolleyballPoints, VolleyballPhase } from 'lionn-common'

export default class ManualPhaseScoutEvent extends ScoutEvent<ManualPhaseScoutExtraProperties, 'manualPhase', VolleyballPoints> {
  public type = 'manualPhase' as const

  constructor(params) {
    super({
      ...params,
    })
    this.type = params.type
  }

  protected getExtraProperties(): ManualPhaseScoutExtraProperties {
    return {
      phase: this.event.phase
    }
  }
}