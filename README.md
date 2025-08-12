# Udyam Registration Form - Full Stack Application

A complete full-stack web application that replicates the Udyam Registration form with modern web technologies.

## 🚀 Features

- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, responsive design
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL
- **Web Scraping**: Puppeteer for extracting form schema from official website
- **Real-time Validation**: Form validation with Zod and React Hook Form
- **Auto-fill Location**: PIN code to location mapping using PostPin API
- **Step-by-step Form**: Progressive form with step tracker
- **Mobile-first Design**: Fully responsive and mobile-optimized
- **Testing**: Comprehensive Jest test suites for both frontend and backend
- **Docker Support**: Complete containerization with Docker Compose
- **Cloud Deployment**: Ready for Vercel (frontend) and Railway (backend)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL (or Docker)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-1
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

**Scraper:**
```bash
cd scraper
npm install
```

### 3. Environment Variables

**Frontend (.env.local):**
```env
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/udyam_db?schema=public"
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Run the Scraper (Optional)

```bash
cd scraper
npm start
```

This will extract the latest form schema from the official Udyam registration website.

## 🚀 Running the Application

### Development Mode

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode with Docker

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000  
- Frontend app on port 3000

## 🧪 Testing

**Frontend Tests:**
```bash
npm test
```

**Backend Tests:**
```bash
cd backend
npm test
```

**Run All Tests:**
```bash
npm run test:all
```

## 📁 Project Structure

```
project-1/
├── src/                          # Next.js frontend
│   ├── components/               # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── StepTracker.tsx      # Form step navigation
│   │   ├── Step1Form.tsx        # Basic information form
│   │   ├── Step2Form.tsx        # Business details form
│   │   └── UdyamRegistrationForm.tsx # Main form component
│   ├── pages/api/               # API routes (proxy to backend)
│   ├── app/                     # Next.js app directory
│   └── lib/                     # Utility functions and schemas
├── backend/                      # Express.js backend
│   ├── src/
│   │   ├── controllers/         # API controllers
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   └── data/                # Form schema data
│   ├── prisma/                  # Database schema and migrations
│   └── tests/                   # Backend tests
├── scraper/                      # Web scraping utility
│   └── index.js                 # Puppeteer scraper
├── tests/                        # Frontend tests
├── docker-compose.yml           # Docker configuration
└── README.md                    # This file
```

## 🔧 API Endpoints

### Frontend (Next.js API Routes)
- `GET /api/form-schema` - Get form schema
- `POST /api/submit` - Submit form data  
- `GET /api/pincode/[pincode]` - Get location from PIN code

### Backend (Express API)
- `GET /api/health` - Health check
- `GET /api/form-schema` - Get form schema
- `POST /api/submit` - Submit and validate form data
- `GET /api/pincode/:pincode` - Get location details

## 🗂️ Database Schema

The application uses PostgreSQL with the following main tables:

**udyam_registrations**: Stores form submissions
- Basic information (Aadhaar, name, mobile, email, PAN)
- Business details (name, type, address, location)
- Metadata (timestamps, completion status)

**form_submission_logs**: API request logging
**postal_codes**: PIN code to location mapping cache

## 🚀 Deployment

### Frontend - Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `BACKEND_URL`: Your Railway backend URL
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
4. Deploy

### Backend - Railway

1. Push code to GitHub  
2. Connect repository to Railway
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `CORS_ORIGIN`: Your Vercel frontend URL
4. Deploy

### Database - Railway PostgreSQL

1. Create PostgreSQL service in Railway
2. Copy connection string to backend environment
3. Run migrations: `npx prisma migrate deploy`

## 🧪 Testing Strategy

**Frontend Tests:**
- Component rendering and interactions
- Form validation logic
- API integration testing
- Accessibility testing

**Backend Tests:**
- API endpoint functionality
- Validation middleware
- Database operations
- Error handling

## 🔒 Security Features

- Input validation with Zod schemas
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- SQL injection prevention with Prisma
- XSS protection with proper input sanitization

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Step Navigation**: Clear progress tracking with visual indicators
- **Real-time Validation**: Immediate feedback on form inputs
- **Auto-fill**: PIN code to location mapping
- **Loading States**: User feedback during API operations
- **Error Handling**: Comprehensive error messages and recovery

## 🔧 Development Tools

- **TypeScript**: Type safety across the stack
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Jest**: Testing framework
- **Docker**: Containerization
- **Prisma**: Type-safe database access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Government of India for the official Udyam Registration portal
- Next.js team for the excellent framework
- Prisma team for the amazing ORM
- All open-source contributors

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test files for usage examples

---

**Note**: This is a demonstration application. For actual Udyam registration, please use the official government portal at https://udyamregistration.gov.in
