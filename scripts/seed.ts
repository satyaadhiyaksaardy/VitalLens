import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.reading.deleteMany();
  console.log('✅ Cleared existing readings');

  // Create sample readings
  const now = new Date();
  const readings = [
    {
      measuredAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      heightCm: 165.5,
      weightKg: 68.2,
      bmi: 24.9,
      standardWeightKg: 61.2,
      systolic: 118,
      diastolic: 78,
      pulse: 72,
      sourceImages: JSON.stringify(['sample1.jpg']),
      notes: 'Morning measurement after exercise',
    },
    {
      measuredAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      heightCm: 165.5,
      weightKg: 67.8,
      bmi: 24.7,
      standardWeightKg: 61.2,
      systolic: 120,
      diastolic: 80,
      pulse: 75,
      sourceImages: JSON.stringify(['sample2.jpg']),
      notes: null,
    },
    {
      measuredAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      heightCm: 165.5,
      weightKg: 67.5,
      bmi: 24.6,
      standardWeightKg: 61.2,
      systolic: 122,
      diastolic: 82,
      pulse: 73,
      sourceImages: JSON.stringify(['sample3.jpg']),
      notes: 'Afternoon measurement',
    },
    {
      measuredAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      heightCm: 165.5,
      weightKg: 67.2,
      bmi: 24.5,
      standardWeightKg: 61.2,
      systolic: 119,
      diastolic: 79,
      pulse: 70,
      sourceImages: JSON.stringify(['sample4.jpg']),
      notes: null,
    },
    {
      measuredAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      heightCm: 165.5,
      weightKg: 66.8,
      bmi: 24.4,
      standardWeightKg: 61.2,
      systolic: 117,
      diastolic: 77,
      pulse: 68,
      sourceImages: JSON.stringify(['sample5.jpg']),
      notes: 'Morning measurement, fasting',
    },
    {
      measuredAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      heightCm: 165.5,
      weightKg: 66.5,
      bmi: 24.3,
      standardWeightKg: 61.2,
      systolic: 121,
      diastolic: 81,
      pulse: 74,
      sourceImages: JSON.stringify(['sample6.jpg']),
      notes: null,
    },
    {
      measuredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      heightCm: 165.5,
      weightKg: 66.2,
      bmi: 24.2,
      standardWeightKg: 61.2,
      systolic: 118,
      diastolic: 78,
      pulse: 71,
      sourceImages: JSON.stringify(['sample7.jpg']),
      notes: 'After morning walk',
    },
    {
      measuredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      heightCm: 165.5,
      weightKg: 66.0,
      bmi: 24.1,
      standardWeightKg: 61.2,
      systolic: 116,
      diastolic: 76,
      pulse: 69,
      sourceImages: JSON.stringify(['sample8.jpg']),
      notes: 'Regular morning check',
    },
  ];

  for (const reading of readings) {
    await prisma.reading.create({
      data: reading,
    });
  }

  console.log(`✅ Created ${readings.length} sample readings`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });