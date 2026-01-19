/**
 * Avatar Upload API
 *
 * POST /api/settings/avatar - Upload user avatar image
 * DELETE /api/settings/avatar - Remove user avatar
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'avatars'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Delete old avatar if exists
    const { data: userData } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (userData?.avatar_url) {
      // Extract old file path from URL
      const oldPath = userData.avatar_url.split(`${BUCKET_NAME}/`)[1]
      if (oldPath) {
        await supabase.storage.from(BUCKET_NAME).remove([oldPath])
      }
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image. Please try again.' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      // Try to clean up uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([fileName])
      return NextResponse.json(
        { error: 'Failed to save avatar. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      avatarUrl: publicUrl,
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current avatar URL
    const { data: userData } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (userData?.avatar_url) {
      // Extract file path from URL
      const filePath = userData.avatar_url.split(`${BUCKET_NAME}/`)[1]
      if (filePath) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath])
      }
    }

    // Clear avatar URL in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: null })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove avatar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Avatar removed successfully'
    })
  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    )
  }
}
