export type Report = {
  successNumber: number,
  failedNumber: number,
  errors: {
    reason: string,
    index: number
  }[]
}

export abstract class BaseUploader<ExtraType> {
  protected extra: ExtraType
  protected filePath: string

  constructor(params: {
    filePath: string,
    extra: ExtraType
  }) {
    if (!params.filePath) throw new Error("file path must be present");

    this.filePath = params.filePath
    this.extra = params.extra
  }

  abstract import(params: {
    options: {
      useStream: boolean
    }
  }): Promise<{
    report: Report,
    globalContext?: Record<string, any>
  }>
}