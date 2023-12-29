import { promises as fsPromises } from 'fs'
import Database, { TransactionClientContract } from "@ioc:Adonis/Lucid/Database"
import { BaseUploader, Report } from './base.uploader'

export abstract class BaseCsvUploader<ExtraType> extends BaseUploader<ExtraType> {
  protected filePath: string
  protected separator: string = ';'
  protected extra: ExtraType

  constructor(params: { 
    filePath: string,
    extra: ExtraType
  }) {
    super(params)
  }

  public async import(_params?: {
    options?: {
      useStream: boolean
    }
  }) {
    if (!this.filePath) throw new Error("file path must be present");

    let results: {
      report: Report
    } = {
      report: {
        successNumber: 0,
        failedNumber: 0,
        errors: []
      }
    }

    try {
      await fsPromises.access(this.filePath)

      let fileContent = await fsPromises.readFile(this.filePath)
      let rows = fileContent.toString().split('\n')

      if(rows.length > 0) {
        let trx = await Database.transaction()
        let rowContext: Record<string, any> = {}

        try {
          let setupResults = await this.setup({
            extra: this.extra,
            trx: trx
          })

          rowContext = setupResults.rowContext || {}

          let headers: string[] = rows[0].trim().split(this.separator).map(header => header.trim())

          for (let i = 1; i < rows.length; i += 1) {
            let row = rows[i].trim().split(this.separator).map(header => header.trim())

            let headerBasedRow: Record<string, string> = {}
            for(let k = 0; k < headers.length; k += 1) {
              headerBasedRow[headers[k]] = row[k]
            }

            let result = await this.handleRow({
              headerBasedRow: headerBasedRow,
              arrayBasedRow: row,
              rowContext: rowContext,
              extra: this.extra,
              trx: trx
            })

            if(result.success) {
              results.report.successNumber += 1
            } else {
              results.report.failedNumber += 1
              if(!!result.reason) {
                results.report.errors.push({
                  reason: result.reason,
                  index: i
                })
              }
            }

            if(!!result.rowContext) {
              rowContext = result.rowContext
            }
          }

          await this.cooldown({
            extra: this.extra,
            trx: trx
          })

          await trx.commit()
        } catch(error) {
          await trx.rollback()
          throw error
        }
      }

    } catch(error) {
      throw new Error(error);
    }

    return results
  }

  protected async setup(_params: {
    extra?: ExtraType,
    trx: TransactionClientContract
  }): Promise<{
    rowContext?: Record<string, any>
  }> {
    return {}
  }

  protected async cooldown(_params: {
    extra?: ExtraType,
    globalContext?: Record<string, any>,
    trx: TransactionClientContract
  }): Promise<{
    rowContext?: Record<string, any>,
    globalContext?: Record<string, any>
  }> {
    return {}
  }

  abstract handleRow(params: { 
    headerBasedRow: Record<string, string>, 
    arrayBasedRow: string[],
    rowContext?: Record<string, any>,
    extra?: ExtraType,
    trx: TransactionClientContract
  }): Promise<{
    success: boolean,
    reason?: string,
    rowContext?: Record<string, any>
  }>
}