import { ScoringSystemConfig } from "./common"
import { VolleyballPoints } from "./volleyball/volleyball"

export function incrementScore(params: {
  data: {
    currentScore: VolleyballPoints,
    opponent: boolean,
    scoringSystemConfig: ScoringSystemConfig
  }
}): VolleyballPoints {
  let newScore = params.data.currentScore

  if (params.data.opponent) newScore.enemy.points += 1
  else newScore.friends.points += 1

  const totalSetScoredBefore = Number(newScore.enemy.sets) + Number(newScore.friends.sets)
  const totalPointScored = Number(newScore.enemy.points) + Number(newScore.friends.points)
  const isTieBreak = !!params.data.scoringSystemConfig.tieBreak && (
    (
      params.data.scoringSystemConfig.set.mode == 'winSet' &&
      (Number(newScore.enemy.sets) + 1) == params.data.scoringSystemConfig.set.winSets &&
      (Number(newScore.friends.sets) + 1) == params.data.scoringSystemConfig.set.winSets
    ) || (
      params.data.scoringSystemConfig.set.mode == 'totalSet' &&
      (Number(totalSetScoredBefore) + 1) == params.data.scoringSystemConfig.set.totalSets &&
      Number(newScore.enemy.sets) == Number(newScore.friends.sets)
    )
  )

  if (isTieBreak && !!params.data.scoringSystemConfig.tieBreak) {
    if (params.data.scoringSystemConfig.tieBreak.mode == 'totalPoints' && totalPointScored == params.data.scoringSystemConfig.tieBreak.totalPoints) {
      if (newScore.enemy.points > newScore.friends.points) {
        newScore = incrementSetFor('enemy', newScore)
      } else {
        newScore = incrementSetFor('friends', newScore)
      }
    } else if (params.data.scoringSystemConfig.tieBreak.mode == 'winPoints') {
      if (newScore.enemy.points >= params.data.scoringSystemConfig.tieBreak.winPoints) {
        let differencePoints = Number(newScore.enemy.points) - Number(newScore.friends.points)
        if (differencePoints > 1 || !params.data.scoringSystemConfig.tieBreak.hasAdvantages) {
          newScore = incrementSetFor('enemy', newScore)
        } else {
          let pointLimit = params.data.scoringSystemConfig.tieBreak.pointsLimit
          if (pointLimit !== undefined && newScore.enemy.points == pointLimit) {
            newScore = incrementSetFor('enemy', newScore)
          }
        }
      }

      if (newScore.friends.points >= params.data.scoringSystemConfig.tieBreak.winPoints) {
        let differencePoints = Number(newScore.friends.points) - Number(newScore.enemy.points)
        if (differencePoints > 1 || !params.data.scoringSystemConfig.tieBreak.hasAdvantages) {
          newScore = incrementSetFor('friends', newScore)
        } else {
          let pointLimit = params.data.scoringSystemConfig.tieBreak.pointsLimit
          if (pointLimit !== undefined && newScore.friends.points == pointLimit) {
            newScore = incrementSetFor('friends', newScore)
          }
        }
      }
    }
  } else {
    if (params.data.scoringSystemConfig.points.mode == 'totalPoints' && totalPointScored == params.data.scoringSystemConfig.points.totalPoints) {
      if (newScore.enemy.points > newScore.friends.points) {
        newScore = incrementSetFor('enemy', newScore)
      } else {
        newScore = incrementSetFor('friends', newScore)
      }
    } else if (params.data.scoringSystemConfig.points.mode == 'winPoints') {
      if (newScore.enemy.points >= params.data.scoringSystemConfig.points.winPoints) {
        let differencePoints = Number(newScore.enemy.points) - Number(newScore.friends.points)
        if (differencePoints > 1 || !params.data.scoringSystemConfig.points.hasAdvantages) {
          newScore = incrementSetFor('enemy', newScore)
        } else {
          let pointLimit = params.data.scoringSystemConfig.points.pointsLimit
          if (pointLimit !== undefined && newScore.enemy.points == pointLimit) {
            newScore = incrementSetFor('enemy', newScore)
          }
        }
      }

      if (newScore.friends.points >= params.data.scoringSystemConfig.points.winPoints) {
        let differencePoints = Number(newScore.friends.points) - Number(newScore.enemy.points)
        if (differencePoints > 1 || !params.data.scoringSystemConfig.points.hasAdvantages) {
          newScore = incrementSetFor('friends', newScore)
        } else {
          let pointLimit = params.data.scoringSystemConfig.points.pointsLimit
          if (pointLimit !== undefined && newScore.friends.points == pointLimit) {
            newScore = incrementSetFor('friends', newScore)
          }
        }
      }
    }
  }


  const totalSetScored = Number(newScore.enemy.sets) + Number(newScore.friends.sets)

  if (params.data.scoringSystemConfig.set.mode == 'winSet') {
    if (newScore.enemy.sets >= params.data.scoringSystemConfig.set.winSets) newScore.enemy.won = true
    if (newScore.friends.sets >= params.data.scoringSystemConfig.set.winSets) newScore.friends.won = true
  } else if (params.data.scoringSystemConfig.set.mode == 'totalSet') {
    if (totalSetScored >= params.data.scoringSystemConfig.set.totalSets) {
      if (newScore.enemy.sets > newScore.friends.sets) newScore.enemy.won = true
      if (newScore.enemy.sets < newScore.friends.sets) newScore.friends.won = true
    }
  }

  return newScore
}

function incrementSetFor(who: 'enemy' | 'friends', score: VolleyballPoints): VolleyballPoints {
  score[who].sets += 1
  score.enemy.points = 0
  score.friends.points = 0
  return score
}