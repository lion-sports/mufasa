import Mongo from "App/Services/Mongo"
import { Context, withTransaction, withUser } from "../base.manager"
import excelJS from 'exceljs'
import { SCOUT_EVENT_COLLECTION_NAME } from "./ScoutEvent"
import { ScoutEventPlayer } from "App/Models/Player"
import { SummarizedPlayerStats } from "./scouts.manager"
import { totalAnalysis } from "./aggregations/totalAnalysis.aggregation"
import TeammatesManager from "../teammates.manager"

export default class ScoutExporter {
  @withTransaction
  @withUser
  public async exportXlsx(params: {
    data: {
      id: number,
    },
    context?: Context
  }): Promise<Buffer> {
    await Mongo.init()

    const workbook = new excelJS.Workbook()

    let total = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer,
      } & SummarizedPlayerStats>([
        {
          $match: {
            scoutId: Number(params.data.id),
          },
        },
        ...totalAnalysis()
      ])
      .toArray()

    let groupedBySet = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer,
        setNumber: number
      } & SummarizedPlayerStats>([
        {
          $match: {
            scoutId: Number(params.data.id),
          },
        },
        ...totalAnalysis({ groupBy: ["$playerId", "$setNumber"] })
      ])
      .toArray()

    await this.addWorkseet({
      stats: total,
      workseetName: 'Totale',
      workbook
    })

    let availableSets = new Set<number>()
    for(let i = 0; i < groupedBySet.length; i += 1) {
      availableSets.add(groupedBySet[i].setNumber)
    }

    for(const setNumber of availableSets) {
      await this.addWorkseet({
        stats: groupedBySet.filter((gbs) => gbs.setNumber == setNumber),
        workseetName: `Set ${setNumber + 1}`,
        workbook
      })
    }

    return await workbook.xlsx.writeBuffer() as Buffer
  }

  private async addWorkseet(params: {
    stats: ({
      player: ScoutEventPlayer,
    } & SummarizedPlayerStats)[],
    workseetName: string,
    workbook: excelJS.Workbook
  }) {
    let workSheet = params.workbook.addWorksheet(params.workseetName)
    let firstHeader = workSheet.addRow([
      '',
      'Muro',
      '',
      '',
      '',
      'Ricezione',
      '',
      '',
      '',
      '',
      'Battuta',
      '',
      '',
      'Attacco',
      '',
      ''
    ])

    workSheet.mergeCells('B1:E1')
    workSheet.mergeCells('F1:J1')
    workSheet.mergeCells('K1:M1')
    workSheet.mergeCells('N1:P1')

    firstHeader.eachCell((cell, index) => {
      cell.style.alignment = { horizontal: 'center' }
      cell.style.border = {
        right: { style: 'thick' }
      }
      cell.style.font = { bold: true }
    })

    let secondHeader = workSheet.addRow([
      'Nome',
      'mani out',
      'punto',
      'tocco e ritorno',
      'tocco',
      '++',
      '+',
      '-',
      '/',
      'x',
      'errore',
      'punto',
      'ricevuta',
      'errore',
      'punto',
      'difeso'
    ])

    secondHeader.eachCell((cell, index) => {
      if ([1, 5, 10, 13, 16].includes(index)) {
        cell.style.border = {
          right: { style: 'thick' }
        }
      }
      cell.style.alignment = { horizontal: 'center' }
      cell.style.font = { bold: true }
    })

    for (let i = 0; i < params.stats.length; i += 1) {
      let totalRow = params.stats[i]

      let row = workSheet.addRow([
        TeammatesManager.getTeammateName({
          teammate: totalRow.player.teammate,
          player: totalRow.player
        }),
        totalRow.block.handsOut,
        totalRow.block.point,
        totalRow.block.putBack,
        totalRow.block.touch,
        totalRow.receive['++'],
        totalRow.receive['+'],
        totalRow.receive['-'],
        totalRow.receive['/'],
        totalRow.receive['x'],
        totalRow.serve.error,
        totalRow.serve.point,
        totalRow.serve.received,
        totalRow.spike.error,
        totalRow.spike.point,
        totalRow.spike.defense,
      ])

      row.eachCell((cell, index) => {
        if ([1, 5, 10, 13, 16].includes(index)) {
          cell.style.border = {
            right: { style: 'thick' }
          }
        }
        if (index == 1) {
          cell.style.font = { bold: true }
        }
      })
    }

    workSheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column["eachCell"]?.({ includeEmpty: true }, function (cell) {
        var columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });
  }
}