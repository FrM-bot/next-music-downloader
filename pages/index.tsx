import Card from 'components/card'
import SVGCross from 'components/icons/SVGCross'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { FOLDER_NAME, PATH_DOWNLOADS, rootPath } from 'utils/PathMusic'
import Button from '../components/button'
import Input from '../components/input'
import Layout from '../components/Layout'
import Link from '../components/link'
import { Download } from '../services/Download'
import type { DataDownload } from './api/download'

const RemoveMusic = async (name: string) => {
  try {
    const response = await fetch('/clear', {
      headers: {
        "Content-Type": "application/json",
      },
      method: 'POST',
      body: JSON.stringify({ name })
    })
    const data = await response.json()
    return data
  } catch (error: any) {
    return { error: error.message }
  }
}

export default function Home() {
  const refForm = useRef(null)
  const [data, setData] = useState<DataDownload>()
  const [errorMessage, seterrorMessage] = useState('')

  const onSubmit = (e: FormEvent<HTMLFormElement> | undefined): void => {
    e?.preventDefault()
    const form = refForm.current
    if (form) {
      const formData = Object.fromEntries(new FormData(form))
      formData?.url && Download(formData?.url ?? '').then((res) => {
        if (res?.error) {
          console.error(res?.error)
          return seterrorMessage(res?.error)
        }
        setData(res)
        // GetMusic(res.title).then((res) => seturl(res)).catch(console.error)
        seterrorMessage('')
      }).catch(console.error)
    }
  }

  useEffect(() => {
    window.addEventListener("beforeunload", function (e) {
      const confirmationMessage = "\o/"
      e.returnValue = confirmationMessage
      return confirmationMessage
    })

    window.onunload = function (e) {
      if (!navigator.sendBeacon) return

      const url = "/api/clear"

      navigator.sendBeacon(url)
    }
  }, [])

  const handlerDeleteMusic = (name: string) => {
    RemoveMusic(name).then(console.log).catch(console.error)
    setData(undefined)
  }

  console.log(rootPath);
  

  return (
    <Layout>

      <div className='min-h-[80vh] max-w-2xl m-auto'>
        <form className='' ref={refForm} onSubmit={onSubmit}>
          <div className='flex gap-3 items-center justify-center my-3 w-full'>
            <Input props={{ name: 'url', type: 'url', required: true, placeholder: 'Music URL' }} />
            <Button props={{ type: 'submit' }}>Search</Button>
          </div>
        </form>
        {
          errorMessage &&
          <div className='bg-pink-400 p-2 rounded'>
            <span>{errorMessage}</span>
          </div>
        }
        <div className='flex flex-col gap-5 mt-8'>
          {
            data?.title &&
            <Card>
              <div className='flex justify-between items-center'>
                <h2>{data.title}</h2>
                <Button props={{ onClick: () => handlerDeleteMusic(data.title) }}><SVGCross /></Button>
              </div>

            </Card>
          }
          {
            data?.iframeUrl &&
            <iframe loading='lazy' title="trailer" className='aspect-video w-full' src={data?.iframeUrl} allowFullScreen />
          }
          {
            data?.title &&
            <div className='flex justify-center'>
              <Link props={{ title: data?.title, href: rootPath + FOLDER_NAME + '/' + data.title + '.mp3', download: data?.title }}>Confirm DownLoad</Link>
            </div>
          }

            </div>
        </div>
    </Layout>
  )
}


