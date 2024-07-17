import BlockScoutEvent, { BlockScoutEventJson } from "./BlockScoutEvent";
import LiberoSubstitutionScoutEvent, { LiberoSubstitutionScoutEventJson } from "./LiberoSubstitutionScoutEvent";
import PlayerInPositionScoutEvent, { PlayerInPositionScoutEventJson } from "./PlayerInPositionScoutEvent";
import PlayerSubstitutionScoutEvent, { PlayerSubstitutionScoutEventJson } from "./PlayerSubstitutionScoutEvent";
import PointScoredScoutEvent, { PointScoredScoutEventJson } from "./PointScoredScoutEvent";
import ReceiveScoutEvent, { ReceiveScoutEventJson } from "./ReceiveScoutEvent";
import ServeScoutEvent, { ServeScoutEventJson } from "./ServeScoutEvent";
import SpikeScoutEvent, { SpikeScoutEventJson } from "./SpikeScoutEvent";
import TimeoutScoutEvent, { TimeoutScoutEventJson } from "./TimeoutScoutEvent";

export type VolleyballScoutEventJson = BlockScoutEventJson | LiberoSubstitutionScoutEventJson |
  PlayerInPositionScoutEventJson | PointScoredScoutEventJson | ReceiveScoutEventJson | 
  ServeScoutEventJson | SpikeScoutEventJson | TimeoutScoutEventJson | PlayerSubstitutionScoutEventJson

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
    typeof TimeoutScoutEvent
} = {
  'block': BlockScoutEvent,
  'liberoSubstitution': LiberoSubstitutionScoutEvent,
  'playerInPosition': PlayerInPositionScoutEvent,
  'playerSubstitution': PlayerSubstitutionScoutEvent,
  'pointScored': PointScoredScoutEvent,
  'receive': ReceiveScoutEvent,
  'serve': ServeScoutEvent,
  'spike': SpikeScoutEvent,
  'timeout': TimeoutScoutEvent
} as const