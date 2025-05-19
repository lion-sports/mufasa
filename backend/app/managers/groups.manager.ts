import { createGroupValidator } from '#validators/groups/CreateGroupValidator';
import { updateGroupValidator } from '#validators/groups/UpdateGroupValidator';
import Group from '#app/Models/Group'
import User from '#app/Models/User';
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js';
import type { GroupCans } from '#app/Models/Group';
import { withTransaction, type Context, withUser } from './base.manager.js';
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from "@adonisjs/lucid/types/model";
import FilterModifierApplier, { Modifier } from '#services/FilterModifierApplier';

export default class GroupsManager {
  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number,
      perPage?: number,
      filtersBuilder?: {
        modifiers: Modifier[]
      }
    },
    context?: Context
  }): Promise<{ data: ModelObject[], meta: any }> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = Group
      .query({ client: trx })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

    let results = await query
      .where((b) => {
        b.orWhereHas('team', b => {
          b.orWhere(b => {
            return AuthorizationHelpers.userCanInTeamQuery({
              data: {
                query: b,
                user: user,
                resource: 'group',
                action: 'view'
              }
            })
          })
        }).orWhereHas('club', b => {
          b.orWhere(b => {
            return AuthorizationHelpers.userCanInClubQuery({
              data: {
                query: b,
                user: user,
                resource: 'group',
                action: 'view'
              }
            })
          })
        })
      })
      .orderBy('createdAt')
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      name: string,
      convocable?: boolean,
      team?: {
        id: number
      },
      club?: {
        id: number
      },
      cans: GroupCans
    },
    context?: Context
  }): Promise<Group> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    let validatedData = await createGroupValidator.validate(params.data)

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'group_create',
        data: {
          team: params.data.team,
          club: params.data.club
        }
      },
      context: {
        trx
      }
    })

    return await Group.create({
      ...validatedData,
      teamId: validatedData.team?.id,
      clubId: validatedData.club?.id
    }, {
      client: trx
    })
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<Group> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'group_view',
        data: {
          group: {
            id: params.data.id
          }
        }
      },
      context: { trx }
    })

    return await Group
      .query({
        client: params.context?.trx
      })
      .preload('team')
      .where('id', params.data.id)
      .firstOrFail();
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number,
      name?: string,
      convocable?: boolean,
      cans?: GroupCans
    },
    context?: Context
  }): Promise<Group> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await updateGroupValidator.validate(params.data)

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'group_update',
        data: {
          group: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }

    })
    const group = await Group.findOrFail(params.data.id, {
      client: trx
    })

    if (!!params.data.name) group.name = params.data.name
    if (params.data.convocable !== undefined && params.data.convocable !== null) group.convocable = params.data.convocable
    if (!!params.data.cans) {
      let existingCans = group.cans
      for(let [resource, _value] of Object.entries(params.data.cans)) {
        let resourceKey = resource as keyof GroupCans
        for (let [action, finalValue] of Object.entries(params.data.cans[resourceKey] || {})) {
          if (!existingCans) existingCans = {}
          if (!existingCans[resourceKey]) existingCans[resourceKey] = {}
          // @ts-ignore
          existingCans[resourceKey][action] = finalValue
        }
      }

      group.cans = existingCans
    }

    return await group.save()
  }

  @withTransaction
  @withUser
  public async destroy(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'group_destroy',
        data: {
          group: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    const group = await Group.query({ client: trx })
      .where('id', params.data.id)
      .first()

    await group?.delete()
  }
}