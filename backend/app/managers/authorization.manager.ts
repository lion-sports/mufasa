import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { string } from '@ioc:Adonis/Core/Helpers'

export type Resource =
  'User' |
  'Role' 

export type Action =
  'manage' |
  'view' 
export type Entities = {
  // team?: Pick<Team, 'id'>,
}

type CanFunction = (params: {
  actor: User,
  resource: Resource,
  action: Action,
  entities: Entities
}, context?: {
  trx?: TransactionClientContract
}) => Promise<boolean>


type CanParameters = {
  data: {
    actor: User,
    resource: Resource,
    action: Action,
    entities: Entities
  },
  context?: {
    trx?: TransactionClientContract
  }
}

type orCanParameters = {
  data: {
    actor: User,
    permissions: {
      resource: Resource,
      action: Action,
    }[],
    entities: Entities
  },
  context?: {
    trx?: TransactionClientContract
  }
}

export default class AuthorizationManager {
  static mapper: {
      [resource in Resource]?: {
        [action in Action]?: CanFunction
      }
    } = {
      User: {
        manage: AuthorizationManager._canFunction,
        view: AuthorizationManager._canFunction
      },
      Role: {
        manage: AuthorizationManager._canFunction
      }
    }

  constructor() { }

  public static async can(
    { data, context }: CanParameters
  ) {
    let canFunction = this.mapper[data.resource]?.[data.action] ?? AuthorizationManager._generalCanFunction
    return await canFunction({
      actor: data.actor,
      resource: data.resource,
      action: data.action,
      entities: data.entities
    }, context)
  }

  public static async orCan(
    { data, context }: orCanParameters
  ) {
    let generalCan: boolean = false
    for (let i = 0; i < data.permissions.length; i += 1) {
      let singleCan: boolean = await this.can({
        data: {
          actor: data.actor,
          action: data.permissions[i].action,
          resource: data.permissions[i].resource,
          entities: data.entities
        },
        context: context
      })
      generalCan = generalCan || singleCan
    }

    return generalCan
  }

  public static async canOrFail(params: CanParameters): Promise<boolean> {
    let results = await AuthorizationManager.can(params)
    if (!this.mapper[params.data.resource]?.[params.data.action] || !results) throw new Error(`cannot ${params.data.action} on resource ${params.data.resource} with current user`)
    else return true
  }

  public static async orCanOrFail(params: orCanParameters): Promise<boolean> {
    let results = await AuthorizationManager.orCan(params)
    if (!results) throw new Error(`cannot ${params.data.permissions.map((e) => e.action).join(', ')} on resource ${params.data.permissions.map((e) => e.resource).join(', ') } with current user`)
    else return true
  }

  private static async _generalCanFunction(
    _params: { actor: User, resource: Resource, action: Action, entities: Entities },
    _context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    return false
  }

  private static async _canFunction(
    params: { actor: User, resource: Resource, action: Action, entities: Entities },
    context?: { trx?: TransactionClientContract }
  ): Promise<boolean> {
    if(!params.actor) return false
    
    let results = await User.query({ client: context?.trx })
      .where('id', params.actor.id)
      .where(b => {
        b.whereHas('role', roleBuilder => {
          roleBuilder.whereHas('permissions', permissionBuilder => {
            permissionBuilder.where('action', params.action)
              .where('resource', string.camelCase(params.resource))
          })
        }).orWhere('system', true)
      })

    return results.length > 0
  }

}