import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPhase, VolleyballPoints } from "./common";

export type ManualPhaseScoutExtraProperties = {
  phase: VolleyballPhase
}
export type ManualPhaseScoutEventJson = ScoutEventJson<'manualPhase', 'volleyball'> & ManualPhaseScoutExtraProperties

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