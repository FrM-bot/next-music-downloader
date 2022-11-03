// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { readdir, unlink } from "fs/promises"
import path from 'path'
import { EXTENSION_FILE, PATH_DOWNLOADS } from "utils/PathMusic"
export type Error = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body)
  if (req.body?.name) {
    const pathFile = path.join(PATH_DOWNLOADS, req.body?.name + EXTENSION_FILE)
    await unlink(pathFile)
  }
  if (req.method === "POST") {
    try {
        const files = await readdir(PATH_DOWNLOADS)
      if (files.length > 0) {
        files.forEach( async (file) => {
            
            const pathFile = path.join(PATH_DOWNLOADS, file)
            await unlink(pathFile)
            console.log(file, pathFile)
        })
      }
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ error: error.message })
    }
  }
}
