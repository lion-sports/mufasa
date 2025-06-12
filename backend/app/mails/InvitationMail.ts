import User from '#models/User'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

export default class InvitationMail extends BaseMail {
  private invitedUserEmail: string
  private invitedBy: User
  private invitationUrl: string

  constructor(params: { 
    invitedBy: User
    invitationUrl: string
    invitedUserEmail: string
  }) {
    super()
    this.invitedBy = params.invitedBy
    this.invitationUrl = params.invitationUrl
    this.invitedUserEmail = params.invitedUserEmail
  }

  prepare() {
    const senderMail = env.get('SMTP_USERNAME') || ''
    const testMail = env.get('TEST_EMAIL')
    if (!app.inProduction && !testMail) throw new Error('no test mail provided')

    this.message
      .from(senderMail)
      .subject('invito a LiONN')
      .htmlView('emails/invitation_email', {
        invitedBy: this.invitedBy,
        invitationUrl: this.invitationUrl,
      })
      .to(!!testMail ? testMail : this.invitedUserEmail)
  }
}
