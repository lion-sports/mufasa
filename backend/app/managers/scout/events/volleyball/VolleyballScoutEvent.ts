import BlockScoutEvent from "./BlockScoutEvent.js";
import LiberoSubstitutionScoutEvent from "./LiberoSubstitutionScoutEvent.js";
import ManualPhaseScoutEvent from "./ManualPhaseScoutEvent.js";
import PlayerInPositionScoutEvent from "./PlayerInPositionScoutEvent.js";
import PlayerSubstitutionScoutEvent from "./PlayerSubstitutionScoutEvent.js";
import PointScoredScoutEvent from "./PointScoredScoutEvent.js";
import ReceiveScoutEvent from "./ReceiveScoutEvent.js";
import ServeScoutEvent from "./ServeScoutEvent.js";
import SpikeScoutEvent from "./SpikeScoutEvent.js";
import TeamRotationScoutEvent from "./TeamRotationScoutEvent.js";
import TimeoutScoutEvent from "./TimeoutScoutEvent.js";
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