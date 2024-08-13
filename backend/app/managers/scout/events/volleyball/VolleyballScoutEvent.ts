import BlockScoutEvent, { BlockScoutEventJson } from "./BlockScoutEvent";
import LiberoSubstitutionScoutEvent, { LiberoSubstitutionScoutEventJson } from "./LiberoSubstitutionScoutEvent";
import ManualPhaseScoutEvent, { ManualPhaseScoutEventJson } from "./ManualPhaseScoutEvent";
import PlayerInPositionScoutEvent, { PlayerInPositionScoutEventJson } from "./PlayerInPositionScoutEvent";
import PlayerSubstitutionScoutEvent, { PlayerSubstitutionScoutEventJson } from "./PlayerSubstitutionScoutEvent";
import PointScoredScoutEvent, { PointScoredScoutEventJson } from "./PointScoredScoutEvent";
import ReceiveScoutEvent, { ReceiveScoutEventJson } from "./ReceiveScoutEvent";
import ServeScoutEvent, { ServeScoutEventJson } from "./ServeScoutEvent";
import SpikeScoutEvent, { SpikeScoutEventJson } from "./SpikeScoutEvent";
import TeamRotationScoutEvent, { TeamRotationScoutEventJson } from "./TeamRotationScoutEvent";
import TimeoutScoutEvent, { TimeoutScoutEventJson } from "./TimeoutScoutEvent";

export type VolleyballScoutEventJson = BlockScoutEventJson | LiberoSubstitutionScoutEventJson |
  PlayerInPositionScoutEventJson | PointScoredScoutEventJson | ReceiveScoutEventJson | 
  ServeScoutEventJson | SpikeScoutEventJson | TimeoutScoutEventJson | PlayerSubstitutionScoutEventJson |
  TeamRotationScoutEventJson | ManualPhaseScoutEventJson

export type VolleyballScoutEventType = VolleyballScoutEventJson['type']

export const TYPE_TO_VOLLEYBALL_SCOUT_EVENT: {
  [Key in VolleyballScoutEventType]: typeof BlockScoutEvent |
    typeof LiberoSubstitutionScoutEvent |
    typeof PlayerInPositionScoutEvent |
    typeof PlayerSubstitutionScoutEvent |
    typeof PointScoredScoutEvent |
    typeof ReceiveScoutEvent |
    typeof ServeScoutEvent |
    typeof SpikeScoutEvent |
    typeof TimeoutScoutEvent |
    typeof TeamRotationScoutEvent |
    typeof ManualPhaseScoutEvent
} = {
  'block': BlockScoutEvent,
  'liberoSubstitution': LiberoSubstitutionScoutEvent,
  'playerInPosition': PlayerInPositionScoutEvent,
  'playerSubstitution': PlayerSubstitutionScoutEvent,
  'pointScored': PointScoredScoutEvent,
  'receive': ReceiveScoutEvent,
  'serve': ServeScoutEvent,
  'spike': SpikeScoutEvent,
  'timeout': TimeoutScoutEvent,
  'teamRotation': TeamRotationScoutEvent,
  'manualPhase': ManualPhaseScoutEvent
} as const