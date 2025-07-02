# Setup Guide for AI Features

## xAI Grok API Configuration

To enable AI-powered transcript analysis, you need to configure your xAI API key:

### Step 1: Get an xAI API Key
1. Visit [xAI Console](https://console.x.ai/)
2. Sign in with your X.com account or create an account
3. Generate a new API key
4. Copy the key

> **Why Grok?** Grok offers superior analysis capabilities with better reasoning and more nuanced understanding of complex interview scenarios compared to other AI models.

### Step 2: Create Environment File
1. In the root directory of this project, create a file named `.env.local`
2. Add the following content:
```
XAI_API_KEY=your_actual_api_key_here
```
3. Replace `your_actual_api_key_here` with your real API key from step 1

### Step 3: Restart the Server
After adding the API key, restart your development server:
```bash
npm run dev
```

## Using AI Analysis

Once configured, you can:

1. **Add Transcripts**: When adding or editing candidates, paste interview transcripts in the "Transcript" field
2. **Analyze**: Click the blue AI button (🧠) next to candidate names who have transcripts
3. **Review Results**: AI scores and explanations will populate automatically
4. **Manual Override**: You can still manually adjust scores alongside AI recommendations

## Troubleshooting

- **"xAI API key not configured"**: Make sure your `.env.local` file exists and contains the correct API key
- **Analysis fails**: Check that your API key is valid and has sufficient credits
- **No AI button**: Make sure the candidate has a transcript entered

## Security Note

The `.env.local` file is automatically ignored by git and won't be committed to version control, keeping your API key secure. 