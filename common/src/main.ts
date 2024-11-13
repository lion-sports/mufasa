export { incrementScore } from "./scouts/points";
export {
  BASKETBALL_ROLES,
  ROLES,
  VOLLEYBALL_ROLES
} from "./scouts/common"
export { FIRST_POINT } from "./scouts/volleyball/volleyball"
export { 
  SETTER_POSITION_TO_ROLES_POSITIONS,
  SETTER_POSITION_TO_ROLES_RECEIVES_POSITIONS,
  rotate,
  getPlayersPositions,
  getReceivePositions,
  getPhasePosition
} from "./scouts/volleyball/rotation"
export {
  EVENT_TYPE_TRANSLATIONS
} from './scouts/events'
export {
  FRIENDS_FIELD_SIDES,
  POSSIBLE_AUTO_POINT_FRIENDS_EVENTS,
  POSSIBLE_AUTO_POINT_ENEMY_EVENTS,
  POSSIBLE_AUTO_PAHSE_EVENTS
} from './scouts/info'

export type { 
  ScoringSystemConfig,
  ScoutEventPlayer,
  BasketballRole,
  Role,
  ScoringSystemConfigPoints,
  VolleyballRole
} from "./scouts/common";
export type { 
  VolleyballPoints, 
  VolleyballPhase, 
  VolleyballScoutEventPosition,
  VolleyballScoutEventAnchor,
  VolleyballPlayersDynamicPosition, 
  VolleyballPlayersPosition,
  VolleyballScoutStash
} from "./scouts/volleyball/volleyball";
export type {
  BlockScoutEventResult,
  BlockScoutExtraProperties,
  BlockScoutEventJson,
  BlockScoutEventParameters,
  LiberoSubstitutionScoutExtraProperties,
  LiberoSubstitutionScoutEventJson,
  LiberoSubstitutionScoutEventParameters,
  PlayerInPositionScoutExtraProperties,
  PlayerInPositionScoutEventJson,
  PlayerInPositionScoutEventParameters,
  PointScoredScoutExtraProperties,
  PointScoredScoutEventJson,
  PointScoredScoutEventParameters,
  ReceiveScoutEventResult,
  ReceiveScoutExtraProperties,
  ReceiveScoutEventJson,
  ReceiveScoutEventParameters,
  ServeScoutEventResult,
  ServeScoutExtraProperties,
  ServeScoutEventJson,
  ServeScoutEventParameters,
  SpikeScoutEventResult,
  SpikeScoutExtraProperties,
  SpikeScoutEventJson,
  SpikeScoutEventParameters,
  TimeoutScoutExtraProperties,
  TimeoutScoutEventJson,
  TimeoutScoutEventParameters,
  PlayerSubstitutionScoutExtraProperties,
  PlayerSubstitutionScoutEventJson,
  PlayerSubstitutionScoutEventParameters,
  ManualPhaseScoutExtraProperties,
  ManualPhaseScoutEventJson,
  ManualPhaseScoutEventParameters,
  RotationType,
  TeamRotationScoutExtraProperties,
  TeamRotationScoutEventJson,
  TeamRotationScoutEventParameters,
  VolleyballScoutEventJson,
  VolleyballScoutEventParameters,
  EventToResultType,
  VolleyballScoutEventType,
} from './scouts/events'
export type {
  ScoutInfoGeneral,
  ScoutInfoSettings
} from './scouts/info'