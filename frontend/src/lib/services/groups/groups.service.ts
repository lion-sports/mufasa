import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'

export type Group = {
	id: number
	name: string
	convocable: boolean
	cans?: DeepPartial<GroupedPermissions>
	createdAt: Date
	updatedAt: Date
}

export type PaginatedGroups = {
	data: Group[]
	meta: PaginationData
}

export type GroupedPermissions<Type = boolean> = {
  team: {
    update: Type,
    destroy: Type,
    view: Type,
    invite: Type,
    removeUser: Type,
    create: Type
  },
  club: {
    update: Type
    destroy: Type
    view: Type,
    invite: Type
  },
  teammate: {
    update: Type,
  },
  invitation: {
    accept: Type,
    reject: Type,
    discard: Type,
  },
  group: {
    create: Type,
    update: Type,
    destroy: Type,
    view: Type,
  },
  event: {
    create: Type,
    update: Type,
    convocate: Type,
    destroy: Type,
  },
  shirt: {
    create: Type,
    update: Type,
    view: Type,
    destroy: Type,
  },
  scout: {
    manage: Type,
    view: Type,
  },
  scoringSystem: {
    view: Type,
    manage: Type,
    create: Type,
  },
  convocation: {
    confirm: Type,
    deny: Type,
  },
  widgetSetting: {
    set: Type
  }
}

const EMPTY_GROUPED_PERMISSIONS: GroupedPermissions = {
	team: {
		update: false,
		destroy: false,
		view: false,
		invite: false,
		removeUser: false,
    create: false
	},
	teammate: {
		update: false
	},
	invitation: {
		accept: false,
		reject: false,
		discard: false
	},
	group: {
		create: false,
		update: false,
		destroy: false,
		view: false
	},
  club: {
    invite: false,
    update: false,
    destroy: false,
    view: false
  },
	event: {
		create: false,
		update: false,
		convocate: false,
		destroy: false
	},
	shirt: {
		create: false,
		update: false,
		view: false,
		destroy: false
	},
	scout: {
		manage: false,
		view: false
	},
	scoringSystem: {
		view: false,
		manage: false,
		create: false
	},
	convocation: {
		confirm: false,
		deny: false
	},
  widgetSetting: {
    set: false
  }
}

const EMPTY_TEAM_GROUPED_PERMISSIONS: {
  [resource in Resource]?: {
    [action in Action<resource>]?: boolean
  }
} = {
  team: {
    update: false,
    invite: false,
    removeUser: false
  },
  teammate: {
    update: false
  },
  invitation: {
    accept: false,
    reject: false,
    discard: false
  },
  group: {
    create: false,
    update: false,
    destroy: false,
    view: false
  },
  event: {
    create: false,
    update: false,
    convocate: false,
    destroy: false
  },
  shirt: {
    create: false,
    update: false,
    view: false,
    destroy: false
  },
  scout: {
    manage: false,
    view: false
  },
  scoringSystem: {
    view: false,
    manage: false,
    create: false
  },
  convocation: {
    confirm: false,
    deny: false
  }
}

const EMPTY_CLUB_GROUPED_PERMISSIONS: {
  [resource in Resource]?: {
    [action in Action<resource>]?: boolean
  }
} = {
  team: {
    create: false,
    view: false
  },
  club: {
    update: false,
    destroy: false,
    view: false,
    invite: false
  },
  invitation: {
    accept: false,
    reject: false,
    discard: false
  },
  group: {
    create: false,
    update: false,
    destroy: false,
    view: false
  },
  shirt: {
    create: false,
    update: false,
    view: false,
    destroy: false
  },
}

export type Resource = keyof GroupedPermissions
export type Action<R extends Resource> = keyof GroupedPermissions[R]
export const RESOURCES = Object.keys(EMPTY_GROUPED_PERMISSIONS) as Resource[]

export const RESOURCES_ICONS: {
  [Key in Resource]?: string
} = {
  team: 'mdi-account-multiple',
  teammate: 'mdi-handball',
  invitation: 'mdi-email',
  group: 'mdi-lock',
  club: 'mdi-domain',
  event: 'mdi-calendar',
  shirt: 'mdi-tshirt-crew',
  scout: 'mdi-developer-board',
  scoringSystem: 'mdi-scoreboard',
  convocation: 'mdi-format-list-bulleted'
}

export default class GroupsService extends FetchBasedService {
	public async create(params: { 
    name?: string
    convocable?: boolean
    cans?: any
    club?: {
      id: number
    },
    team?: {
      id: number
    }
  }): Promise<Group> {
		if (!params.name) throw new Error('name must be defined')

		let response = await this.client.post({
			url: '/groups',
			body: params
		})

		return response
	}

	public async list(params: {
		page?: number
		perPage?: number
    filtersBuilder?: FilterBuilder
	}): Promise<PaginatedGroups> {
		if (!params.page) params.page = 1
		if (!params.perPage) params.perPage = 300

		let response = await this.client.get({
			url: `/groups`,
			params: {
				page: params.page,
				perPage: params.perPage,
        filtersBuilder: params.filtersBuilder?.toJson()
			}
		})

		return response
	}

	public async show(params: { id: number }): Promise<Group> {
		let response = await this.client.get({
			url: '/groups/' + params.id
		})

		return response
	}

	public async update(params: {
		id: number
		name?: string
		convocable?: boolean
		cans?: DeepPartial<GroupedPermissions>
	}): Promise<Group> {
		let response = await this.client.put({
			url: '/groups/' + params.id,
			body: params
		})

		return response
	}

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/groups/' + params.id
		})

		return response
	}

	public static getActionsForResource(resource: Resource): string[] {
		return Object.keys(EMPTY_GROUPED_PERMISSIONS[resource])
	}

	public static translateResource(resource: Resource): string {
		let translationMapping: Record<Resource, string> = {
			team: 'Team',
			invitation: 'Inviti',
			event: 'Eventi',
			convocation: 'Convocazioni',
			group: 'Gruppi',
			teammate: 'Giocatore',
			scout: 'Scout',
			scoringSystem: 'Sistemi di punteggio',
			shirt: 'Maglie',
      club: 'Club',
      widgetSetting: 'Impostazioni widget'
		}
		return translationMapping[resource]
	}

	public static translateActions(action: string): string {
		let translationMapping: {
			[key: string]: string
		} = {
			update: 'Modificare',
			destroy: 'Eliminare',
			create: 'Creare',
			view: 'Visualizzare',
			invite: 'Invitare',
			removeUser: 'Rimuovere utenti',
			accept: 'Accettare',
			reject: 'Rifiutare',
			discard: 'Annullare',
			confirm: 'Confermare',
			deny: 'Non confermare',
			convocate: 'Convocare',
			manage: 'Gestire',
      set: 'Impostare'
		}
		return translationMapping[action]
	}

  public static isTeamPermission<R extends Resource>(params: {
    resource: R,
    action?: Action<R>
  }): boolean {
    if(!!params.action)
      return EMPTY_TEAM_GROUPED_PERMISSIONS[params.resource]?.[params.action] !== undefined
    else 
      return EMPTY_TEAM_GROUPED_PERMISSIONS[params.resource] !== undefined
  }

  public static isClubPermission<R extends Resource>(params: {
    resource: R,
    action?: Action<R>
  }): boolean {
    if(!!params.action)
      return EMPTY_CLUB_GROUPED_PERMISSIONS[params.resource]?.[params.action] !== undefined
    else 
      return EMPTY_CLUB_GROUPED_PERMISSIONS[params.resource] !== undefined
  }

	public static getGroupedPermissions(params: {
		owner: boolean
		group?: {
			cans?: DeepPartial<GroupedPermissions>
		}
	}): GroupedPermissions {
		let basePermissions = {
			...EMPTY_GROUPED_PERMISSIONS
		}

		for (const resource of Object.keys(basePermissions) as Resource[]) {
			for (const action of Object.keys(basePermissions[resource]) as Action<typeof resource>[]) {
				// @ts-ignore
				basePermissions[resource][action] =
					!!params.owner || !!params.group?.cans?.[resource]?.[action]
			}
		}

		return basePermissions
	}
}
