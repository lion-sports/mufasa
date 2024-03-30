import User from 'App/Models/User';
import Teammate from 'App/Models/Teammate';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { UpdateValidator } from 'App/Validators/teammates'
import { validator } from "@ioc:Adonis/Core/Validator"
import AuthorizationManager from './authorization.manager'
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import Team from 'App/Models/Team';
import { Context, withTransaction, withUser } from './base.manager';

export type SetRoleParams = {
  data: {
    role: {
      id: number
    }
  },
  context?: Context
}

export type UpdateParams = {
  data: {
    id: number,
    alias?: string,
    roleId?: number
  },
  context?: Context
}

export type AbsencesForTeammates = {
  team: {
    id: number,
    name: string
  }
  teammate: {
    id: number,
    alias: string
  }
  user: {
    email: string
    firstname?: string
    lastname?: string
  }
  absenceCount: number
}[]

export default class TeammatesManager {
  constructor() {
  }

  @withTransaction
  @withUser
  public async update(params: UpdateParams): Promise<Teammate> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new UpdateValidator().schema,
      data: {
        ...params.data
      }
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'update',
        resource: 'Teammate',
        entities: {
          teammate: {
            id: params.data.id
          }
        }
      },
      context: { trx }
    })

    let teammate = await Teammate.query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()

    teammate.merge({
      alias: params.data.alias,
      roleId: params.data.roleId
    })

    return await teammate.save()
  }

  @withTransaction
  @withUser
  public async mostAbsenceForTeammates(params?: {
    context?: Context
  }): Promise<AbsencesForTeammates> {
    const trx = params?.context?.trx as TransactionClientContract
    const user = params?.context?.user as User 

    let query = Team.query({ client: trx })
      .preload('teammates', b => {
        b.preload('user')
      })

    if (!!user) {
      query = query.whereHas('teammates', (teammateQuery) => {
        teammateQuery.whereHas('user', (userQuery) => {
          userQuery.where('id', user.id)
        })
      })
    }

    let teams = await query
    let finalResults: AbsencesForTeammates = []

    if(teams.length === 0) return finalResults

    let results = await Database.rawQuery<{
      rows: {
        userId: number
        teammateId: number
        teamId: number
        absencesCount: string
      }[]
    }>(`SELECT 
        COUNT(c.id) as "absencesCount",
        t."teamId" as "teamId",
        t."userId" as "userId",
        t.id as "teammateId"
      FROM convocations c
      INNER JOIN teammates t ON t.id = c."teammateId"
      WHERE c."confirmationStatus" = 'denied' AND t."teamId" IN (${teams.map((t) => t.id).join(', ')})
      GROUP BY t."teamId", t."userId", t.id
    `).useTransaction(trx)

    

    for(let i = 0; i < results.rows.length; i += 1) {
      let row = results.rows[i]

      let team = teams.find((t) => t.id == row.teamId)
      if(!team) continue
      let teammate = team.teammates.find((tm) => tm.id == row.teammateId)
      if(!teammate) continue

      finalResults.push({
        team: {
          id: team.id,
          name: team.name
        },
        teammate: {
          id: teammate.id,
          alias: teammate.alias
        },
        user: {
          email: teammate.user.email,
          firstname: teammate.user.firstname,
          lastname: teammate.user.lastname
        },
        absenceCount: Number(row.absencesCount)
      })
    }

    return finalResults
  }
}