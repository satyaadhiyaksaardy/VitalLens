# Quick Start Guide - Vitals From Photo

## Prerequisites
- Node.js 18+ installed
- pnpm package manager (`npm install -g pnpm`)
- Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Setup Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Setup Database
```bash
pnpm prisma migrate dev --name init
```

### 4. (Optional) Add Sample Data
```bash
pnpm run seed
```

### 5. Start Development Server
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
vitals-from-photo/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── extract/         # AI extraction endpoint
│   │   ├── readings/        # CRUD for readings
│   │   └── images/          # Image serving
│   ├── upload/              # Upload page
│   ├── history/             # History page
│   └── page.tsx             # Dashboard
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── upload-card.tsx      # File upload
│   ├── review-form.tsx      # Edit extracted data
│   ├── kpi-card.tsx         # Dashboard metrics
│   └── trends-chart.tsx     # Recharts wrapper
├── lib/                     # Utilities
│   ├── ai.ts               # Gemini API wrapper
│   ├── storage.ts          # File storage abstraction
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Helper functions
├── prisma/                  # Database
│   └── schema.prisma       # Data model
└── aiPrompts/              # AI prompts
    └── extract.ts          # Extraction prompt

```

## Key Features

### 📸 Upload & Extract
1. Navigate to `/upload`
2. Drag & drop kiosk photos
3. Click "Extract Readings"
4. Review and edit values
5. Save to database

### 📊 Dashboard
- Latest vitals with delta indicators
- Blood pressure categorization (ACC-AHA)
- BMI classification
- Interactive trend charts
- Health insights and warnings

### 📋 History
- Filterable table of all readings
- Date range filtering
- CSV export
- Detailed view with original images

## Common Issues

### HEIC Images Not Working
The app converts HEIC to JPEG automatically, but if issues persist:
- Convert HEIC files to JPEG before uploading
- Or use PNG/JPG formats

### Extraction Not Working
- Ensure Gemini API key is correctly set
- Check that images are clear and well-lit
- Verify kiosk display is clearly visible

### Database Issues
```bash
# Reset database
rm prisma/dev.db
pnpm prisma migrate dev
```

## Production Deployment

### Environment Variables
Set these in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Your API key
- `NEXTAUTH_SECRET` - Random secret for auth
- `STORAGE_TYPE=s3` - For S3 storage
- AWS credentials if using S3

### Database Migration
```bash
pnpm prisma migrate deploy
```

### Build & Start
```bash
pnpm build
pnpm start
```

## Support

Check the main README.md for detailed documentation on:
- Switching to PostgreSQL
- Configuring S3 storage
- API endpoint details
- Data model specifications