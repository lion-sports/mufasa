import { ScoutEventPlayer } from "App/Models/Player"

export type VolleyballScoutEventPosition = 1 | 2 | 3 | 4 | 5 | 6

export type VolleyballPoints = {
  friends: {
    points: number
    sets: number
  },
  enemy: {
    points: number
    sets: number
  }
}

export type VolleyballPlayersPosition = {
  friends: Record<VolleyballScoutEventPosition, ScoutEventPlayer>
  enemy: Record<VolleyballScoutEventPosition, ScoutEventPlayer>
}