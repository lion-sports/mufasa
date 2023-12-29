import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from "App/Models/User";
import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'

export default class VerifyAccountEmail extends BaseMailer {
  private user: User

  constructor(params: {
    user: User
  }) {
    super()
    this.user = params.user
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
   * "VerifyAccountEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
    message
      .subject('The email subject')
      .from('gabriele.garlaschelli@sandbox1445ded60bbf4573adf9800a80cca13b.mailgun.org')
      .htmlView('emails/verifyAccountEmail')

    if (!Application.inProduction) {
      let testMail = Env.get('TEST_EMAIL')
      if (!testMail) throw new Error('no test mail provided')

      message.to(testMail)
    } else {
      message.to(this.user.email)
    }
  }
}
