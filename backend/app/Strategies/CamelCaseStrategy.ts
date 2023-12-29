import { string } from '@ioc:Adonis/Core/Helpers'
import { SnakeCaseNamingStrategy, LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { SimplePaginatorMetaKeys } from '@ioc:Adonis/Lucid/Database'

export class CamelCaseNameStrategy extends SnakeCaseNamingStrategy {
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