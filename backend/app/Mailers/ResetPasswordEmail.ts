import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from "App/Models/User";
import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'

export default class ResetPasswordEmail extends BaseMailer {
  private user: User
  private resetPasswordUrl: string

  constructor(params: {
    user: User,
    resetPasswordUrl: string
  }) {
    super()
    this.user = params.user
    this.resetPasswordUrl = params.resetPasswordUrl
  }

  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "SendVerificationEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public async prepare(message: MessageContract) {
    message
      .subject('Reset password')
      .from(Env.get('SMTP_USERNAME') || '')
      .htmlView('emails/resetPasswordEmail', {
        user: this.user,
        resetPasswordUrl: this.resetPasswordUrl
      })

    if (!Application.inProduction) {
      let testMail = Env.get('TEST_EMAIL')
      if (!testMail) throw new Error('no test mail provided')

      message.to(testMail)
    } else {
      message.to(this.user.email)
    }
  }
}
