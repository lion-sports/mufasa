import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { CreateRoleValidator, UpdateRoleValidator } from 'App/Validators/roles'
import { validator } from "@ioc:Adonis/Core/Validator"
import Role from 'App/Models/Role'
import User from 'App/Models/User';
import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import AuthorizationManager from './authorization.manager';
import type { RoleCans } from 'App/Models/Role';
import { withTransaction, type Context, withUser } from './base.manager';

export type CreateParams = {
  data: {
    name: string,
    convocable?: boolean,
    team: {
      id: number
    },
    cans: RoleCans
  },
  context?: Context
}

export type UpdateParams = {
  data: {
    id: number,
    name?: string,
    convocable?: boolean,
    cans?: RoleCans
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

export default class RolesManager {
  constructor() {
  }

  @withTransaction
  @withUser
  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100
    if (!params.data.team.id) throw new Error('can only get roles for a specific team')

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

    let results = await Role
      .query({ client: trx })
      .where('teamId', params.data.team.id)
      .orderBy('createdAt')
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: CreateParams): Promise<Role> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new CreateRoleValidator().schema,
      data: {
        ...params.data,
      }
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'create',
        resource: 'Role',
        entities: {
          team: params.data.team
        }
      },
      context: {
        trx
      }
    })

    return await Role.updateOrCreate({
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
  public async get(params: GetParams): Promise<Role> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'Role',
        entities: {
          role: {
            id: params.data.id
          }
        }
      },
      context: { trx }
    })

    return await Role
      .query({
        client: params.context?.trx
      })
      .preload('team')
      .where('id', params.data.id)
      .firstOrFail();
  }

  @withTransaction
  @withUser
  public async update(params: UpdateParams): Promise<Role> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new UpdateRoleValidator().schema,
      data: params.data
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'update',
        resource: 'Role',
        entities: {
          role: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    const role = await Role.findOrFail(params.data.id, {
      client: trx
    })

    if (!!params.data.name) role.name = params.data.name
    if (params.data.convocable !== undefined && params.data.convocable !== null) role.convocable = params.data.convocable
    if (!!params.data.cans) {
      let existingCans = role.cans
      for(let [resource, _value] of Object.entries(params.data.cans)) {
        for (let [action, finalValue] of Object.entries(params.data.cans[resource])) {
          if (!existingCans) existingCans = {}
          if (!existingCans[resource]) existingCans[resource] = {}
          existingCans[resource][action] = finalValue
        }
      }

      role.cans = existingCans
    }

    return await role.save()
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
        resource: 'Role',
        entities: {
          role: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    const role = await Role.query({ client: trx })
      .where('id', params.data.id)
      .first()

    await role?.delete()
  }
}