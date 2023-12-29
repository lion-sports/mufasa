import { promises as fsPromises } from 'fs'
import Database, { TransactionClientContract } from "@ioc:Adonis/Lucid/Database"
import type { Report } from './base.uploader'
import { BaseUploader } from './base.uploader'
import xlsx from 'node-xlsx'

export abstract class BaseXlsxUploader<ExtraType> extends BaseUploader<ExtraType> {
  protected filePath: string
  protected separator: string = ';'
  protected sheetName: string | undefined = undefined
  protected extra: ExtraType

  constructor(params: {
    filePath: string,
    extra: ExtraType,
    sheetName?: string
  }) {
    super(params)
    this.sheetName = params.sheetName
  }

  public async import(_params?: {
    options?: {
      useStream: boolean
    }
  }) {
    if (!this.filePath) throw new Error("file path must be present");

    let results: {
      report: Report,
      globalContext: Record<string, any>
    } = {
      report: {
        successNumber: 0,
        failedNumber: 0,
        errors: []
      },
      globalContext: {}
    }

    try {
      await fsPromises.access(this.filePath)

      const worksheet = xlsx.parse(this.filePath)

      let sheet: {
        data: any[],
        name: string
      } | undefined
      if(!!this.sheetName) sheet = worksheet.find((el) => el.name == this.sheetName)
      else sheet = worksheet[0]

      if(!!sheet) {
        let trx = await Database.transaction()
        let rowContext: Record<string, any> = {}
        let globalContext: Record<string, any> = {}

        try {
          let setupResults = await this.setup({
            extra: this.extra,
            trx: trx
          })

          rowContext = setupResults.rowContext || {}
          globalContext = setupResults.globalContext || {}

          let headers: string[] = sheet.data[0].map(header => header.trim())

          for(let i = 1; i < sheet.data.length; i += 1) {

            let headerBasedRow: Record<string, string> = {}
            for(let k = 0; k < sheet.data[i].length; k += 1) {
              headerBasedRow[headers[k]] = sheet.data[i][k]
            }

            let result = await this.handleRow({
              headerBasedRow,
              arrayBasedRow: sheet.data[i],
              rowContext: rowContext,
              globalContext: globalContext,
              extra: this.extra,
              trx: trx
            })

            if (result.success) {
              results.report.successNumber += 1
            } else {
              results.report.failedNumber += 1
              if (!!result.reason) {
                results.report.errors.push({
                  reason: result.reason,
                  index: i
                })
              }
            }

            if (result.rowContext !== undefined) {
              rowContext = result.rowContext
            }

            if(result.globalContext !== undefined) {
              globalContext = result.globalContext
            }
          }

          await this.cooldown({
            extra: this.extra,
            globalContext: globalContext,
            trx: trx
          })

          results.globalContext = globalContext

          await trx.commit()
        } catch(error) {
          await trx.rollback()
          throw error
        }

      } else {
        throw new Error("sheet not found");
      }

    } catch (error) {
      throw new Error(error);
    }

    return results
  }

  protected async setup(_params: {
    extra?: ExtraType,
    trx: TransactionClientContract
  }): Promise<{
    rowContext?: Record<string, any>,
    globalContext?: Record<string, any>
  }> {
    return {}
  }

  protected async cooldown(_params: {
    extra: ExtraType,
    globalContext?: Record<string, any>,
    trx: TransactionClientContract
  }): Promise<{
    rowContext?: Record<string, any>,
    globalContext?: Record<string, any>
  }> {
    return {}
  }

  abstract handleRow(params: {
    headerBasedRow: Record<string, any>,
    arrayBasedRow: any[],
    rowContext?: Record<string, any>,
    globalContext: Record<string, any>,
    extra?: ExtraType,
    trx: TransactionClientContract
  }): Promise<{
    success: boolean,
    reason?: string,
    rowContext?: Record<string, any>,
    globalContext?: Record<string, any>,
  }>
}