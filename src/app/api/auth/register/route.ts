import { NextRequest, NextResponse } from 'next/server'
import { registerSchema, createUser, getUserByEmail } from '@/lib/auth-utils'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedFields = registerSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input',
          details: validatedFields.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists' 
        },
        { status: 409 }
      )
    }

    // Create user
    const user = await createUser({
      name,
      email,
      password
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
