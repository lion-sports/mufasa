import { ScoutEventPlayer } from "App/Models/Player"

export type VolleyballScoutEventPosition = 1 | 2 | 3 | 4 | 5 | 6

/*
WALL
1    2   3   4     5
    |----------|   
6   |7   8   9 |   10
11  |12  13  14|   15
16  |17  18  19|   20
    |----------|
21   22  23  24    25
NET
*/
export type VolleyballScoutEventAnchor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25

export type VolleyballPlayersPosition = {
  friends: {
    [Key in VolleyballScoutEventPosition]?: {
      player: ScoutEventPlayer,
      anchor?: VolleyballScoutEventAnchor
    }
  },
  enemy: {
    [Key in VolleyballScoutEventPosition]?: {
      player: ScoutEventPlayer,
      anchor?: VolleyballScoutEventAnchor
    }
  }
}

export type VolleyballPlayersDynamicPosition = {
  friends?: {
    [Key: number]: {
      position: VolleyballScoutEventPosition,
      anchor?: VolleyballScoutEventAnchor
    }
  },
  enemy?: {
    [Key: number]: {
      position: VolleyballScoutEventPosition,
      anchor?: VolleyballScoutEventAnchor
    }
  }
}

export type VolleyballPoints = {
  friends: {
    points: number
    sets: number
    won?: boolean
  },
  enemy: {
    points: number
    sets: number
    won?: boolean
  }
}

export const FIRST_POINT: VolleyballPoints = {
  friends: {
    points: 0,
    sets: 0
  },
  enemy: {
    points: 0,
    sets: 0
  }
}