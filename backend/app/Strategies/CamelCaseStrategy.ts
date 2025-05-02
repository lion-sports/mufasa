import { SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import string from '@adonisjs/core/helpers/string';
import { LucidModel, } from "@adonisjs/lucid/types/model";
import { SimplePaginatorMetaKeys } from '@adonisjs/lucid/types/querybuilder';

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
