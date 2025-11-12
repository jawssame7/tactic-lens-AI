# Setup Guide

This guide will help you set up and run the Tactic Lens AI application.

## Prerequisites

1. **Node.js 20.x or later** - [Download](https://nodejs.org/)
2. **AWS SAM CLI** - [Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3. **Docker** - Required for SAM local testing [Download](https://www.docker.com/)
4. **Gemini API Key** - [Get API Key](https://aistudio.google.com/app/apikey)

## Quick Start (Local Development)

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 2: Configure Backend

1. Create backend environment file:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

3. Create SAM configuration:
```bash
cp samconfig.toml.example samconfig.toml
```

4. Edit `backend/samconfig.toml` and update the GeminiApiKey parameter.

### Step 3: Run Backend Locally

Open a terminal and run:

```bash
cd backend
npm run sam:local
```

This will start the Lambda function locally on `http://127.0.0.1:3000`.

**Note:** Keep this terminal running while developing.

### Step 4: Configure Frontend

1. Create frontend environment file:
```bash
cd frontend
cp .env.example .env
```

2. Edit `frontend/.env`:
```
VITE_API_ENDPOINT=http://127.0.0.1:3000/analyze
```

### Step 5: Run Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Troubleshooting

### JSON Parse Error

If you see "Failed to execute 'json' on 'Response': Unexpected end of JSON input":

1. Make sure the backend is running (`npm run sam:local` in backend directory)
2. Check that `frontend/.env` has the correct API endpoint
3. Verify your Gemini API key is valid in `backend/.env`
4. Check the backend terminal for error messages

### SAM Local Issues

If `sam local start-api` fails:

1. Make sure Docker is running
2. Try building first: `npm run sam:build`
3. Check SAM CLI version: `sam --version` (should be 1.70.0 or later)

### Port Already in Use

If port 3000 is already in use:

1. Find the process: `lsof -ti:3000`
2. Kill it: `kill -9 $(lsof -ti:3000)`
3. Or use a different port in SAM local command and update frontend `.env`

## Production Deployment

### Deploy to AWS

1. Configure AWS credentials:
```bash
aws configure
```

2. Update `backend/samconfig.toml` with your Gemini API key

3. Deploy:
```bash
cd backend
npm run sam:build
npm run sam:deploy
```

4. After deployment, SAM will output the API Gateway URL:
```
CloudFormation outputs from deployed stack
--------------------------------------------------------------------------------
Outputs
--------------------------------------------------------------------------------
Key                 TacticLensApi
Description         API Gateway endpoint URL
Value               https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod/
--------------------------------------------------------------------------------
```

5. Update `frontend/.env` with the production API URL:
```
VITE_API_ENDPOINT=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod/analyze
```

6. Build and deploy frontend:
```bash
cd frontend
npm run build
# Deploy the dist/ directory to your hosting service (S3, Netlify, Vercel, etc.)
```

## Development Workflow

1. Start backend in one terminal: `cd backend && npm run sam:local`
2. Start frontend in another terminal: `cd frontend && npm run dev`
3. Make changes to code - both will hot-reload automatically
4. Run linter: `npm run check` (in frontend or backend directory)
5. Format code: `npm run format`

## Common Commands

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Biome linter and formatter
- `npm run lint` - Run linter only
- `npm run format` - Format code

### Backend
- `npm run sam:local` - Run Lambda locally
- `npm run sam:build` - Build SAM application
- `npm run sam:deploy` - Deploy to AWS
- `npm run sam:logs` - View CloudWatch logs
- `npm run sam:delete` - Delete CloudFormation stack
- `npm run check` - Run Biome linter and formatter

## Next Steps

Once you have the application running:

1. Upload a soccer match screenshot
2. Type a question about tactics or formations
3. The AI will analyze the image and provide insights
4. Continue the conversation to dive deeper into tactical analysis
