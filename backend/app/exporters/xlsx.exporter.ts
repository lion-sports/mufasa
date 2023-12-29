import { ExpandedTable } from "./base.exporter";
import { BaseExporter } from "./base.exporter";
import xlsx, { WorkSheet } from 'node-xlsx'
import excelJS, {Workbook, FillPattern} from 'exceljs'
import path from 'path'
import logoBase64 from "./logoBase64";

export class XlsxExporter extends BaseExporter {
  protected header: string | undefined
  protected colWidth: number | undefined

  constructor(params: {
    tableStructure: ExpandedTable,
    header?: string,
    colWidth?: number
  }) {
    super(params)
    this.header = params.header
    this.colWidth = params.colWidth
  }

  async generateDoc(): Promise<Buffer> {
    try {

      const workbook = new excelJS.Workbook()
      let logoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png'
      })

      if(this.structure.length == 0) {
        let workSheet = workbook.addWorksheet('Report')
        workSheet.addRows([
          [
            '${height:60;verticalAlign:top}',
            'Dati non ancora pervenuti'
          ]
        ])

        workSheet.addImage(logoId, {
          tl: { col: 0, row: 0 },
          ext: { width: 50, height: 70 }
        })

        this.applyStyle(workbook)

        //@ts-ignore
        return await workbook.xlsx.writeBuffer()
      } else if(this.structure.some((row) => row.every((cell) => cell === null))) {
        let sheets: {
          name: string;
          data: ExpandedTable;
          options: {
            '!merges': {
              s: {
                c: number;
                r: number;
              };
              e: {
                c: number;
                r: number;
              };
            }[];
          }
        }[] = []

        let partialTable: ExpandedTable = []
        for (let i = 0; i < this.structure.length; i += 1) {
          if (this.structure[i].every((e) => e === null)) {
            let ranges = this.calculateRanges(partialTable)
            sheets.push(this.calculateSingleSheet({
              ranges,
              data: partialTable,
              sheetName: partialTable[0][0] || 'Report'
            }))
            partialTable = []
          } else {
            partialTable.push([...this.structure[i]])
          }
        }

        for(let i = 0; i < sheets.length; i += 1) {
          let workSheet = workbook.addWorksheet(sheets[i].name)
          workSheet.addRows(sheets[i].data)

          for(let m = 0; m < sheets[i].options["!merges"].length; m += 1) {
            workSheet.mergeCells(sheets[i].options["!merges"][m].s.r + 1, sheets[i].options["!merges"][m].s.c + 1, sheets[i].options["!merges"][m].e.r + 1, sheets[i].options["!merges"][m].e.c + 1)
          }

          if(!!this.header) workSheet.addImage(logoId, 'A1:A1')
        }


        this.applyStyle(workbook)

        //var xlsxBuffer = xlsx.build(sheets);
        var xlsxBuffer = await workbook.xlsx.writeBuffer()

        //@ts-ignore
        return xlsxBuffer
      } else {
        let ranges = this.calculateRanges(this.structure)
        let sheet = this.calculateSingleSheet({
          ranges,
          data: this.structure,
          sheetName: 'Report'
        })

        let workSheet = workbook.addWorksheet(sheet.name)

        if(!!this.colWidth) {
          workSheet.properties.defaultColWidth = this.colWidth
        }

        workSheet.addRows(sheet.data)
        if (!!this.header) workSheet.addImage(logoId, {
          tl: { col: 0, row: 0 },
          ext: { width: 50, height: 70 }
        })

        for(let m = 0; m < sheet.options["!merges"].length; m += 1) {
          workSheet.mergeCells(sheet.options["!merges"][m].s.r + 1, sheet.options["!merges"][m].s.c + 1, sheet.options["!merges"][m].e.r + 1, sheet.options["!merges"][m].e.c + 1)
        }

        this.applyStyle(workbook)

        //var xlsxBuffer = xlsx.build([sheet]);
        var xlsxBuffer = await workbook.xlsx.writeBuffer()

        //@ts-ignore
        return xlsxBuffer
      }
    } catch (error) {
      throw error
    }
  }

  private calculateSingleSheet(params: {
    ranges: {
      s: { c: number, r: number },
      e: { c: number, r: number }
    }[],
    data: ExpandedTable,
    sheetName: string
  }) {
    if (!!this.header) {
      params.data = [
        [
          '${height:60;verticalAlign:top}',
          this.header,
          ...new Array(params.data[0].length - 2).fill(null)
        ],
        ...params.data
      ]
    }

    let ranges = this.calculateRanges(params.data)

    const sheetOptions = { '!merges': ranges };

    return {
      name: params.sheetName.substring(0, 31),
      data: params.data,
      options: sheetOptions
    }
  }

  private calculateRanges(structure: ExpandedTable): {
    s: { c: number, r: number },
    e: { c: number, r: number }
  }[] {
    let ranges: {
      s: { c: number, r: number },
      e: { c: number, r: number }
    }[] = []

    for (let i = 0; i < structure.length; i += 1) {
      let row = structure[i]

      for (let k = 0; k < row.length; k += 1) {
        if (
          row[k] !== null &&
          k + 1 < row.length &&
          row[k + 1] === null &&
          (i == 0 || structure[i - 1][k] !== null)
        ) {
          let columnSpanningDistance = 0
          for (let j = k + 1; j < row.length; j += 1) {
            if (row[j] === null) columnSpanningDistance += 1
            else break
          }

          ranges.push({
            s: {
              c: k,
              r: i
            },
            e: {
              c: k + columnSpanningDistance,
              r: i
            }
          })
        } else if (row[k] !== null && i + 1 < structure.length && structure[i + 1][k] === null) {
          let rowSpanningDistance = 0
          for (let j = i + 1; j < structure.length; j += 1) {
            if (structure[j][k] === null) rowSpanningDistance += 1
            else break
          }

          ranges.push({
            s: {
              c: k,
              r: i
            },
            e: {
              c: k,
              r: i + rowSpanningDistance
            }
          })
        }
      }
    }

    return ranges
  }

  private applyStyle(wb: Workbook) {
    wb.eachSheet((worksheet, sheetId) => {
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          let content = cell.value

          if(!cell || !content) return

          let cellValue = content.toString()
          let styleString = cellValue.substring(cellValue.indexOf("${") + 1, cellValue.lastIndexOf("}"))
          let valueString = cellValue.substring(cellValue.lastIndexOf("}") == -1 ? 0 : cellValue.lastIndexOf("}") + 1, cellValue.length)

          if(!!styleString) {
            styleString = styleString.slice(1)
            let styles = styleString.split(';')

            let font: {size?: number, underline?: boolean, bold?: boolean, italic?: boolean, color?: {argb: string}} | undefined = undefined
            let alignment: {horiziontal?: 'left' | 'right' | 'center', vertical?: 'top' | 'bottom' | 'middle', wrapText?: boolean, shrinkToFit?: boolean} | undefined = undefined
            let border: {
                top?: {
                  style?: 'thin' | 'thick' | 'medium',
                  color?: {argb: string}
                },
                bottom?: {
                  style?: 'thin' | 'thick' | 'medium',
                  color?: {argb: string}
                },
                left?: {
                  style?: 'thin' | 'thick' | 'medium',
                  color?: {argb: string}
                },
                right?: {
                  style?: 'thin' | 'thick' | 'medium',
                  color?: {argb: string}
                }
              } | undefined = undefined
            let fill: FillPattern | undefined = undefined

            for(let i = 0; i < styles.length; i += 1) {

              let prop = styles[i].split(':')[0]
              let value = styles[i].split(':')[1]

              if(!prop || !value) break

              prop = prop.trim()
              value = value.trim()

              switch(prop) {
                case 'fontSize':
                  if(font == undefined) font = {}
                  let size = Number(value)
                  if(isNaN(size)) throw new Error('fontSize must be a number')
                  font.size = Number(value)
                  break
                case 'underline':
                  if(font == undefined) font = {}
                  if(value === 'true') font.underline = true
                  else if(value === 'false') font.underline = false
                  else throw new Error('underline must be true or false')
                  break
                case 'bold':
                  if(font == undefined) font = {}
                  if(value === 'true') font.bold = true
                  else if(value === 'false') font.bold = false
                  else throw new Error('bold must be true or false')
                  break
                case 'italic':
                  if(font == undefined) font = {}
                  if(value === 'true') font.italic = true
                  else if(value === 'false') font.italic = false
                  else throw new Error('italic must be true or false')
                  break
                case 'color':
                  if(font == undefined) font = {}
                  if(this.isColor(value)) font.color = {argb: value}
                  else throw new Error('color must be hex value')
                  break
                case 'verticalAlign':
                  if(alignment == undefined) alignment = {}
                  if(['top', 'middle', 'bottom'].includes(value)) alignment.vertical = value as 'top' | 'middle' | 'bottom'
                  else throw new Error('verticalAlign must be one of top, middle, bottom')
                  break
                case 'horizontalAlign':
                  if(alignment == undefined) alignment = {}
                  if(['left', 'center', 'right'].includes(value)) alignment.horiziontal = value as 'left' | 'center' | 'right'
                  else throw new Error('horiziontalAlign must be one of left, center, right')
                  break
                case 'wrapText':
                  if(alignment == undefined) alignment = {}
                  if(value === 'true') alignment.wrapText = true
                  else if(value === 'false') alignment.wrapText = false
                  else throw new Error('wrapText must be true or false')
                  break
                case 'shrinkToFit':
                  if(alignment == undefined) alignment = {}
                  if(value === 'true') alignment.shrinkToFit = true
                  else if(value === 'false') alignment.shrinkToFit = false
                  else throw new Error('shrinkToFit must be true or false')
                  break
                case 'borderTop':
                  if(border == undefined) border = {}
                  if(['thin', 'thick', 'medium'].includes(value)) {
                    if(!!border.top) border.top.style = value as 'thin' | 'thick' | 'medium'
                    else border.top = {style: value as 'thin' | 'thick' | 'medium'}
                  }
                  else throw new Error('borderTop must be one of thin, medium, thick')
                  break
                case 'borderBottom':
                  if(border == undefined) border = {}
                  if(['thin', 'thick', 'medium'].includes(value)) {
                    if(!!border.bottom) border.bottom.style = value as 'thin' | 'thick' | 'medium'
                    else border.bottom = {style: value as 'thin' | 'thick' | 'medium'}
                  }
                  else throw new Error('borderBottom must be one of thin, medium, thick')
                  break
                case 'borderLeft':
                  if(border == undefined) border = {}
                  if(['thin', 'thick', 'medium'].includes(value)) {
                    if(!!border.left) border.left.style = value as 'thin' | 'thick' | 'medium'
                    else border.left = {style: value as 'thin' | 'thick' | 'medium'}
                  }
                  else throw new Error('borderLeft must be one of thin, medium, thick')
                  break
                case 'borderRight':
                  if(border == undefined) border = {}
                  if(['thin', 'thick', 'medium'].includes(value)) {
                    if(!!border.right) border.right.style = value as 'thin' | 'thick' | 'medium'
                    else border.right = {style: value as 'thin' | 'thick' | 'medium'}
                  }
                  else throw new Error('borderRight must be one of thin, medium, thick')
                  break
                case 'borderColor':
                  if(border == undefined) border = {}
                  if(this.isColor(value)) {
                    if(!!border.left) border.left.color = {argb: value}
                    else border.left = {color: {argb: value}}

                    if(!!border.right) border.right.color = {argb: value}
                    else border.right = {color: {argb: value}}

                    if(!!border.bottom) border.bottom.color = {argb: value}
                    else border.bottom = {color: {argb: value}}

                    if(!!border.top) border.top.color = {argb: value}
                    else border.right = {color: {argb: value}}
                  }
                  else throw new Error('color must be hex value')
                  break
                case 'backgroundColor':
                  if(fill == undefined) fill = {type: 'pattern', pattern: 'solid'}
                  if(this.isColor(value)) {
                    fill.fgColor = {argb: value}
                  }
                  else throw new Error('color must be hex value')
                  break
                case 'height':
                  row.height = Number(value)
                  break
                default:
                  throw new Error('invalid style')
              }
            }

            if(!!font) cell.font = font
            if(!!alignment) cell.alignment = alignment
            if(!!border) cell.border = border
            if(!!fill) cell.fill = fill
          }

          cell.value = valueString
        })
      })

    })
  }

  private isColor(value: string): boolean {
    let regex = /[0-9A-Fa-f]{8}/g
    return value.match(regex) != null
  }
}