import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createAdminClient } from '../../../utils/supabase/admin'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const formData = await request.formData()
    // Defensive fallback: treat missing/empty/"undefined" as not provided
    const rawBucket = formData.get('bucket')
    const bucket = (!rawBucket || String(rawBucket).trim() === '' || String(rawBucket) === 'undefined')
      ? 'product-images'
      : String(rawBucket)
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Derive file name and content type
    const originalName = file.name || 'upload.bin'
    const contentType = file.type || 'application/octet-stream'
    const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin'
    const fileName = `${uuidv4()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(fileName)

    return NextResponse.json({ publicUrl: data.publicUrl, path: fileName })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
