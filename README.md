# Vitals From Photo

A production-ready web application for extracting health vitals from kiosk photos using AI vision.

## Features

- 📸 Upload photos of health kiosk screens (height/weight/BMI machines, blood pressure monitors)
- 🤖 AI-powered extraction using Google Gemini Vision API
- ✏️ Review and edit extracted readings before saving
- 📊 Interactive charts showing trends over time
- 📈 Dashboard with KPIs and comparisons to previous readings
- 📋 History table with filtering and CSV export
- 🔄 Manual entry option when no photo is available

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **State Management**: React Query (TanStack Query)
- **Database**: SQLite via Prisma (easily switchable to PostgreSQL)
- **AI**: Google Gemini API
- **Auth**: NextAuth with mock local session (single user)

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:

```
GEMINI_API_KEY=your_api_key_here
```

5. Set up the database:

```bash
pnpm prisma migrate dev
```

6. (Optional) Seed with sample data:

```bash
pnpm run seed
```

7. Start the development server:

```bash
pnpm dev
```

8. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload**: Navigate to `/upload` and drag-drop or select health kiosk photos
2. **Extract**: Click "Extract Readings" to process the image with AI
3. **Review**: Edit any incorrectly extracted values and set the measurement date/time
4. **Save**: Save the reading to your database
5. **View**: Check the dashboard for latest readings and trends
6. **History**: Browse all readings at `/history` with filtering and CSV export

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   ├── upload/            # Upload page
│   ├── history/           # History page
│   └── page.tsx           # Dashboard
├── components/            # React components
├── lib/                   # Utility functions and services
│   ├── ai.ts             # Gemini API wrapper
│   ├── storage.ts        # Storage abstraction
│   └── db.ts             # Database client
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── uploads/              # Local file storage (dev only)
```

## Configuration

### Switching to S3 Storage

To use AWS S3 instead of local storage:

1. Install AWS SDK:

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. Update `.env` with S3 credentials:

```
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your-bucket-name
```

3. The storage service will automatically use S3 based on `STORAGE_TYPE`

### Switching to PostgreSQL

1. Update `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/vitals"
```

2. Update `prisma/schema.prisma` provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:

```bash
pnpm prisma migrate dev
```

## API Endpoints

- `POST /api/extract` - Extract readings from uploaded images
- `POST /api/readings` - Create a new reading
- `GET /api/readings` - List readings with optional date filters
- `GET /api/readings/:id` - Get a single reading
- `DELETE /api/readings/:id` - Delete a reading

## Development

```bash
# Run development server
pnpm dev

# Run type checking
pnpm type-check

# Format code
pnpm format

# Lint code
pnpm lint

# Run Prisma Studio
pnpm prisma studio
```

## Testing

Place sample kiosk images in the `test-images/` folder for testing the extraction feature.

## License

MIT
