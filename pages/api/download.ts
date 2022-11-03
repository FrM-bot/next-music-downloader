// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import ytdl from "ytdl-core"
import fs from 'fs'
import path from 'path'
import { EXTENSION_FILE, PATH_DOWNLOADS } from "utils/PathMusic"

export type DataDownload = {
  title: string
  thumbnail: ytdl.thumbnail | undefined
  iframeUrl: string
}

type Error = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataDownload | Error>
) {
  if (req.method === 'POST') {
    try {
      if (!fs.existsSync(path.join('.', PATH_DOWNLOADS))) {
        fs.mkdir(path.join('.', PATH_DOWNLOADS), {recursive: true}, err => {
          console.error(err)
      })
      }
      
      const info = await ytdl.getInfo(req.body.url)
      const files = fs.readdirSync(path.join('.', PATH_DOWNLOADS))
      
      const details = {
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails.at(-1),
        iframeUrl: info.videoDetails.embed.iframeUrl
      }
      if (files.includes(info.videoDetails.title + EXTENSION_FILE)) {
        return res.status(200).json(details)
      }
      ytdl.downloadFromInfo(info, {
        filter: (format) => format.container === 'webm' && format.hasAudio,
      }).pipe(fs.createWriteStream(path.join(PATH_DOWNLOADS, info.videoDetails.title + EXTENSION_FILE)))
      res.status(200).json(details)
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ error: error.message })
    }
    
  }
}
