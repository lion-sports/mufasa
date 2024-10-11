import { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'

export type WhereFilterValue = string | number | Date | boolean

type GroupedWhere = {
  method: 'where'
  kind: 'grouped'
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot'
  children: (ObjectWhere | SimpleWhere | GroupedWhere | InWhere | ColumnWhere | JsonSupersetWhere | InBuilderWhere | NullWhere)[]
}

type ObjectWhere = {
  method: 'where'
  kind: 'object'
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot'
  values: Record<string, WhereFilterValue>
}

type SimpleWhere = {
  method: 'where'
  kind: 'simple'
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot'
  key: string
  operator?: string
  value: WhereFilterValue
}

type ColumnWhere = {
  method: 'where',
  kind: 'column',
  logicalOperator?: 'and' | 'or',
  key: string,
  operator?: string,
  column: string
}

type NullWhere = {
  method: 'where'
  kind: 'null'
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot'
  key: string
}

type InWhere = {
  method: 'where'
  kind: 'in'
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot'
  key: string
  value: (WhereFilterValue)[]
}

type InBuilderWhere = {
  method: 'where',
  kind: 'inBuilder',
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot',
  key: string,
  children: (ObjectWhere | SimpleWhere | GroupedWhere | InWhere | ColumnWhere | JsonSupersetWhere | InBuilderWhere | NullWhere | SelectModifier)[]
}

type JsonSupersetWhere = {
  method: 'where',
  kind: 'jsonSuperset',
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot',
  key: string,
  value: Object
}

type JoinModifierOnClause = {
  from: string
  operator: string
  to: string
  logicalOperator?: 'and' | 'or'
}

type RightJoinModifier = {
  method: 'join'
  kind: 'right'
  table: string
  on: JoinModifierOnClause[]
}

type InnerJoinModifier = {
  method: 'join'
  kind: 'inner'
  table: string
  on: JoinModifierOnClause[]
}

type LeftJoinJsonModifier = {
  method: 'join'
  kind: 'left'
  table: string
  on: JoinModifierOnClause[]
}

type SelectModifier = {
  method: 'select'
  fields: string | string[]
}

type FromModifier = {
  method: 'from'
  from: string
}

type OrderByModifier = {
  method: 'orderBy'
  sortBy: string
  sortDirection: "asc" | "desc"
}

export type JoinModifier = LeftJoinJsonModifier | InnerJoinModifier | RightJoinModifier

export type WhereModifier = SimpleWhere | ObjectWhere | GroupedWhere | InWhere | NullWhere | InBuilderWhere | ColumnWhere | JsonSupersetWhere

export type WhereModifierWithKey = SimpleWhere | InWhere | NullWhere | InBuilderWhere | ColumnWhere | JsonSupersetWhere

export type Modifier = WhereModifier | JoinModifier | SelectModifier | FromModifier | OrderByModifier

export default class FilterModifierApplier {
  public applySelect(
    query: ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract,
    modifier: SelectModifier
  ): ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract {
    if (typeof modifier.fields === "string") {
      return query.select(modifier.fields)
    } else {
      return query.select(...modifier.fields)
    }
  }

  public applyFrom(
    query: ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract,
    modifier: FromModifier
  ): ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract {
    return query.from(modifier.from)
  }

  public applyOrderBy(
    query: ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract,
    modifier: OrderByModifier
  ): ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract {
    return query.orderBy(modifier.sortBy, modifier.sortDirection)
  }

  public applyModifiers(
    query: ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract,
    modifiers: Modifier[]
  ): ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract {
    for (let i = 0; i < modifiers.length; i += 1) {
      let modifier = modifiers[i]
      if (modifier.method === 'where') {
        this.applyWhere(query, modifier)
      } else if (modifier.method === "join") {
        this.applyJoin(query, modifier)
      } else if (modifier.method === "select") {
        this.applySelect(query, modifier)
      } else if (modifier.method === "from") {
        this.applyFrom(query, modifier)
      } else if (modifier.method === "orderBy") {
        this.applyOrderBy(query, modifier)
      }
    }

    return query
  }

  private applyWhere(
    query: ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract,
    modifier: WhereModifier
  ): ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract {
    if (modifier.kind == 'in') {
      let method: 'whereIn' | 'whereNotIn' | 'orWhereIn' | 'orWhereNotIn' = 'whereIn'
      if (modifier.logicalOperator == 'or') method = 'orWhereIn'
      if (modifier.logicalOperator == 'andNot') method = 'whereNotIn'
      if (modifier.logicalOperator == 'orNot') method = 'orWhereNotIn'

      return query[method](modifier.key, modifier.value)
    } else if (modifier.kind == 'inBuilder') {
      let method: 'whereIn' | 'whereNotIn' | 'orWhereIn' | 'orWhereNotIn' = 'whereIn'
      if (modifier.logicalOperator == 'or') method = 'orWhereIn'
      if (modifier.logicalOperator == 'andNot') method = 'whereNotIn'
      if (modifier.logicalOperator == 'orNot') method = 'orWhereNotIn'

      //TODO: b:any is a hack, need to fix this
      query = query[method]([modifier.key], ((b: any) => {
        for (let k = 0; k < modifier.children.length; k += 1) {
          let currentModifier = modifier.children[k]
          if (currentModifier.method == 'select') {
            this.applySelect(b, currentModifier)
          } else {
            this.applyWhere(b, currentModifier)
          }
        }
        return b
      }))
      return query
    } else if (modifier.kind == 'null') {
      let method: 'whereNull' | 'whereNotNull' | 'orWhereNull' | 'orWhereNotNull' = 'whereNull'
      if (modifier.logicalOperator == 'or') method = 'orWhereNull'
      if (modifier.logicalOperator == 'andNot') method = 'whereNotNull'
      if (modifier.logicalOperator == 'orNot') method = 'orWhereNotNull'
      return query[method](modifier.key)
    } else if (modifier.kind == 'jsonSuperset') {
      let method: 'whereJsonSuperset' | 'orWhereJsonSuperset' = 'whereJsonSuperset'
      if (modifier.logicalOperator == 'or') method = 'orWhereJsonSuperset'
      return query[method](modifier.key, modifier.value)
    } else if (modifier.kind == "column") {
      let method: 'whereColumn' | 'orWhereColumn' = 'whereColumn'
      if (modifier.logicalOperator == 'or') method = 'orWhereColumn'
      if (!!modifier.operator)
        return query[method](modifier.key, modifier.operator, modifier.column)
      else
        return query[method](modifier.key, modifier.column)
    } else {
      let method: 'where' | 'whereNot' | 'orWhere' | 'orWhereNot' = 'where'
      if (modifier.logicalOperator == 'or') method = 'orWhere'
      if (modifier.logicalOperator == 'andNot') method = 'whereNot'
      if (modifier.logicalOperator == 'orNot') method = 'orWhereNot'

      if (modifier.kind == 'simple') {
        if (!!modifier.operator) {
          if (modifier.operator === 'like' || modifier.operator === 'ilike') {
            return query[method](modifier.key, modifier.operator, `%${modifier.value}%`)
          }
          return query[method](modifier.key, modifier.operator, modifier.value)
        } else return query[method](modifier.key, modifier.value)
      } else if (modifier.kind == 'object') {
        return query.where(modifier.values)
      } else if (modifier.kind == 'grouped') {
        query = query.where(b => {
          for (let k = 0; k < modifier.children.length; k += 1) {
            let whereModifier = modifier.children[k]
            this.applyWhere(b, whereModifier)
          }
        })
        return query
      } else throw new Error('where kind not supported')
    }
  }

  private applyJoin(
    query: ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract,
    modifier: JoinModifier
  ): ModelQueryBuilderContract<LucidModel, LucidRow> | DatabaseQueryBuilderContract {
    let method: 'join' | 'leftJoin' | 'rightJoin' = 'join'
    if (modifier.kind == 'left') method = 'leftJoin'
    if (modifier.kind == 'right') method = 'rightJoin'

    query[method](modifier.table, (q) => {
      for (let i = 0; i < modifier.on.length; i += 1) {
        const onCluase = modifier.on[i]
        let onMethod: 'on' | 'orOn' = 'on'
        if (onCluase.logicalOperator == 'or') onMethod = 'orOn'

        q[onMethod](onCluase.from, onCluase.operator, onCluase.to)
      }
    })

    return query
  }
}
