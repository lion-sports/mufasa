import { CreateGroupValidator, UpdateGroupValidator } from '#app/Validators/groups/index'
import { validator } from "@adonisjs/validator"
import Group from '#app/Models/Group'
import User from '#app/Models/User';
import AuthorizationManager, { Action } from './authorization.manager.js';
import type { GroupCans } from '#app/Models/Group';
import { withTransaction, type Context, withUser } from './base.manager.js';
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from "@adonisjs/lucid/types/model";

export type CreateParams = {
  data: {
    name: string,
    convocable?: boolean,
    team: {
      id: number
    },
    cans: GroupCans
  },
  context?: Context
}

export type UpdateParams = {
  data: {
    id: number,
    name?: string,
    convocable?: boolean,
    cans?: GroupCans
  },
  context?: Context
}

export type ListParams = {
  data: {
    page?: number,
    perPage?: number,
    team: {
      id: number
    }
  },
  context?: Context
}

export type GetParams = {
  data: {
    id: number
  },
  context?: Context
}

export type DestroyParams = {
  data: {
    id: number
  },
  context?: Context
}

export default class GroupsManager {
  constructor() {
  }

  @withTransaction
  @withUser
  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100
    if (!params.data.team.id) throw new Error('can only get groups for a specific team')

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'team',
        entities: {
          team: params.data.team
        }
      },
      context: { trx }
    })

    let results = await Group
      .query({ client: trx })
      .where('teamId', params.data.team.id)
      .orderBy('createdAt')
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: CreateParams): Promise<Group> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new CreateGroupValidator().schema,
      data: {
        ...params.data,
      }
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'create',
        resource: 'group',
        entities: {
          team: params.data.team
        }
      },
      context: {
        trx
      }
    })

    return await Group.updateOrCreate({
      name: params.data.name,
      teamId: params.data.team.id
    }, {
      cans: params.data.cans,
      convocable: params.data.convocable,
      teamId: params.data.team.id
    }, {
      client: trx
    })
  }

  @withTransaction
  @withUser
  public async get(params: GetParams): Promise<Group> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'group',
        entities: {
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
  public async update(params: UpdateParams): Promise<Group> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new UpdateGroupValidator().schema,
      data: params.data
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'update',
        resource: 'group',
        entities: {
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
  public async destroy(params: DestroyParams): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'destroy',
        resource: 'group',
        entities: {
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