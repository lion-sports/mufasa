import User from '#models/User'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

export default class ConfirmationNotification extends BaseMail {
  private user: User
  private verificationUrl: string

  constructor(params: { user: User; verificationUrl: string }) {
    super()
    this.user = params.user
    this.verificationUrl = params.verificationUrl
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const senderMail = env.get('SMTP_USERNAME') || ''
    this.message
      .from(senderMail)
      .subject('Conferma registrazione')
      .htmlView('emails/confirmation_email', {
        user: this.user,
        verificationUrl: this.verificationUrl,
      })

    const testMail = env.get('TEST_EMAIL')
    if (!app.inProduction && !testMail) throw new Error('no test mail provided')

    if (!!testMail) {
      this.message.to(testMail)
    } else {
      this.message.to(this.user.email)
    }
  }
}
