import mail from '@adonisjs/mail/services/main'
import { CreateUserValidator, UpdateUserValidator } from '#app/Validators/users/index'
import { validator } from '@adonisjs/validator'
import User from '#app/Models/User'
import { Context, withTransaction, withUser } from './base.manager.js'
import SolanaManager from './solana.manager.js'
import { ModelObject } from '@adonisjs/lucid/types/model'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import FilterModifierApplier, { Modifier } from '#services/FilterModifierApplier'
import InvitationsManager from './invitations.manager.js'
import Invitation from '#models/Invitation'
import vine from '@vinejs/vine'
import ConfirmationNotification from '#app/mails/ConfirmationNotification'
import env from '#start/env'
import { Secret } from '@adonisjs/core/helpers'
import ClubsManager from './clubs.manager.js'
import { Sport } from 'lionn-common'
import Club from '#models/Club'

export const signupValidator = vine.compile(
  vine.object({
    email: vine.string().maxLength(255),
    password: vine.string().maxLength(255),
    firstname: vine.string().maxLength(255),
    lastname: vine.string().maxLength(255),
    birthday: vine.date({
      formats: { utc: true },
    }),
    solanaPublicKey: vine.string().optional(),
    invitationToken: vine.string().optional(),
  })
)

// TODO add authorization manager
class UsersManager {
  constructor() {}

  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number
      perPage?: number
      filtersBuilder?: {
        modifiers: Modifier[]
      }
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    const trx = params.context?.trx as TransactionClientContract

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = User.query({ client: trx })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

