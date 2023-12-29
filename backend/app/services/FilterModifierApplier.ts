import { LucidModel, LucidRow, ModelQueryBuilderContract } from "@ioc:Adonis/Lucid/Orm"

type GroupedWhere = {
  method: 'where',
  kind: 'grouped',
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot',
  children: (ObjectWhere | SimpleWhere | GroupedWhere | InWhere)[]
}

type ObjectWhere = {
  method: 'where',
  kind: 'object',
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot',
  values: Record<string, string | number | Date>
}

type SimpleWhere = {
  method: 'where',
  kind: 'simple',
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot',
  key: string,
  operator?: string,
  value: string | number | Date
}

type InWhere = {
  method: 'where',
  kind: 'in',
  logicalOperator?: 'and' | 'or' | 'andNot' | 'orNot',
  key: string,
  value: (string | number | Date)[]
}

type JoinModifierOnClause = {
  from: string
  operator: string
  to: string
  logicalOperator?: 'and' | 'or'
}

type RightJoinModifier = {
  method: 'join',
  kind: 'right',
  table: string,
  on: JoinModifierOnClause[]
}

type InnerJoinModifier = {
  method: 'join',
  kind: 'inner',
  table: string,
  on: JoinModifierOnClause[]
}

type LeftJoinJsonModifier = {
  method: 'join'
  kind: 'left'
  table: string
  on: JoinModifierOnClause[]
}

export type JoinModifier = LeftJoinJsonModifier | InnerJoinModifier | RightJoinModifier

export type WhereModifier = SimpleWhere | ObjectWhere | GroupedWhere | InWhere

export type Modifier = WhereModifier | JoinModifier

export default class FilterModifierApplier {
  public applyModifiers(query: ModelQueryBuilderContract<LucidModel, LucidRow>, modifiers: Modifier[]): ModelQueryBuilderContract<LucidModel, LucidRow> {
    for(let i = 0; i < modifiers.length; i += 1) {
      let modifier = modifiers[i]
      if(modifier.method === 'where') {
        this.applyWhere(query, modifier)
      } else {
        this.applyJoin(query, modifier)
      }
    }

    return query
  }

  private applyWhere(query: ModelQueryBuilderContract<LucidModel, LucidRow>, modifier: WhereModifier): ModelQueryBuilderContract<LucidModel, LucidRow> {
    if(modifier.kind == 'in') {
      let method: 'whereIn' | 'whereNotIn' | 'orWhereIn' | 'orWhereNotIn' = 'whereIn'
      if (modifier.logicalOperator == 'or') method = 'orWhereIn'
      if (modifier.logicalOperator == 'andNot') method = 'whereNotIn'
      if (modifier.logicalOperator == 'orNot') method = 'orWhereNotIn'

      return query[method](modifier.key ,modifier.value)
    } else {
      let method: 'where' | 'whereNot' | 'orWhere' | 'orWhereNot' = 'where'
      if (modifier.logicalOperator == 'or') method = 'orWhere'
      if (modifier.logicalOperator == 'andNot') method = 'whereNot'
      if (modifier.logicalOperator == 'orNot') method = 'orWhereNot'

      if(modifier.kind == 'simple') {
        if (!!modifier.operator) {
          if(modifier.operator === 'like' || modifier.operator === 'ilike') {
            return query[method](modifier.key, modifier.operator, `%${modifier.value}%`)
          }
          return query[method](modifier.key, modifier.operator, modifier.value)
        }
        else return query[method](modifier.key, modifier.value)
      } else if(modifier.kind == 'object') {
        return query.where(modifier.values)
      } else if(modifier.kind == 'grouped') {
        for(let k = 0; k < modifier.children.length; k += 1) {
          let whereModifier = modifier.children[k]
          query = this.applyWhere(query, whereModifier)
        }
        return query
      } else throw new Error('where kind not supported')
    }
  }

  private applyJoin(query: ModelQueryBuilderContract<LucidModel, LucidRow>, modifier: JoinModifier): ModelQueryBuilderContract<LucidModel, LucidRow> {
    let method: 'join' | 'leftJoin' | 'rightJoin' = 'join'
    if (modifier.kind == 'left') method = 'leftJoin'
    if (modifier.kind == 'right') method = 'rightJoin'

    query[method](modifier.table, (q) => {
      for(let i = 0; i < modifier.on.length; i += 1) {
        const onCluase = modifier.on[i]
        let onMethod: 'on' | 'orOn' = 'on'
        if(onCluase.logicalOperator == 'or') onMethod = 'orOn'

        q[onMethod](onCluase.from, onCluase.operator, onCluase.to)
      }
    })

    return query
  }
}