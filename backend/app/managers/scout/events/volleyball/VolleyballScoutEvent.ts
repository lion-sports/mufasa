import BlockScoutEvent from "./BlockScoutEvent";
import LiberoSubstitutionScoutEvent from "./LiberoSubstitutionScoutEvent";
import ManualPhaseScoutEvent from "./ManualPhaseScoutEvent";
import PlayerInPositionScoutEvent from "./PlayerInPositionScoutEvent";
import PlayerSubstitutionScoutEvent from "./PlayerSubstitutionScoutEvent";
import PointScoredScoutEvent from "./PointScoredScoutEvent";
import ReceiveScoutEvent from "./ReceiveScoutEvent";
import ServeScoutEvent from "./ServeScoutEvent";
import SpikeScoutEvent from "./SpikeScoutEvent";
import TeamRotationScoutEvent from "./TeamRotationScoutEvent";
import TimeoutScoutEvent from "./TimeoutScoutEvent";
import type { VolleyballScoutEventType } from 'lionn-common'

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