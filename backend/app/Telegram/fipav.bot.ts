import TelegramBot from 'node-telegram-bot-api'
import FipavScraper from './fipav.scraper.js'
import app from '@adonisjs/core/services/app'

export default class FipavBot {
  public bot: TelegramBot
  private menus: Record<number, string[]> = {}
  private contexts: Record<number, Record<string, any>> = {}

  private messages = {
    welcome: `
Ciao, questo è un BOT per consultare il sito di fipavpiacenza.

Cosa vuoi fare?`,
    teamNameQuestion: `Perfetto, scrivi il nome del tuo team`,
    workingGamelist: `Ok, sto lavorando per esaudire la tua richiesta 😬`,
    choseChampionship: `Scegli il campionato`,
    choseTeam: `Scegli la squadra`,
    somethingWentWrong: `Qualcosa è andato storto, mi spiace 😥`,
    noGameForChampionshipAndTeam: `Nessuna partita al momento`
  }

  constructor(params: {
    token: string,
    webHookUrl?: string
  }) {
    if(app.inDev) {
      this.bot = new TelegramBot(params.token, { polling: true })

      this.bot.on('message', (message) => {
        if (message.text == 'gamelist') {
          this.handleGamelistMessage({ data: { message } })
        } else if (!!this.menus[message.chat.id] && this.menus[message.chat.id].length > 0 && this.menus[message.chat.id][this.menus[message.chat.id].length - 1] == 'gamelist') {
          this.handleChampionshipChoiceMessage({ data: { message } })
        } else if (!!this.menus[message.chat.id] && this.menus[message.chat.id].length > 0 && this.menus[message.chat.id][this.menus[message.chat.id].length - 1] == 'championship') {
          this.handleTeamChoiceMessage({ data: { message } })
        } else {
          this.handleGenericMessage({ data: { message } })
        }
      })
    } else if (!!params.webHookUrl) {
      this.bot = new TelegramBot(params.token, {
        webHook: true
      })

      this.bot.setWebHook(params.webHookUrl)

      this.bot.on('message', (message) => {
        if(message.text == 'gamelist') {
          this.handleGamelistMessage({ data: { message } })
        } else if (!!this.menus[message.chat.id] && this.menus[message.chat.id].length > 0 && this.menus[message.chat.id][this.menus[message.chat.id].length - 1] == 'gamelist') {
          this.handleChampionshipChoiceMessage({ data: { message }})
        } else if (!!this.menus[message.chat.id] && this.menus[message.chat.id].length > 0 && this.menus[message.chat.id][this.menus[message.chat.id].length - 1] == 'championship') {
          this.handleTeamChoiceMessage({ data: { message } })
        } else {
          this.handleGenericMessage({ data: { message } })
        }
      })
    } else {
      console.warn('fipav bot not started')
    }
  }

  private async handleGamelistMessage(params: {
    data: {
      message: TelegramBot.Message
    }
  }): Promise<void> {
    if (!this.menus[params.data.message.chat.id]) this.menus[params.data.message.chat.id] = []
    this.menus[params.data.message.chat.id].push('gamelist')

    await this.bot.sendChatAction(params.data.message.chat.id, 'typing')

    let scraper = new FipavScraper()
    let results = await scraper.getAvailableTeamsAndChampionship()

    await this.bot.sendMessage(params.data.message.chat.id, this.messages.choseChampionship, {
      reply_markup: {
        keyboard: [
          ...results.championships.map((c): [{ text: string }] => {
            return [
              {
                text: c.name
              }
            ]
          })
        ]
      }
    })
  }

  private async handleChampionshipChoiceMessage(params: {
    data: {
      message: TelegramBot.Message
    }
  }): Promise<void> {
    this.menus[params.data.message.chat.id].push('championship')
    let championshipName = params.data.message.text
    if (!championshipName) {
      await this.bot.sendMessage(params.data.message.chat.id, this.messages.somethingWentWrong)
      delete this.menus[params.data.message.chat.id]

      await this.sendMainMenu(params)
    } else {
      await this.bot.sendChatAction(params.data.message.chat.id, 'typing')

      if (!this.contexts[params.data.message.chat.id]) this.contexts[params.data.message.chat.id] = {}
      this.contexts[params.data.message.chat.id]['championshipName'] = championshipName

      let scraper = new FipavScraper()
      let results = await scraper.getAvailableTeamsAndChampionship()

      let championship = results.championships.find((c) => c.name.toLowerCase() == championshipName!.toLowerCase())

      if (!championship) {
        await this.bot.sendMessage(params.data.message.chat.id, this.messages.somethingWentWrong)
        delete this.menus[params.data.message.chat.id]
      } else {
        await this.bot.sendMessage(params.data.message.chat.id, this.messages.choseTeam, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: 'TUTTE LE PARTITE'
                }
              ],
              ...championship.teams.map((t): [{ text: string }] => {
                return [
                  {
                    text: t
                  }
                ]
              }).sort()
            ]
          }
        })
      }
    }
  }

  private async handleTeamChoiceMessage(params: {
    data: {
      message: TelegramBot.Message
    }
  }): Promise<void> {
    let teamName = params.data.message.text
    if (!teamName) {
      await this.bot.sendMessage(params.data.message.chat.id, this.messages.somethingWentWrong)
      delete this.menus[params.data.message.chat.id]

      await this.sendMainMenu(params)
    } else {
      let championshipName = this.contexts[params.data.message.chat.id]['championshipName']
      await this.bot.sendChatAction(params.data.message.chat.id, 'typing')

      let scraper = new FipavScraper()
      let results
      if (teamName == 'TUTTE LE PARTITE') {
        results = await scraper.findGames({
          data: {
            championshipName: championshipName
          }
        })
      } else {
        results = await scraper.findGames({
          data: {
            teamName: teamName,
            championshipName: championshipName
          }
        })
      }

      if (results.length == 0) {
        await this.bot.sendMessage(params.data.message.chat.id, this.messages.noGameForChampionshipAndTeam)
      } else {
        await this.bot.sendMessage(params.data.message.chat.id, results.map((game) => {
          return `${game.locals} vs ${game.guests}\n${game.start}\n${game.place}`
        }).join('\n\n'))
      }

      delete this.menus[params.data.message.chat.id]
      await this.sendMainMenu(params)
    }
  }

  private async handleGenericMessage(params: {
    data: {
      message: TelegramBot.Message
    }
  }): Promise<void> {
    await this.sendMainMenu(params)
    delete this.menus[params.data.message.chat.id]
  }


  private async sendMainMenu(params: {
    data: {
      message: TelegramBot.Message
    }
  }) {
    await this.bot.sendMessage(params.data.message.chat.id, this.messages.welcome, {
      reply_markup: {
        keyboard: [
          [
            {
              text: 'gamelist'
            },
          ],
        ]
      }
    })
  }
}