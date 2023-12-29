import { ExpandedTable } from "./base.exporter";
import { FrameAddStyleTagOptions } from "puppeteer";
import puppeteer from "puppeteer"
import { BaseExporter } from "./base.exporter";
import Application from '@ioc:Adonis/Core/Application'

export class PdfExporter extends BaseExporter {
  private style: FrameAddStyleTagOptions
  private headerHTML: string

  constructor(params: {
    style?: FrameAddStyleTagOptions,
    headerHTML: string,
    tableStructure: ExpandedTable
  }) {
    super(params)
    if(!!params.style) {
      this.style = params.style
    } else {
      this.style = {
        content: 'table {border-collapse: collapse} td {border: 1px solid}'
      }
    }

    this.headerHTML = params.headerHTML
  }

  async generateDoc(params?: {
    data?: {
      landscape?: boolean
    }
  }): Promise<Buffer> {
    let browser
    if (Application.inProduction) {
      browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--headless', '--disable-gpu']
      })
    } else {
      browser = await puppeteer.launch({
        headless: true
      })
    }

    try {
      const page = await browser.newPage()

      const html = this.generateHTMLTable()
      await page.setContent(html, {
        waitUntil: 'domcontentloaded'
      })
      await page.addStyleTag(this.style)

      const table = await page.$('.table-container')
      const boundingBox = await table?.boundingBox()

      const tableWidth = boundingBox?.width

      let pdfBuffer: Buffer = await page.pdf({
        margin: {
          top: 110,
          bottom: 40,
          left: 10,
          right: 20
        },
        displayHeaderFooter: true,
        headerTemplate: this.headerHTML,
        landscape: params?.data?.landscape === undefined || params?.data?.landscape === null ? true : params?.data?.landscape,
        footerTemplate: '<span class="pageNumber" style="font-size: 8px; padding-left: 20px"><span>',
        height: !!tableWidth ? tableWidth : undefined,
        format: !tableWidth || tableWidth < 1000 ? "letter" : undefined
      })
      browser.close()
      return pdfBuffer

    } catch(error) {
      browser.close()
      throw error
    }
  }
}