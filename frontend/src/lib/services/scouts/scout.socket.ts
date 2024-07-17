import type { VolleyballScoutEventJson } from "./volleyball";
import socketService from "../common/socket.service";

class ScoutSocket {
  async send(params: {
    event: VolleyballScoutEventJson
  }) {
    socketService.io?.emit(this.roomName({ 
      team: {
        id: params.event.teamId 
      },
      namespace: 'scout:add'
    }))
  }

  public roomName(params: {
    team: { id: number },
    namespace?: string
  }): string {
    return `teams:${params.team.id}${!!params.namespace ? ':' + params.namespace : ''}`
  }
}

export default new ScoutSocket()