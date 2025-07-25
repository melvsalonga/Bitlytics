import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Type definitions
export interface AuthUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: string
  emailVerified?: Date | null
}

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Utility functions
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
    }
  })

  return user as AuthUser
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  })

  return user
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}

export async function verifyUserEmail(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() }
  })
}
