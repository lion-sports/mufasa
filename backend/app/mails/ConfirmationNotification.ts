import User from '#models/User'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

export default class ConfirmationNotification extends BaseMail {
  private user: User

  constructor(params: { user: User }) {
    super()
    this.user = params.user
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
      .htmlView('emails/confirmation_email')

    const testMail = env.get('TEST_EMAIL')
    if (!app.inProduction && !testMail) throw new Error('no test mail provided')

    if (!!testMail) {
      this.message.to(testMail)
    } else {
      this.message.to(this.user.email)
    }
  }
}
