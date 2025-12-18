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
  onUpload?: (path: string) => void
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

    if (url) downloadImage(url)
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

  // Rethinking: The standard "Supabase Account" example has `uploadAvatar` inside the parent `Account` component, 
  // and passes it to `Avatar` component? No, usually `Avatar` handles the UI and the parent handles the logic.
  // But here, I want `Avatar` to be reusable.
  
  // Let's make `Avatar` strictly a display + file input component.
  // And the upload logic resides in `Avatar`?
  // If `Avatar` knows about `supabase.storage`, it's coupled.
  // But `downloadImage` is already coupling it.
  
  // Let's go with:
  // Component handles storage interactions (download/upload).
  // Exposes `onUpload` callback which returns the `path` (string) to the parent, so parent can update `profiles` table.
  
  return (
    <div className="relative">
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
          ?
        </div>
      )}
      
      {onUpload && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-full cursor-pointer">
           <label className="cursor-pointer text-white text-xs text-center p-1" htmlFor="single">
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
      )}
    </div>
  )
}
