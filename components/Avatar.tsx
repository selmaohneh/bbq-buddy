'use client'

import React, { useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import Image from 'next/image'

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string
  url: string | null
  size: number
  onUpload?: (path: string | null) => void
}) {
  const { supabase } = useSupabase()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .download(path)
        if (error) {
          throw error
        }
        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }

    if (url) {
      downloadImage(url)
    } else {
      setAvatarUrl(null)
    }
  }, [url, supabase])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${uid}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      if (onUpload) {
        onUpload(filePath)
      }
    } catch (error) {
      alert('Error uploading avatar!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = () => {
    if (onUpload) {
        onUpload(null)
    }
  }

  return (
    <div className="relative inline-block">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar"
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ height: size, width: size }}
        />
      ) : (
        <div
          className="bg-gray-200 rounded-full flex items-center justify-center text-gray-500"
          style={{ height: size, width: size }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size * 0.5}
            height={size * 0.5}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      )}
      
      {onUpload && (
        <>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-full cursor-pointer overflow-hidden">
            <label className="cursor-pointer text-white text-xs text-center p-1 w-full h-full flex items-center justify-center" htmlFor="single">
                {uploading ? '...' : 'Upload'}
            </label>
            <input
                style={{
                visibility: 'hidden',
                position: 'absolute',
                }}
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
            />
            </div>
            {url && (
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        handleDelete()
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors transform translate-x-1/4 -translate-y-1/4"
                    title="Delete Avatar"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </>
      )}
    </div>
  )
}
