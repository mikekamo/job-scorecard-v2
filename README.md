# Job Scorecard Application

A professional web application for systematically evaluating job candidates using customizable scorecards. Built with Next.js and Tailwind CSS.

## Features

### 🎯 **Job Management**
- Create multiple job positions with custom competencies
- Edit job details and competency frameworks
- Track candidates per job position
- Delete jobs when no longer needed

### 👥 **Candidate Evaluation**
- Add multiple candidates per job
- Score candidates on a 1-5 scale across all competencies
- Real-time calculation of overall candidate scores
- Visual score indicators (color-coded for quick assessment)

### 📊 **Scoring System**
- **1 - Poor**: Candidate does not meet expectations
- **2 - Below Average**: Candidate meets some expectations but has significant gaps
- **3 - Average**: Candidate meets basic expectations
- **4 - Good**: Candidate exceeds expectations in most areas
- **5 - Excellent**: Candidate significantly exceeds expectations

### 🎨 **User Experience**
- Clean, professional interface
- Responsive design (works on desktop, tablet, mobile)
- Sticky candidate column for easy reference
- Modal dialogs for adding candidates
- Export functionality for scorecard data

### 💾 **Data Persistence**
- All data is stored in browser's localStorage
- No server required - runs entirely in the browser
- Data persists between browser sessions

### 🤖 **AI-Powered Analysis**
- Upload interview transcripts for candidates
- Automatic competency scoring using ChatGPT API
- AI-generated explanations for each score
- Requires OpenAI API key configuration

## Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure OpenAI API (for AI analysis features):**
   - Create a `.env.local` file in the root directory
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Note: AI features will be disabled without this configuration

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## How to Use

### 1. Creating a Job
1. Click "New Job" on the main dashboard
2. Fill in the job title and department
3. Add a description (optional)
4. Customize competencies:
   - Default competencies are provided
   - Add new competencies with the "Add Competency" button
   - Remove unwanted competencies
   - Each competency should have a clear name and description

### 2. Adding Candidates
1. View a job's candidates by clicking "View Candidates"
2. Click "Add Candidate"
3. Enter candidate name (required), email, and notes
4. Click "Add Candidate" to save

### 3. Scoring Candidates
1. In the scorecard view, use the dropdown menus to score each candidate
2. Scores range from 1 (Poor) to 5 (Excellent)
3. Overall scores are calculated automatically
4. Color coding helps identify top performers:
   - 🟢 Green: 4-5 (Good to Excellent)
   - 🟡 Yellow: 3 (Average)
   - 🔴 Red: 1-2 (Below Average to Poor)

### 4. Using AI Analysis
1. When adding or editing a candidate, paste the interview transcript in the "Transcript" field
2. In the scorecard view, candidates with transcripts will show a blue AI analysis button (🧠)
3. Click the AI button to automatically:
   - Score the candidate on all competencies (1-5 scale)
   - Generate explanations based on transcript evidence
4. AI scores and explanations appear in dedicated columns
5. Manual scores can still be adjusted alongside AI recommendations

### 5. Exporting Data
- Click the "Export" button to download scorecard data as JSON
- Export includes all candidate information and scores
- Perfect for sharing with hiring teams or record-keeping

## Default Competencies

The application comes with 5 standard competencies:

1. **Technical Skills** - Proficiency in required technical skills
2. **Communication** - Verbal and written communication abilities
3. **Problem Solving** - Ability to analyze and solve complex problems
4. **Team Collaboration** - Works well with others and contributes to team success
5. **Cultural Fit** - Aligns with company values and culture

You can modify, add, or remove these competencies for each job position.

## Technology Stack

- **Frontend**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Storage**: Browser localStorage
- **Development**: ESLint for code quality

## Browser Compatibility

Works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Data Management

- All data is stored locally in your browser
- No data is sent to external servers
- Clear browser data will remove all scorecards
- For backup, use the export feature regularly

## Contributing

This is a self-contained application. To customize:
1. Modify competency defaults in `app/components/JobForm.js`
2. Adjust scoring scales in `app/components/ScorecardView.js`
3. Update styling in Tailwind classes
4. Add new features by creating additional components

## License

This project is for internal use and evaluation purposes. 