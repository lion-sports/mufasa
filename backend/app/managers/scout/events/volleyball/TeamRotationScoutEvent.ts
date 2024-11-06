import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballPlayersPosition } from "./common";
import Scout from "App/Models/Scout";
import User from "App/Models/User";
import scoutsSocket from "../../scouts.socket";
import { rotate } from "lionn-common";

export type TeamRotationScoutExtraProperties = {
  opponent: boolean,
  rotationType: RotationType
  newPositions: VolleyballPlayersPosition
}
export type TeamRotationScoutEventJson = ScoutEventJson<'teamRotation', 'volleyball'> & TeamRotationScoutExtraProperties
export type TeamRotationScoutEventAddParamters = Omit<TeamRotationScoutEventJson, 'newPositions'> & {
  fromPositions: VolleyballPlayersPosition
}

export type RotationType = 'backward' | 'forward'

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

  public async postReceived(params: { data: { scout: Scout; }; context: { user: User; }; }): Promise<void> {
    let positionFourPlayer = this.newPositions.friends[4]?.player
    if(!!positionFourPlayer && positionFourPlayer.role == 'libero') {
      let openLiberoSub = params.data.scout.stash.currentSetOpenLiberoSubstitution?.find((os) => os.liberoId == positionFourPlayer.id)
      if(!openLiberoSub) return 

      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'liberoSubstitution',
            libero: openLiberoSub.libero,
            liberoId: openLiberoSub.liberoId,
            inOrOut: 'out',
            player: openLiberoSub.player,
            playerId: openLiberoSub.playerId,
            position: 4,
            opponent: openLiberoSub.player.isOpponent,
            date: new Date(),
            scoutId: this.scoutId,
            sport: 'volleyball',
            teamId: this.teamId,
            createdByUserId: this.createdByUserId,
            points: this.points
          },
        },
        context: params.context
      })
    }
  }
}