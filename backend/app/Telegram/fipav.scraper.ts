import XRay from 'x-ray'
const x = XRay({
  filters: {
    substituteUselessTags: function(value) {
      return !!value ? value
        .replace(/<p>/g, ' ')
        .replace(/<b>/g, ' ')
        .replace(/<\/b>/g, ' ')
        .replace(/<br \/>/g, '\n')
        .replace(/<\/p>/g, ' ')
        .replace(/<span class="parziali">.*<\/span>/g, ' ')
        .replace(/PARZIALI:/g, ' ')
        .replace(/\n/g, ' - ')
        .replace(/( )+/g, ' ')
        .replace(/(- -)+/g, '')
        .replace(/^ - /g, '')
        .replace(/<p class="designazione">Arbitro designato/g, '')
        : value
    }
  }
})
import { DateTime } from 'luxon'

const fipavUrl = 'http://www.fipavpiacenza.it/risultati-classifiche.aspx'

export default class FipavScraper {
  constructor() { }

  public async getAvailableTeamsAndChampionship(_params?: {
    data?: {
      from?: DateTime
    }
  }): Promise<{
    teams: string[],
    championships: {
      name: string,
      teams: string[]
    }[]
  }> {
    let object = await x(fipavUrl, '.tbl-risultati', {
      championships: x('table', [
        {
          name: 'caption',
          teams: ['td[title]']
        }
      ]),
      teams: x('tr', ['td[title]'])
    })

    return object
  }

  async findGames(params: {
    data: {
      teamName?: string,
      championshipName: string,
      from?: DateTime
    }
  }): Promise<{
    locals: string,
    guests: string,
    start: string,
    place: string
  }[]> {
    let object = await x(fipavUrl, '.tbl-risultati', [{
      name: 'caption',
      games: x('tr', [
        {
          start: 'td:nth-child(3)',
          locals: 'td:nth-child(4)',
          guests: 'td:nth-child(5)',
          place: x('td:nth-child(7)', 'img[alt=info]@title | substituteUselessTags')
        }
      ]),
    }])

    let games: {
      locals: string,
      guests: string,
      start: string,
      place: string
    }[] = []

    for(let i = 0; i < object.length; i += 1) {
      let championship = object[i]
      if(championship.name == params.data.championshipName) {
        for(let k = 0; k < championship.games.length; k += 1) {
          let game = championship.games[k]

          if(game.locals == params.data.teamName || game.guests == params.data.teamName || params.data.teamName === undefined) {
            games.push({
              locals: game.locals,
              guests: game.guests,
              start: game.start,
              place: game.place
            })
          }
        }
      }
    }

    return games
  }
}