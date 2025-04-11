import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useSession } from 'next-auth/react'
import { v4 as uuidv4 } from 'uuid'

export default function TestImagePage() {
  const { data: session } = useSession()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [directUrl, setDirectUrl] = useState<string>('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.user?.id) return

    setUploadStatus('Uploading...')

    try {
      const userId = session.user.id
      const fileExt = file.name.split('.').pop()
      const fileName = `test-${uuidv4()}.${fileExt}`
      const filePath = `user_${userId}/${fileName}`

      console.log('Uploading to path:', filePath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('bucket1')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading file:', error)
        setUploadStatus(`Error: ${error.message}`)
        return
      }

      console.log('Upload successful:', data)

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bucket1')
        .getPublicUrl(filePath)

      console.log('Public URL from Supabase:', publicUrl)

      // Create a direct URL to test
      const directUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bucket1/${filePath}`
      setDirectUrl(directUrl)

      setImageUrl(publicUrl)
      setUploadStatus('Upload successful!')
    } catch (error: any) {
      console.error('Error:', error)
      setUploadStatus(`Error: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Image Upload and Display</h1>

      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        <p className="text-sm text-gray-500">{uploadStatus}</p>
      </div>

      {imageUrl && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Using Supabase URL</h2>
            <div className="border p-4 rounded-md">
              <p className="text-sm mb-2 break-all">{imageUrl}</p>
              <div className="relative h-64 w-64 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Uploaded image (Supabase URL)"
                  className="object-contain w-full h-full"
                  onError={() => console.error('Failed to load with Supabase URL')}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Using Direct URL</h2>
            <div className="border p-4 rounded-md">
              <p className="text-sm mb-2 break-all">{directUrl}</p>
              <div className="relative h-64 w-64 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={directUrl}
                  alt="Uploaded image (Direct URL)"
                  className="object-contain w-full h-full"
                  onError={() => console.error('Failed to load with Direct URL')}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Using img Tag with srcSet</h2>
            <div className="border p-4 rounded-md">
              <div className="relative h-64 w-64 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={imageUrl}
                  srcSet={`${imageUrl} 1x, ${imageUrl} 2x`}
                  alt="Uploaded image (with srcSet)"
                  className="object-contain w-full h-full"
                  onError={() => console.error('Failed to load with srcSet')}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
