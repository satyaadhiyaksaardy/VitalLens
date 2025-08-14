import { prisma } from '../lib/db'

async function setupDatabase() {
  try {
    console.log('Setting up database...')
    
    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vitallens.com'
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!adminUser) {
      console.log('Creating admin user...')
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
        }
      })
      console.log(`Admin user created with ID: ${adminUser.id}`)
    } else {
      console.log(`Admin user already exists with ID: ${adminUser.id}`)
    }
    
    console.log('Database setup completed!')
  } catch (error) {
    console.error('Error setting up database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()