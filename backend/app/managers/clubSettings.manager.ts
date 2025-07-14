import User from "#models/User"
import { Context, withTransaction, withUser } from "./base.manager.js"
import { TransactionClientContract } from "@adonisjs/lucid/types/database"
import vine from '@vinejs/vine'
import { FieldContext } from "@vinejs/vine/types"
import ClubSetting, { CLUB_SETTING_KEYS, ClubSettingKey, ClubSettingStructureDefinition } from "#models/ClubSetting"
import Club from "#models/Club"
import AuthorizationManager from "./authorization.manager.js"

async function validValueForClubSetting(value: unknown, options: undefined, field: FieldContext) {
  let settingKey = field.data.key as ClubSettingKey

  if(value === null || value === undefined) return

  if (settingKey === 'bookingsActive' || settingKey == 'bookingsConfirmationRequired') {
    if(typeof value !== 'boolean') {
      field.report('The {{ field }} field is not a valid boolean value', 'validSetting', field)
    }
  }
}

export const validValueForClubSettingRule = vine.createRule(validValueForClubSetting)

export const setClubSettingValidator = vine.compile(
  vine.object({
    clubId: vine.number(),
    key: vine.enum(CLUB_SETTING_KEYS),
    value: vine.any().use(
      validValueForClubSettingRule()
    ).nullable()
  })
)

export const getClubSettingValidator = vine.compile(
  vine.object({
    key: vine.enum(CLUB_SETTING_KEYS),
  })
)

export default class ClubSettingsManager {
  @withTransaction
  @withUser
  public async set<Key extends ClubSettingKey>(params: {
    data: {
      clubId: number,
      key: Key,
      value: ClubSettingStructureDefinition[Key]
    },
    context?: Context
  }): Promise<ClubSetting> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await setClubSettingValidator.validate(params.data)

    let club = await Club.query({ client: trx })
      .where('id', params.data.clubId)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'clubSetting_set',
        data: {
          club
        },
      },
      context: params.context
    })

    let clubSetting = await ClubSetting.query({ client: trx })
      .where('clubId', club.id)
      .first()

    if(!!clubSetting) {
      let settings = clubSetting.settings
      settings[validatedData.key] = validatedData.value
      clubSetting.settings = settings
      await clubSetting.save()
    } else {
      clubSetting = await ClubSetting.create({
        clubId: club.id,
        settings: {
          [validatedData.key]: validatedData.value
        }
      }, {
        client: trx
      })
    }

    return clubSetting
  }

  @withTransaction
  @withUser
  public async get<Key extends ClubSettingKey>(params: {
    data: {
      key: Key,
      clubId: number,
    },
    context?: Context
  }): Promise<{ value: ClubSettingStructureDefinition[Key] | undefined | null }> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await getClubSettingValidator.validate(params.data)

    let club = await Club.query({ client: trx })
      .where('id', params.data.clubId)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'club_view',
        data: {
          club
        },
      },
      context: params.context
    })

    let clubSetting = await ClubSetting.query({ client: trx }).where('clubId', club.id).first()
    
    return {
      value: clubSetting?.settings[validatedData.key]
    }
  }
}