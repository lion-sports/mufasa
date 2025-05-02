import ScoutEvent, { ScoutEventConstructorsParameters } from "../../ScoutEvent.js";
import type { ManualPhaseScoutExtraProperties, VolleyballPoints, VolleyballPhase } from 'lionn-common'

export default class ManualPhaseScoutEvent extends ScoutEvent<ManualPhaseScoutExtraProperties, 'manualPhase', VolleyballPoints> {
  public type = 'manualPhase' as const

  constructor(params: ScoutEventConstructorsParameters<'manualPhase', VolleyballPoints, ManualPhaseScoutExtraProperties>) {
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