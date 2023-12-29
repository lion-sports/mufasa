import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { string } from '@ioc:Adonis/Core/Helpers'
import { SimplePaginatorMetaKeys } from '@ioc:Adonis/Lucid/Database'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { createHash } from 'crypto'
import { base64 } from '@poppinss/utils/build/helpers'

process.setMaxListeners(100)

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // const { default: Bull } = await import('@ioc:Breeze')

    // Bull.add(new GenerateReportFiles().key, {}, {
    //   repeat: {
    //     every: Env.get('GENERATE_REPORTS_EVERY_MS') || 30000,
    //   }
    // })
  }

  public async ready() {
    const Db = this.app.container.use('Adonis/Lucid/Database')
    const Orm = this.app.container.use('Adonis/Lucid/Orm')

    if (this.app.environment === 'web' || this.app.environment === 'test') {
      let { default: Ws } = await import('../app/services/Ws')
      let { default: Database } = await import('@ioc:Adonis/Lucid/Database')

      Ws.boot()

      Ws.io.use(async (socket, next) => {
        let token: string | undefined = socket.handshake.auth.token
        if (!token) {
          next(new Error('token not present'))
          return
        }

        let parts = token.split('.')

        if (parts.length !== 2) {
          next(new Error('token not valid'))
          return
        }

        const tokenId = base64.urlDecode(parts[0], undefined, true)
        if (!tokenId) {
          next(new Error('token not valid'))
          return
        }

        if (parts[1].length !== 60) {
          next(new Error('token not valid'))
          return
        }

        let tokenValue: string = createHash('sha256').update(parts[1]).digest('hex')

        let tokenRow = await Database
          .query()
          .from('api_tokens')
          .where('id', tokenId)
          .first()

        if (!tokenRow || tokenRow.token !== tokenValue) {
          next(new Error("not authorized"))
          return
        }

        next()
      })
    }

    // @ts-ignore
    class CamelCaseNameStrategy extends Orm.SnakeCaseNamingStrategy {
      public tableName(model: LucidModel) {
        return string.pluralize(string.snakeCase(model.name))
      }

      public columnName(_model: LucidModel, attributeName: string): string {
        return string.camelCase(attributeName)
      }

      public serializedName(_model: LucidModel, attributeName: string): string {
        return string.camelCase(attributeName)
      }

      paginationMetaKeys(): SimplePaginatorMetaKeys {
        return {
          total: 'total',
          perPage: 'perPage',
          currentPage: 'currentPage',
          lastPage: 'lastPage',
          firstPage: 'firstPage',
          firstPageUrl: 'firstPageUrl',
          lastPageUrl: 'lastPageUrl',
          nextPageUrl: 'nextPageUrl',
          previousPageUrl: 'previousPageUrl',
        }
      }
    }
  
    Db.SimplePaginator.namingStrategy = new CamelCaseNameStrategy()
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
