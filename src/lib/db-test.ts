import { prisma } from './prisma'

/**
 * Test database connectivity and basic operations
 */
export async function testDatabaseConnection() {
  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Test basic query
    const userCount = await prisma.user.count()
    const urlCount = await prisma.shortUrl.count()
    const clickCount = await prisma.click.count()

    console.log('📊 Database Statistics:')
    console.log(`  Users: ${userCount}`)
    console.log(`  URLs: ${urlCount}`)
    console.log(`  Clicks: ${clickCount}`)

    return { success: true, stats: { userCount, urlCount, clickCount } }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}
