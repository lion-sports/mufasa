import { describe, test, assert } from 'vitest';
import { getNextAutomatedEvents } from 'src/scouts/volleyball/automations';
import { ScoutEventPlayer, ScoutInfoSettings, VolleyballScoutEventPosition } from 'src/main';

describe('automations', () => {
  let scoutEventPlayer: ScoutEventPlayer = {
    id: 1,
    scoutId: 1,
    aliases: ['Alias'],
    role: 'center',
    shirtNumber: 10,
    shirtPrimaryColor: undefined,
    shirtSecondaryColor: undefined,
    isOpponent: false
  }

  let scoutId: number = 1
  let teamId: number = 1
  let position: VolleyballScoutEventPosition = 4
  let scoutInfo: {
    settings: ScoutInfoSettings
  } = {
    settings: {
      automations: {
        autoPoint: {
          enemy: ['blockHandsOut']
        }
      }
    }
  }

  test('block - hands out', async () => {
    let automatedEvents = getNextAutomatedEvents({
      event: {
        type: 'block',
        player: scoutEventPlayer,
        playerId: scoutEventPlayer.id,
        result: 'handsOut',
        position: position,
        date: new Date(),
        scoutId: scoutId,
        sport: 'volleyball',
        teamId: teamId,
        createdByUserId: undefined,
        points: undefined
      },
      context: {
        scoutInfo
      }
    })

    assert.isTrue(automatedEvents.some((ae) => ae.type == 'pointScored' ), 'should have generate a point scored event')
  })
})