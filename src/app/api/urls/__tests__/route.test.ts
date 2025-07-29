import { NextRequest } from 'next/server'
import { POST, GET } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

// Mock dependencies
jest.mock('@/lib/prisma')
jest.mock('next-auth/next')
jest.mock('@/lib/short-code', () => ({
  generateShortCode: jest.fn(() => 'abc123'),
  isValidCustomCode: jest.fn((code: string) => /^[a-zA-Z0-9-]{3,20}$/.test(code)),
  isReservedCode: jest.fn((code: string) => ['api', 'admin', 'auth'].includes(code.toLowerCase())),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/urls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.APP_URL = 'https://bit.ly'
  })

  describe('POST /api/urls', () => {
    it('should create a short URL for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)
      mockPrisma.shortUrl.findUnique.mockResolvedValue(null)
      mockPrisma.shortUrl.create.mockResolvedValue({
        id: '1',
        shortCode: 'abc123',
        originalUrl: 'https://example.com/',
        customCode: null,
        title: null,
        description: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        clickCount: 0,
        isActive: true,
        createdBy: null,
      })

      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        body: JSON.stringify({ originalUrl: 'https://example.com' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.shortCode).toBe('abc123')
      expect(data.data.originalUrl).toBe('https://example.com/')
      expect(data.data.shortUrl).toBe('https://bit.ly/abc123')
    })

    it('should create a short URL with custom code', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com' }
      } as Record<string, unknown>)
      mockPrisma.shortUrl.findUnique.mockResolvedValue(null)
      mockPrisma.shortUrl.create.mockResolvedValue({
        id: '1',
        shortCode: 'mylink',
        originalUrl: 'https://example.com/',
        customCode: 'mylink',
        title: 'My Link',
        description: 'Test description',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        clickCount: 0,
        isActive: true,
        createdBy: 'user1',
      })

      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        body: JSON.stringify({
          originalUrl: 'https://example.com',
          customCode: 'mylink',
          title: 'My Link',
          description: 'Test description'
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.shortCode).toBe('mylink')
      expect(data.data.title).toBe('My Link')
      expect(data.data.description).toBe('Test description')
    })

    it('should reject invalid URLs', async () => {
      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        body: JSON.stringify({ originalUrl: 'invalid-url' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid URL format')
    })

    it('should reject reserved custom codes', async () => {
      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        body: JSON.stringify({
          originalUrl: 'https://example.com',
          customCode: 'admin'
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('This custom code is reserved and cannot be used')
    })

    it('should reject invalid custom codes', async () => {
      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        body: JSON.stringify({
          originalUrl: 'https://example.com',
          customCode: 'ab' // too short
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Custom code must be 3-20 characters long and contain only letters, numbers, and hyphens')
    })

    it('should reject duplicate custom codes', async () => {
      mockPrisma.shortUrl.findUnique.mockResolvedValue({
        id: '1',
        shortCode: 'existing',
        originalUrl: 'https://other.com',
        customCode: 'existing',
        title: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        clickCount: 0,
        isActive: true,
        createdBy: null,
      })

      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        body: JSON.stringify({
          originalUrl: 'https://example.com',
          customCode: 'existing'
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toBe('This custom code is already taken')
    })

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle Zod validation errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/urls', {
        method: 'POST',
        body: JSON.stringify({ originalUrl: '' }), // empty URL
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
    })
  })

  describe('GET /api/urls', () => {
    it('should return paginated URLs for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com' }
      } as Record<string, unknown>)

      const mockUrls = [
        {
          id: '1',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          customCode: null,
          title: 'Test',
          description: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          clickCount: 5,
          isActive: true,
          createdBy: 'user1',
          _count: { clicks: 5 }
        }
      ]

      mockPrisma.shortUrl.findMany.mockResolvedValue(mockUrls as Record<string, unknown>[])
      mockPrisma.shortUrl.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/urls?page=1&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].shortUrl).toBe('https://bit.ly/abc123')
      expect(data.data[0].totalClicks).toBe(5)
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.total).toBe(1)
    })

    it('should return URLs for anonymous user', async () => {
      mockGetServerSession.mockResolvedValue(null)
      mockPrisma.shortUrl.findMany.mockResolvedValue([])
      mockPrisma.shortUrl.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/urls')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
      expect(mockPrisma.shortUrl.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdBy: null }
        })
      )
    })

    it('should handle pagination parameters', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com' }
      } as Record<string, unknown>)
      mockPrisma.shortUrl.findMany.mockResolvedValue([])
      mockPrisma.shortUrl.count.mockResolvedValue(25)

      const request = new NextRequest('http://localhost:3000/api/urls?page=2&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.total).toBe(25)
      expect(data.pagination.totalPages).toBe(3)
      expect(data.pagination.hasNext).toBe(true)
      expect(data.pagination.hasPrevious).toBe(true)

      expect(mockPrisma.shortUrl.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10
        })
      )
    })

    it('should limit maximum page size', async () => {
      mockGetServerSession.mockResolvedValue(null)
      mockPrisma.shortUrl.findMany.mockResolvedValue([])
      mockPrisma.shortUrl.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/urls?limit=200')
      const response = await GET(request)
      const data = await response.json()

      expect(data.pagination.limit).toBe(100) // Should be capped at 100
    })

    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue(null)
      mockPrisma.shortUrl.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/urls')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })
})
