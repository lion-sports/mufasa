export type ExpandedTable = (string | null)[][]

export type Cell = {
  value: string | null,
  nColumns: number,
  nRows: number
}

export abstract class BaseExporter {
  protected structure: ExpandedTable
  protected table: Cell[][]
  protected tableChained: Cell[][][]

  constructor(params: {
    tableStructure: ExpandedTable
  }) {
    if (!params.tableStructure) throw new Error("Structure must be defined")
    this.structure = params.tableStructure

    if(this.structure.some((row) => row.every((el) => el === null))) {
      this.chainedTableInit()
      this.adaptTableChain()
    } else {
      this.tableInit()
      this.adaptTable()
    }
  }

  private extractTableRapresentation(structure: ExpandedTable): Cell[][] {
    let maxRowElements: number = 0
    for (let i = 0; i < structure.length; i += 1) {
      if (structure[i].length > maxRowElements) maxRowElements = structure[i].length
    }

    let rapresentation: Cell[][] = []
    for (let i = 0; i < structure.length; i += 1) {
      rapresentation[i] = structure[i].map(el => {
        return {
          value: el,
          nRows: 1,
          nColumns: 1
        }
      })

      for (let k = structure[i].length; k < maxRowElements; k += 1) {
        rapresentation[i].push({
          value: '',
          nRows: 1,
          nColumns: 1
        })
      }
    }
    return rapresentation
  }

  private tableInit(): void {
    this.table = this.extractTableRapresentation(this.structure)
  }

  private chainedTableInit(): void {
    this.tableChained = []

    let partialTable: ExpandedTable = []
    for(let i = 0; i < this.structure.length; i += 1) {
      if(this.structure[i].every((e) => e === null)) {
        this.tableChained.push(this.extractTableRapresentation(partialTable))
        partialTable = []
      } else {
        partialTable.push(this.structure[i])
      }
    }
  }

  private adaptTable(): void {
    this.table = this.calculateTableAdaption(this.table)
  }

  private adaptTableChain(): void {
    for(let i = 0; i < this.tableChained.length; i += 1) {
      this.tableChained[i] = this.calculateTableAdaption(this.tableChained[i])
    }
  }

  private calculateTableAdaption(table: Cell[][]): Cell[][] {
    for (let i = 0; i < table.length; i += 1) {
      for (let j = 0; j < table[i].length; j += 1) {
        if (table[i][j].value == null) {
          let distCol = this.getClosestValueCol(i, j, table)
          if (distCol != undefined) {
            table[i - distCol][j].nRows += 1
          } else {
            let distRow = this.getClosestValueRow(i, j, table)
            if (distRow != undefined) {
              table[i][j - distRow].nColumns += 1
            }
          }
        }
      }
    }

    return table
  }

  private getClosestValueCol(row: number, column: number, table: Cell[][]): number | undefined {
    let dist: number = 1
    for(let i = row - 1; i >= 0; i -= 1) {
      if (!!table[i] && !!table[i][column] && table[i][column].value == null) dist += 1
      else return dist
    }
    return undefined
  }

  private getClosestValueRow(row: number, column: number, table: Cell[][]): number | undefined {
    let dist: number = 1
    for(let j = column - 1; j >= 0; j -= 1) {
      if (!!table[row] && !!table[row][j] && table[row][j].value == null) dist += 1
      else return dist
    }
    return undefined
  }

  public generateHTMLTable(): string {
    if(!!this.table) {
      return this.generateSingleTable(this.table)
    } else if(!!this.tableChained) {
      let innerHtml: string = ""

      for(let i = 0; i < this.tableChained.length; i += 1) {
        let table = this.tableChained[i]
        let html = this.generateSingleTable(table, { marginTop: '10px'})
        innerHtml += html
      }

      return innerHtml
    } else {
      return `<div class="table-container" style="width: fit-content"><table></table></div>`
    }
  }

  private generateSingleTable(table: Cell[][], css?: {
    marginTop?: string,
    marginBottom?: string
  }): string {
    let innerHtml: string = ""

    if(table.length == 0) {
      innerHtml = "Dati non ancora pervenuti"
    } else {
      for (let i = 0; i < table.length; i += 1) {
        let header: boolean = i === 0 || !!table[i].find(c => c.value == null)
  
        if (header) innerHtml += '<tr>'
        else innerHtml += `<tr class="body-row">`
  
        for (let j = 0; j < table[i].length; j += 1) {
          if (table[i][j].value != null) {
            innerHtml += `<${header ? 'th' : 'td'} rowspan=${table[i][j].nRows} colspan=${table[i][j].nColumns}>
                ${table[i][j].value}
              </${header ? 'th' : 'td'}>`
          }
        }
        innerHtml += '</tr>'
      }
    }

    return `<div class="table-container" style="width: fit-content; margin-top: ${css?.marginTop || '0px'}; margin-bottom: ${css?.marginBottom || '0px'}"><table>${innerHtml}</table></div>`
  }

  abstract generateDoc(): Promise<Buffer>
}
