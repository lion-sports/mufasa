import { JobContract, Job, JobsOptions } from '@ioc:Breeze'

export default class ExampleJob implements JobContract<{ }> {
  public key = 'ExampleJob'

  public options?: JobsOptions | undefined = {
  }

  workerOptions = {
    lockDuration: 100000
  }

  public async handle(job: Job) {
    return []
  }
}


