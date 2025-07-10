# PPM Tool Finder

A comprehensive Project Portfolio Management (PPM) tool comparison platform that helps organizations find the best PPM solution for their needs.

## Features

- **Interactive Criteria Ranking**: Set importance levels for different evaluation criteria
- **Tool Comparison**: Compare multiple PPM tools against your specific requirements
- **Radar Chart Visualization**: Visual comparison of tools across all criteria
- **Smart Recommendations**: Get personalized tool recommendations based on your rankings
- **Advanced Filtering**: Filter tools by methodology (Agile, Waterfall), function areas, and custom criteria
- **Admin Dashboard**: Manage tools and submissions (for administrators)
- **User Authentication**: Secure login system with Supabase
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + React Chart.js 2
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Icons**: Lucide React
- **PDF Export**: jsPDF + html2canvas
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ppm-tool-finder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials in `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Database Setup

The project uses Supabase with a comprehensive schema including:

- **Tools**: PPM tool information and metadata
- **Criteria**: Evaluation criteria for comparing tools
- **User Management**: Authentication and user-specific data
- **Tool Submissions**: Community-driven tool additions
- **Admin System**: Administrative controls and approvals

Run the included migrations in the `supabase/migrations` folder to set up the database schema.

## Usage

### For Users

1. **Rank Criteria**: Start by ranking the importance of different criteria (1-5 scale)
2. **Select Tools**: Choose PPM tools you want to compare
3. **Analyze**: View the radar chart comparison and detailed breakdowns
4. **Get Recommendations**: Review personalized recommendations based on your criteria

### For Administrators

1. **Access Admin Dashboard**: Available to users with admin privileges
2. **Manage Tools**: Add, edit, approve, or reject tool submissions
3. **Review Submissions**: Moderate community-submitted tools
4. **Monitor System**: Track tool additions and user activity

## Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin dashboard components
│   ├── auth/            # Authentication components
│   ├── comparison/      # Chart and comparison components
│   └── filters/         # Filtering system components
├── contexts/            # React contexts
├── data/               # Static data and configurations
├── hooks/              # Custom React hooks
├── lib/                # Third-party library configurations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── styles/             # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Description of changes"`
4. Push to your branch: `git push origin feature-name`
5. Submit a pull request

## Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics or other services
# VITE_ANALYTICS_ID=your_analytics_id
```

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Open an issue on GitHub
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Enhanced filtering capabilities
- [ ] Advanced analytics dashboard
- [ ] Integration with popular project management APIs
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced reporting features 