    const results = await query.paginate(params.data.page, params.data.perPage)
    return results.toJSON()
  }

  @withTransaction
  public async signup(params: {
    data: {
      email: string
      password: string
      firstname: string
      lastname: string
      birthday: DateTime
      collaborators?: string[]
      solanaPublicKey?: string
      invitationToken?: string
      club?: {
        clubName: string
        completeClubName: string
        clubSport: string
      }
    }
    context?: Context
  }): Promise<User> {
    let trx = params.context?.trx!
    let user: User

    let validatedData = await signupValidator.validate(params.data)
    let existingUser = await User.query({ client: trx }).where('email', validatedData.email).first()
    if (!!existingUser) throw new Error('user already exists')

    let invitation: Invitation | undefined = undefined
    if (!!validatedData.invitationToken) {
      let invitationManager = new InvitationsManager()
      let tokenValid = await invitationManager.validateInvitationToken({
        data: { token: validatedData.invitationToken },
        context: params.context,
      })

      if (!tokenValid.valid) throw new Error(tokenValid.message)
      else if (!!tokenValid.invitation) invitation = tokenValid.invitation
    }

    const manager = new UsersManager()
    user = await manager.create({
      data: {
        email: params.data.email,
        password: params.data.password,
        birthday: params.data.birthday,
        firstname: params.data.firstname,
        lastname: params.data.lastname,
        solanaPublicKey: params.data.solanaPublicKey,
      },
      context: params.context,
    })

    if (!!invitation) {
      invitation.invitedEmail = user.email
      invitation.invitedUserId = user.id
      await invitation.useTransaction(trx).save()

      const invitationManager = new InvitationsManager()
      await invitationManager
        .acceptInvitation({
          data: { invitation },
          context: { user, trx },
        })
        .catch((err) => {
          throw new Error('Cannot accept invitation:', err?.message)
        })
    }

    await user.save()

    await this.sendConfirmationEmail({
      data: { user: user },
      context: { user, trx },
    })

    // CHECKS FOR DIRIGENTS
    if (!!params.data.club && !!params.data.club.clubName && !!params.data.club.completeClubName) {
      const clubManager = new ClubsManager()
      const club = await clubManager.create({
        data: {
          name: params.data.club.clubName,
          completeName: params.data.club.completeClubName,
          sport: params.data.club.clubSport as Sport,
        },
        context: { user, trx },
      })

      if (!!club && params.data.collaborators) {
        const invitationManager = new InvitationsManager()
        for (const collaboratorEmail of params.data.collaborators) {
          await invitationManager.inviteUserToClub({
            data: {
              user: { email: collaboratorEmail },
              club: { id: club.id },
            },
            context: { user, trx },
          })
        }
      }
    }

    return user
  }

  @withTransaction
  public async create(params: {
    data: {
      email: string
      password: string
      firstname: string
      lastname: string
      birthday: DateTime
      solanaPublicKey?: string
    }
    context?: Context
  }): Promise<User> {
    const trx = params.context?.trx as TransactionClientContract

    await validator.validate({
      schema: new CreateUserValidator().schema,
      data: params.data,
    })

    let userCreated = await User.firstOrCreate(
      { email: params.data.email },
      {
        ...params.data,
        name: params.data.firstname + ' ' + params.data.lastname,
      },
      { client: trx }
    )
    const manager = new SolanaManager()
    if (!userCreated.solanaPublicKey) {
      await manager.keygen({ data: { userId: userCreated.id }, context: params.context })
    }

    return userCreated
  }

  public async get(params: {
    data: {
      id: number
      username?: string
    }
    context?: Context
  }): Promise<User | null> {
    const trx = params.context?.trx as TransactionClientContract

    let userByUsername: User
    if (!!params.data.username) {
      userByUsername = await User.query({ client: trx })
        .where('username', params.data.username)
        .firstOrFail()
      return userByUsername
    }

    return await User.find(params.data.id, { client: trx })
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id?: number
      email?: string
      password?: string
      firstname?: string
      birthday?: DateTime
      lastname?: string
    }
    context?: Context
  }): Promise<User> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    const id = params.data.id
    delete params.data.id

    if (id != user.id) throw new Error('cannot update the user')

    await validator.validate({
      schema: new UpdateUserValidator().schema,
      data: params.data,
    })

    let updatedUser = await User.findOrFail(id, { client: trx })
    updatedUser.merge({
      email: params.data.email,
      password: params.data.password,
    })
    return await updatedUser.save()
  }

  @withTransaction
  public async generateAccountConfirmationUrl(params: {
    data: {
      user: User
    }
    context?: Context
  }): Promise<string> {
    let trx = params.context?.trx!

    const token = await User.confirmRegistrationTokens.create(params.data.user, ['*'], {
      expiresIn: '24 hours',
      trx,
    })

    const tokenValue = token.toJSON().token
    const url = `${env.get('CONFIRMATION_EMAIL_URL')}?token=${tokenValue}`
    return url
  }

  @withTransaction
  public async sendConfirmationEmail(params: {
    data: {
      user: User
    }
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx!

    if (!params.data.user.id) throw new Error('No user id supplied')
    const user = await User.query({ client: trx }).where('id', params.data.user.id).firstOrFail()

    const verificationUrl = await this.generateAccountConfirmationUrl({
      data: { user },
      context: params.context,
    })

    const email = new ConfirmationNotification({ user, verificationUrl })
    await mail.send(email)
  }

  @withTransaction
  public async verifySignup(params: {
    data: {
      token: string
    }
    context?: Context
  }) {
    const trx = params.context?.trx!

    // Generating secret from email token
    const tokenSecret = new Secret(params.data.token)
    console.info(`Got token: ${params.data.token.substring(0, 10)}...`)

    // Verify the token exists in db
    const verifiedToken = await User.confirmRegistrationTokens.verify(tokenSecret)
    if (!verifiedToken) {
      console.warn(`Token not found or not verified: ${verifiedToken}`)
      throw new Error('could not verify this token')
    }

    // Expiry verification
    if (verifiedToken.expiresAt === null) throw new Error('missing expiration date for this token')
    if (DateTime.fromJSDate(verifiedToken.expiresAt) < DateTime.now()) {
      throw new Error('this token is expired')
    }

    // Verify the owner exists and is valid
    const ownerId = verifiedToken.tokenableId.toString()
    const user = await User.query({ client: trx })
      .where('id', ownerId)
      .firstOrFail()
      .catch(() => {
        throw new Error('could not find the owner of this token')
      })

    // Update the owner to confirmed
    await user.merge({ registrationConfirmed: true }).save()

    // Delete confirmation token
    await User.confirmRegistrationTokens.delete(user, verifiedToken.identifier)

    return user
  }
}

export default UsersManager
