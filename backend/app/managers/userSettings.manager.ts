import User from "#models/User"
import UserSetting, { UserSettingKey, UserSettingStructureDefinition } from "#models/UserSetting"
import { Context, withTransaction, withUser } from "./base.manager.js"
import { TransactionClientContract } from "@adonisjs/lucid/types/database"
import vine from '@vinejs/vine'
import { USER_SETTINGS_KEY } from "#models/UserSetting"
import { FieldContext } from "@vinejs/vine/types"

async function validValueForUserSetting(value: unknown, options: undefined, field: FieldContext) {
  let settingKey = field.data.key as UserSettingKey

  if(value === null || value === undefined) return

  if (settingKey === 'clubsSectionVisible') {
    if(typeof value !== 'boolean') {
      field.report('The {{ field }} field is not a valid boolean value', 'validSetting', field)
    }
  }
}

export const validValueForUserSettingRule = vine.createRule(validValueForUserSetting)

export const setUserSettingValidator = vine.compile(
  vine.object({
    key: vine.enum(USER_SETTINGS_KEY),
    value: vine.any().use(
      validValueForUserSettingRule()
    ).nullable()
  })
)

export const getUserSettingValidator = vine.compile(
  vine.object({
    key: vine.enum(USER_SETTINGS_KEY),
  })
)

export default class UserSettingsManager {
  @withTransaction
  @withUser
  public async set<Key extends UserSettingKey>(params: {
    data: {
      key: Key,
      value: UserSettingStructureDefinition[Key]
    },
    context?: Context
  }): Promise<UserSetting> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await setUserSettingValidator.validate(params.data)

    let userSetting = await UserSetting.query({ client: trx }).where('userId', user.id).first()

    if(!!userSetting) {
      let settings = userSetting.settings
      settings[validatedData.key] = validatedData.value
      userSetting.settings = settings
      await userSetting.save()
    } else {
      userSetting = await UserSetting.create({
        userId: user.id,
        settings: {
          [validatedData.key]: validatedData.value
        }
      }, {
        client: trx
      })
    }

    return userSetting
  }

  @withTransaction
  @withUser
  public async get<Key extends UserSettingKey>(params: {
    data: {
      key: Key,
    },
    context?: Context
  }): Promise<{ value: UserSettingStructureDefinition[Key] | undefined | null }> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await getUserSettingValidator.validate(params.data)

    let userSetting = await UserSetting.query({ client: trx }).where('userId', user.id).first()
    return {
      value: userSetting?.settings[validatedData.key]
    }
  }
}