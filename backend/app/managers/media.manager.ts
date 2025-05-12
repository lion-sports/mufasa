import Media from '#models/Media'
import { Context, withUser, withTransaction } from './base.manager.js'
import { cuid } from '@adonisjs/core/helpers'
import Drive from '@adonisjs/drive/services/main'
import path from 'path'
import fs from 'fs/promises'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import User from '#models/User'
import sharp from 'sharp'
import { Readable } from 'stream'

export const EXT_TO_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  tiff: 'image/tiff',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  jfif: 'image/pjpeg', // JFIF format
  pjpeg: 'image/pjpeg', // Progressive JPEG
  pjp: 'image/pjpeg', // Progressive JPEG (alternative extension)
  // Add more image formats as needed
}

export default class MediaManager {
  @withTransaction
  public upload(params: {
    data: {
      content?: {
        contents: Buffer | string
        filename: string
      }
      streamInfo?: {
        stream: Readable
        filename: string
      }
      from?: {
        path: string
        drive?: string
      }
      driveName: string
      extension: string
    }
    context?: Context
  }): Promise<Media> {
    if (!params.data.content && !params.data.streamInfo && !params.data.from)
      throw new Error('specify at least one of contents, streamInfo or from')
    else if (!!params.data.content)
      return this.uploadContents({
        data: {
          content: params.data.content,
          driveName: params.data.driveName,
          extension: params.data.extension,
        },
        context: params.context,
      })
    else if (!!params.data.from)
      return this.uploadFromDrive({
        data: {
          from: params.data.from,
          driveName: params.data.driveName,
          extension: params.data.extension,
        },
        context: params.context,
      })
    else
      return this.uploadFromStream({
        data: {
          stream: params.data.streamInfo?.stream!,
          filename: params.data.streamInfo?.filename!,
          driveName: params.data.driveName,
          extension: params.data.extension,
        },
        context: params.context,
      })
  }

  @withTransaction
  public async uploadContents(params: {
    data: {
      content: {
        contents: Buffer | string
        filename: string
      }
      extension: string
      driveName: string
    }
    context?: Context
  }): Promise<Media> {
    let trx = params.context?.trx
    const drive = Drive.use(params.data.driveName)

    const uid = cuid()
    const mediaFileName = uid

    await drive.put(mediaFileName, params.data.content.contents.toString())
    const fileStat = await drive.getMetaData(mediaFileName)

    return await Media.create(
      {
        uid: uid,
        filename: params.data.content.filename,
        size: fileStat.contentLength,
        driveName: params.data.driveName,
        mime: EXT_TO_MIME_TYPES[params.data.extension] || '',
      },
      {
        client: trx,
      }
    )
  }

  @withTransaction
  public async uploadFromDrive(params: {
    data: {
      from: {
        path: string
        drive?: string
      }
      extension: string
      driveName: string
    }
    context?: Context
  }): Promise<Media> {
    // const { default: mime } = await import('mime')
    let trx = params.context?.trx
    const drive = Drive.use(params.data.driveName)

    const uid = cuid()
    const mediaFileName = uid

    await drive.put(
      mediaFileName,
      !!params.data.from.drive
        ? await Drive.use(params.data.from.drive).get(params.data.from.path)
        : await fs.readFile(params.data.from.path)
    )

    const fileStat = await drive.getMetaData(mediaFileName)

    return await Media.create(
      {
        uid: uid,
        filename: path.basename(params.data.from.path),
        size: fileStat.contentLength,
        driveName: params.data.driveName,
        mime: EXT_TO_MIME_TYPES[params.data.extension] || '',
      },
      {
        client: trx,
      }
    )
  }

  @withTransaction
  public async uploadFromStream(params: {
    data: {
      stream: Readable
      filename: string
      driveName: string
      extension: string
    }
    context?: Context
  }): Promise<Media> {
    // const { default: mime } = await import('mime')
    let trx = params.context?.trx
    const drive = Drive.use(params.data.driveName)

    const uid = cuid()
    const mediaFileName = uid

    await drive.putStream(mediaFileName, params.data.stream)
    const fileStat = await drive.getMetaData(mediaFileName)

    return await Media.create(
      {
        uid: uid,
        filename: path.basename(params.data.filename),
        size: fileStat.contentLength,
        driveName: params.data.driveName,
        mime: EXT_TO_MIME_TYPES[params.data.extension] || '',
      },
      {
        client: trx,
      }
    )
  }

  @withTransaction
  public async downloadStream(params: {
    data: {
      media: {
        id: number
      }
    }
    context?: Context
  }): Promise<NodeJS.ReadableStream> {
    let trx = params.context?.trx

    let media = await Media.query({ client: trx }).where('id', params.data.media.id).firstOrFail()

    let drive = Drive.use(media.driveName)
    return await drive.getStream(media.uid)
  }

  @withTransaction
  public async download(params: {
    data: {
      media: {
        id: number
      }
    }
    context?: Context
  }): Promise<{
    media: Media
    buffer: Buffer
  }> {
    let trx = params.context?.trx

    let media = await Media.query({ client: trx }).where('id', params.data.media.id).firstOrFail()

    let drive = Drive.use(media.driveName as string)
    return {
      media: media,
      buffer: Buffer.from(await drive.getBytes(media.uid)),
    }
  }

  @withTransaction
  public async downloadThumbnail(params: {
    data: {
      media: {
        id: number
      },
      height?: number
      width?: number
      fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
    }
    context?: Context
  }): Promise<{
    media: Media
    buffer: Buffer
  }> {
    let trx = params.context?.trx

    let media = await Media.query({ client: trx }).where('id', params.data.media.id).firstOrFail()

    let drive = Drive.use(media.driveName as string)
    let buffer = await drive.get(media.uid)

    let thumbnail: Buffer
    try {
      thumbnail = await sharp(Buffer.from(buffer))
        .resize(Number(params.data.width) || 100, Number(params.data.height) || 100, { fit: params.data.fit || 'cover' })
        .jpeg()
        .toBuffer()
    } catch(e) {
      console.log(e)
      thumbnail = (await this.download({
        data: params.data,
        context: {
          trx
        }
      })).buffer
    }

    return {
      media: media,
      buffer: thumbnail
    }
  }

  @withTransaction
  public async delete(params: {
    data: {
      media: {
        id: number
      }
    }
    context?: Context
  }): Promise<void> {
    let trx = params.context?.trx

    let media = await Media.query({ client: trx }).where('id', params.data.media.id).firstOrFail()

    let drive = Drive.use(media.driveName as string)
    await drive.delete(media.uid)
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      media: {
        id: number
      }
    }
    context?: Context
  }): Promise<Media> {
    const user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let foundMedia = await Media.query({ client: trx })
      .where('id', params.data.media.id)
      .firstOrFail()

    return foundMedia
  }
}
