import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { CreateRoleValidator, UpdateRoleValidator } from 'App/Validators/roles'
import { validator } from "@ioc:Adonis/Core/Validator"
import RoleModel from 'App/Models/Role'
import UserModel from 'App/Models/User';
import type Role from 'App/Models/Role'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import AuthorizationManager from './authorization.manager';
import type { RoleCans } from 'App/Models/Role';

export type Context = {
  user?: {
    id: number
  },
  trx?: TransactionClientContract
}

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

  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100
    if (!params.data.team.id) throw new Error('can only get roles for a specific team')

    const user = await this._getUserFromContext(params.context)
    if (!user) if (!user) throw new Error('user must be defined to get roles')

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'Team',
        entities: {
          team: params.data.team
        }
      }
    })

    let results = await RoleModel
      .query()
      .where('teamId', params.data.team.id)
      .orderBy('createdAt')
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  public async create(params: CreateParams): Promise<Role> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to create team')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
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
        }
      })

      // check if role already exists
      let existingRole = await RoleModel.query()
        .where('name', params.data.name)
        .whereHas('team', builder => {
          builder.where('teams.id', params.data.team.id)
        })

      if (existingRole.length != 0) throw new Error('role already exists')

      const createdRole = await RoleModel.create({
        name: params.data.name,
        cans: params.data.cans,
        convocable: params.data.convocable,
        teamId: params.data.team.id
      }, {
        client: trx
      })

      if (!params.context?.trx) await trx.commit()
      return createdRole
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async get(params: GetParams): Promise<ModelObject> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to get a role')

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
      }
    })

    let results = await RoleModel
      .query({
        client: params.context?.trx
      })
      .preload('team')
      .where('id', params.data.id);

    return results[0]
  }

  public async update(params: UpdateParams): Promise<Role> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to update a role')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
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
          trx: trx
        }
      })

      const role = await RoleModel.findOrFail(params.data.id, {
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

      const results = await role.save()
      if (!params.context?.trx) await trx.commit()
      return results
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async destroy(params: DestroyParams): Promise<void> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to destroy a team')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
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
          trx: trx
        }
      })

      const results = await RoleModel.query({ client: trx }).where('id', params.data.id)

      await results[0].delete()
      if (!params.context?.trx) await trx.commit()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  private async _getUserFromContext(context?: Context) {
    if (!!context?.user) {
      return await UserModel.query().where('id', context.user.id).first()
    } else {
      const ctx = HttpContext.get()
      return ctx?.auth?.user
    }
  }
}