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
  VolleyballPlayersPosition
} from "./scouts/volleyball/volleyball";
export type { RotationType } from "./scouts/volleyball/rotation"