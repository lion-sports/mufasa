import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { CreateGroupValidator, UpdateGroupValidator } from 'App/Validators/groups'
import { validator } from "@ioc:Adonis/Core/Validator"
import Group from 'App/Models/Group'
import User from 'App/Models/User';
import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import AuthorizationManager from './authorization.manager';
import type { GroupCans } from 'App/Models/Group';
import { withTransaction, type Context, withUser } from './base.manager';

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
        resource: 'Team',
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
        resource: 'Group',
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
        resource: 'Group',
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
        resource: 'Group',
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
        for (let [action, finalValue] of Object.entries(params.data.cans[resource])) {
          if (!existingCans) existingCans = {}
          if (!existingCans[resource]) existingCans[resource] = {}
          existingCans[resource][action] = finalValue
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
        resource: 'Group',
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