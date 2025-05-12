import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { CreateTeamValidator, UpdateTeamValidator } from '#app/Validators/teams/index'
import { validator } from '@adonisjs/validator'
import AuthorizationManager from './authorization.manager.js'
import { Context, withTransaction, withUser } from './base.manager.js'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from '@adonisjs/lucid/types/model'

import Team from '#app/Models/Team'
import User from '#app/Models/User'
import Teammate from '#app/Models/Teammate'
import Sport from '#app/Models/Scout'

export default class TeamsManager {
  constructor() {}

  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number
      perPage?: number
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = Team.query({ client: trx })
      .whereHas('teammates', (teammateQuery) => {
        teammateQuery.whereHas('user', (userQuery) => {
          userQuery.where('id', user.id)
        })
      })
      .preload('teammates', (teammateQuery) => {
        teammateQuery
          .select('teammates.*')
          .leftJoin('users', 'users.id', 'teammates.userId')
          .orderBy(['users.firstname', 'users.lastname'])
          .preload('user')
      })
      .preload('groups')
      .paginate(params.data.page, params.data.perPage)

    const results = await query
    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      name: string
      notes?: string | null
      sport?: Sport
    }
    context?: Context
  }): Promise<Team> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    await validator.validate({
      schema: new CreateTeamValidator().schema,
      data: {
        ...params.data,
        owner: {
          id: user.id,
        },
      },
    })

    const createdTeam = await Team.create(params.data, {
      client: trx,
    })

    await createdTeam.related('owner').associate(user)

    await Teammate.create(
      {
        userId: user.id,
        teamId: createdTeam.id,
      },
      {
        client: trx,
      }
    )

    await createdTeam.load('teammates')
    return createdTeam
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<ModelObject> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'team',
        entities: {
          team: {
            id: params.data.id,
          },
        },
      },
      context: {
        trx,
      },
    })

    return await Team.query({
      client: trx,
    })
      .preload('teammates', (teammateQuery) => {
        teammateQuery
          .select('teammates.*')
          .leftJoin('users', 'users.id', 'teammates.userId')
          .orderBy(['users.firstname', 'users.lastname'])
          .preload('user')
          .preload('group')
      })
      .preload('owner')
      .preload('groups', (groupsBuilder) => {
        groupsBuilder.orderBy('groups.createdAt')
      })
      .preload('invitations', (invitationBuilder) => {
        invitationBuilder
          .where('status', 'pending')
          .preload('invitedBy')
          .preload('invite')
          .preload('group')
      })
      .where('id', params.data.id)
      .firstOrFail()
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      name?: string
      notes?: string
      sport?: Sport
    }
    context?: Context
  }): Promise<Team> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'update',
        resource: 'team',
        entities: {
          team: {
            id: params.data.id,
          },
        },
      },
      context: {
        trx,
      },
    })

    let validatedData = await validator.validate({
      schema: new UpdateTeamValidator().schema,
      data: params.data,
    })

    const team = await Team.findOrFail(params.data.id, {
      client: trx,
    })

    team.merge(validatedData)
    return await team.save()
  }

  @withTransaction
  @withUser
  public async updatePreference(params: {
    data: {
      id: number
      preference: string
      value: any
    }
    context?: Context
  }): Promise<Team> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'update',
        resource: 'team',
        entities: {
          team: {
            id: params.data.id,
          },
        },
      },
      context: {
        trx,
      },
    })

    if (!params.data.preference) throw new Error('preference key must be defined')
    else if (!params.data.value) throw new Error('preference value must be defined')
    else if (!['confirmPresenceByDefault'].includes(params.data.preference)) {
      throw new Error('unknown preference')
    }

    const team = await Team.findOrFail(params.data.id, {
      client: trx,
    })

    if (!team.preferences) team.preferences = {}
    let preferenceKey = params.data.preference as keyof typeof team.preferences
    team.preferences[preferenceKey] = params.data.value

    return await team.save()
  }

  // TODO check if this method is used
  @withTransaction
  @withUser
  public async addUser(params: {
    data: {
      team: {
        id: number
      }
      user: {
        id: number
      }
      group?: {
        id: number
      }
    }
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    if (!params.data.team || !params.data.team.id) throw new Error('team must be defined')
    if (!params.data.user || !params.data.user.id) throw new Error('user must be defined')

    let existingTeammates = await Teammate.query({
      client: trx,
    })
      .where('teamId', params.data.team.id)
      .where('userId', params.data.user.id)

    if (existingTeammates.length != 0) return

    const team = await Team.findOrFail(params.data.team.id, {
      client: trx,
    })

    await team.related('teammateUsers').attach({
      [params.data.user.id]: {
        groupId: params.data.group?.id,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      },
    })
  }

  @withTransaction
  @withUser
  public async removeUser(params: {
    data: {
      team: {
        id: number
      }
      user: {
        id: number
      }
      group?: {
        id: number
      }
    }
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    if (!params.data.team || !params.data.team.id) throw new Error('team must be defined')
    if (!params.data.user || !params.data.user.id) throw new Error('user must be defined')

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'removeUser',
        resource: 'team',
        entities: {
          team: {
            id: params.data.team.id,
          },
          user: {
            id: params.data.user.id,
          },
        },
      },
      context: {
        trx: trx,
      },
    })

    const isTeamOwner = await Team.query({ client: trx })
      .whereHas('owner', (builder) => {
        builder.where('users.id', params.data.user.id)
      })
      .where('teams.id', params.data.team.id)

    if (isTeamOwner.length > 0) {
      throw new Error('cannot exit in owned teams')
    }

    const teammate = await Teammate.query({ client: trx })
      .where('userId', params.data.user.id)
      .where('teamId', params.data.team.id)
      .firstOrFail()

    await teammate.delete()
  }

  @withTransaction
  @withUser
  public async destroy(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'destroy',
        resource: 'team',
        entities: {
          team: {
            id: params.data.id,
          },
        },
      },
      context: {
        trx,
      },
    })

    const results = await Team.query({ client: trx }).where('id', params.data.id)

    await results[0].delete()
  }

  @withTransaction
  @withUser
  public async userBelogsToTeam(params: {
    data: {
      team: { id: number }
      user: { id: number }
    }
    context?: Context
  }) {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    if (!params.data.team || !params.data.team.id) throw new Error('team must be defined')
    if (!params.data.user || !params.data.user.id) throw new Error('user must be defined')

    const userBelongs = await User.query({
      client: trx,
    })
      .whereHas('teams', (builder) => {
        builder.where('teams.id', params.data.team.id)
      })
      .where('users.id', params.data.user.id)

    return userBelongs.length != 0
  }

  @withTransaction
  @withUser
  public async absencesInLatestEvents(params: {
    data: {
      forLastEvents: number
    }
    context?: Context
  }): Promise<
    Record<
      number,
      {
        team: {
          id: number
          name: string
        }
        absences: {
          eventId: number
          absencesNumber: number
        }[]
        presences: {
          eventId: number
          presencesNumber: number
        }[]
      }
    >
  > {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    let teams = await Team.query({ client: trx }).whereHas('teammates', (teammateQuery) => {
      teammateQuery.whereHas('user', (userQuery) => {
        userQuery.where('id', user.id)
      })
    })

    if (teams.length === 0) return []

    let finalResults: Record<
      number,
      {
        team: {
          id: number
          name: string
        }
        absences: {
          eventId: number
          absencesNumber: number
        }[]
        presences: {
          eventId: number
          presencesNumber: number
        }[]
      }
    > = {}

    let results = await db
      .rawQuery<{
        rows: {
          id: number
          teamId: number
          absencesCount: string
          pendingCount: string
          presencesCount: string
        }[]
      }>(
        `SELECT 
      e.id,
      e."teamId",
      COUNT(
        CASE WHEN
          c."confirmationStatus" = 'denied'
          THEN c.id
          ELSE NULL
        END
      ) as "absencesCount",
      COUNT(
        CASE WHEN
          c."confirmationStatus" = 'pasdsdasd'
          THEN c.id
          ELSE NULL
        END
      ) as "pendingCount",
      COUNT(
        CASE WHEN
          c."confirmationStatus" = 'confirmed'
          THEN c.id
          ELSE NULL
        END
      ) as "presencesCount"
    FROM events e
    INNER JOIN convocations c ON c."eventId" = e.id
    WHERE e.id IN (
      SELECT id FROM events 
      WHERE e."teamId" = events."teamId"
      ORDER BY events."start" DESC
      LIMIT :lastEventNumber
    ) AND e."teamId" IN (${teams.map((t) => t.id).join(', ')})
    GROUP BY e.id, e."teamId"`,
        {
          lastEventNumber: params.data.forLastEvents,
        }
      )
      .useTransaction(trx)

    for (let i = 0; i < results.rows.length; i += 1) {
      let row = results.rows[i]
      if (!finalResults[row.teamId])
        finalResults[row.teamId] = {
          team: {
            name: teams.find((t) => t.id == row.teamId)?.name!,
            id: row.teamId,
          },
          absences: [],
          presences: [],
        }

      finalResults[row.teamId].absences.push({
        eventId: row.id,
        absencesNumber: Number(row.absencesCount),
      })

      finalResults[row.teamId].presences.push({
        eventId: row.id,
        presencesNumber: Number(row.presencesCount),
      })
    }

    return finalResults
  }
}
