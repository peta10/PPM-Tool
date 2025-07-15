# PPM Tool Finder - Complete Project Structure Documentation

## Overview
This is a comprehensive Project Portfolio Management (PPM) tool comparison platform built with React, TypeScript, and Supabase. The application helps organizations find the best PPM solution for their needs through guided assessments, interactive comparisons, and data-driven recommendations.

---

## Root Configuration Files

### Package Management
- **`package.json`** - Main project configuration with dependencies and scripts
- **`package-lock.json`** - Locked versions of all dependencies for consistent installs

### Build & Development Tools
- **`vite.config.ts`** - Vite bundler configuration with React plugin, path aliases, and chunk optimization
- **`tsconfig.json`** - Root TypeScript configuration
- **`tsconfig.app.json`** - TypeScript config for application code
- **`tsconfig.node.json`** - TypeScript config for Node.js tools

### Styling & UI
- **`tailwind.config.js`** - Tailwind CSS configuration for utility-first styling
- **`postcss.config.js`** - PostCSS configuration for CSS processing
- **`components.json`** - Shadcn/ui component library configuration

### Code Quality
- **`eslint.config.js`** - ESLint configuration for code linting and formatting

### Project Documentation
- **`README.md`** - Project overview, setup instructions, and usage guide
- **`.gitignore`** - Files and directories to exclude from Git tracking

### Web Assets
- **`index.html`** - Main HTML template with app root element

---

## Source Code Structure (`src/`)

### Application Entry Point
- **`main.tsx`** - React application entry point, renders App component
- **`vite-env.d.ts`** - TypeScript definitions for Vite environment
- **`index.css`** - Global CSS styles, animations, and responsive design utilities

### Core Application
- **`App.tsx`** - Main application component orchestrating all sections and state management

### Component Architecture (`src/components/`)

#### Admin Management (`admin/`)
- **`AdminDashboard.tsx`** - Main admin interface for tool management
- **`AdminToolForm.tsx`** - Multi-step form for adding new PPM tools to the database
- **`EditToolForm.tsx`** - Form for editing existing tool information and ratings
- **`StatusDropdown.tsx`** - Dropdown component for changing tool approval status
- **`ToolsList.tsx`** - Table component displaying all tools with filtering and management actions

#### Authentication (`auth/`)
- **`AuthMenu.tsx`** - User authentication menu component
- **`LoginModal.tsx`** - Modal dialog for user login functionality

#### Smart Welcome Experience (`smart-welcome/`)
- **`GuidedCriteriaQuestions.tsx`** - Interactive questionnaire to intelligently rank criteria based on user responses

#### Chart & Visualization Components (`comparison/`)
- **`ChartContainer.tsx`** - Wrapper component for radar chart visualization
- **`ChartHeader.tsx`** - Header component for chart sections

#### Filter System (`filters/`)
- **`FilterSystem.tsx`** - Main filtering interface with methodology, function, and criteria filters
- **`CustomFilter.tsx`** - Advanced filtering with custom criteria conditions
- **`FunctionFilter.tsx`** - Filter tools by business function (Marketing, Engineering, etc.)
- **`MethodologyFilter.tsx`** - Filter tools by methodology (Agile, Waterfall, etc.)
- **`ToolFilters.tsx`** - Combined filter interface component

#### UI Components (`ui/`)
- **`accordion.tsx`** - Collapsible content accordion component
- **`badge.tsx`** - Small status/label badge component
- **`button.tsx`** - Reusable button component with variants
- **`card.tsx`** - Card container component for content sections
- **`progress.tsx`** - Progress bar component
- **`separator.tsx`** - Visual separator/divider component
- **`slider.tsx`** - Range slider input component
- **`slider-demo.tsx`** - Demo component for slider usage
- **`tooltip.tsx`** - Hover tooltip component

#### Core Feature Components
- **`ChartControls.tsx`** - Controls for toggling chart visibility and settings
- **`CompactToolCard.tsx`** - Condensed tool display card
- **`ComparisonChart.tsx`** - Interactive radar chart for tool comparison
- **`ComparisonChartContainer.tsx`** - (Empty) Container for comparison charts
- **`ComparisonSection.tsx`** - Main section containing all comparison visualizations
- **`CriteriaDetails.tsx`** - Detailed breakdown of criteria for a specific tool
- **`CriteriaRatings.tsx`** - Component showing tool ratings across criteria
- **`CriteriaSection.tsx`** - Main criteria ranking and management interface
- **`DisclaimerTooltip.tsx`** - Legal disclaimer tooltip component
- **`DraggableItem.tsx`** - Individual draggable item wrapper
- **`DraggableList.tsx`** - Drag-and-drop list container for reordering
- **`EmbeddableChartDemo.tsx`** - Demo of embeddable chart functionality
- **`EmbeddableComparisonChart.tsx`** - Standalone embeddable chart component
- **`EnhancedCompactToolCard.tsx`** - Improved version of compact tool display
- **`EnhancedRecommendationSection.tsx`** - Advanced recommendations with match scoring
- **`FullscreenNavigation.tsx`** - Navigation controls for mobile fullscreen views
- **`GuidedRankingForm.tsx`** - Guided questionnaire for ranking criteria importance
- **`Header.tsx`** - Main application header with navigation
- **`LegalDisclaimer.tsx`** - (Empty) Legal disclaimer component
- **`LoadingStates.tsx`** - Various loading animations and skeleton screens
- **`PersistenceWarning.tsx`** - (Empty) Warning about data persistence
- **`RecommendationSection.tsx`** - Tool recommendations based on criteria weights
- **`RecommendationTooltip.tsx`** - Tooltip explaining recommendation logic
- **`RemovedCriteriaMenu.tsx`** - Menu for restoring removed criteria
- **`RemovedToolsMenu.tsx`** - Menu for restoring removed tools
- **`StepsSection.tsx`** - Step-by-step process indicator
- **`ToolCard.tsx`** - Individual tool display card
- **`ToolHeader.tsx`** - Header section for tool cards
- **`ToolRatings.tsx`** - Component displaying tool ratings across criteria
- **`ToolSection.tsx`** - Main tool selection and management interface
- **`UseCaseFilter.tsx`** - Filter tools by use case
- **`WelcomeScreen.tsx`** - Comprehensive welcome/onboarding screen

### Context Providers (`src/contexts/`)
- **`FullscreenContext.tsx`** - React context for managing mobile fullscreen states

### Data Layer (`src/data/`)
- **`criteria.ts`** - (Empty) Default criteria definitions
- **`criteriaDescriptions.ts`** - (Empty) Detailed criteria descriptions
- **`tools.ts`** - (Empty) Default tool data

### Feature Modules (`src/features/`)
- **`tool-comparison/`** - Directory structure for tool comparison features
  - **`components/`** - (Empty) Feature-specific components
  - **`hooks/`** - (Empty) Feature-specific React hooks

### Custom Hooks (`src/hooks/`)
- **`useAuth.ts`** - Authentication state management hook
- **`useClickOutside.ts`** - Hook for detecting clicks outside elements

### Library Configurations (`src/lib/`)
- **`supabase.ts`** - (Empty) Supabase client configuration
- **`utils.ts`** - Utility functions for class name merging

### Type Definitions (`src/types/`)
- **`index.ts`** - TypeScript interfaces for Tool, Criterion, and other data structures

### Utility Functions (`src/utils/`)
- **`chartColors.ts`** - Color palette management for charts
- **`filterTools.ts`** - Logic for filtering tools based on criteria
- **`highlightElement.ts`** - Utility for highlighting UI elements
- **`pdfExport.ts`** - Main PDF export functionality

#### PDF Export System (`src/utils/pdfExport/`)
- **`index.ts`** - Main PDF generation orchestrator
- **`PDFDocument.ts`** - PDF document class with styling and layout methods
- **`charts.ts`** - Radar chart generation for PDFs
- **`constants.ts`** - (Empty) PDF-related constants
- **`formatters.ts`** - Data formatting utilities for PDF content
- **`types.ts`** - TypeScript interfaces for PDF generation
- **`utils.ts`** - PDF utility functions and helpers

##### PDF Sections (`src/utils/pdfExport/sections/`)
- **`comparisonTable.ts`** - Generates comparison tables in PDFs
- **`coverPage.ts`** - Creates PDF cover page
- **`detailedRankings.ts`** - Detailed tool ranking tables
- **`executiveSummary.ts`** - Executive summary section
- **`radarCharts.ts`** - Radar chart visualizations in PDFs
- **`toolAnalysis.ts`** - Individual tool analysis sections

---

## Database & Backend (`supabase/`)

### Database Migrations (`supabase/migrations/`)

#### Core Schema Migrations
- **`20250220152354_autumn_palace.sql`** - Initial database schema with tools, criteria, tags, and views
- **`20250220153334_rough_frog.sql`** - (Empty) Schema adjustment
- **`20250220153954_dusty_scene.sql`** - (Empty) Additional schema changes
- **`20250220155148_dawn_hat.sql`** - Tool submission system with approval workflow
- **`20250220155738_royal_mouse.sql`** - Admin user roles and permissions
- **`20250220171937_winter_credit.sql`** - (Empty) Schema refinement
- **`20250220172919_young_mountain.sql`** - (Empty) Additional adjustments
- **`20250220173002_floral_star.sql`** - (Empty) Schema updates
- **`20250220173041_super_voice.sql`** - (Empty) Further refinements
- **`20250220173112_hidden_jungle.sql`** - (Empty) Schema modifications
- **`20250220173452_shrill_band.sql`** - (Empty) Additional changes
- **`20250220173544_late_lodge.sql`** - (Empty) Schema updates
- **`20250220173637_plain_waterfall.sql`** - (Empty) Database adjustments
- **`20250220173716_wild_harbor.sql`** - (Empty) Schema refinements
- **`20250220173752_quick_fog.sql`** - (Empty) Additional modifications
- **`20250220173859_orange_peak.sql`** - (Empty) Schema updates
- **`20250220174053_shrill_palace.sql`** - (Empty) Further adjustments
- **`20250220174438_odd_river.sql`** - Auth configuration table

#### Feature Development Migrations (February 21, 2025)
- **`20250221153941_holy_wave.sql`** - Updated tool submission function
- **`20250221154358_long_cottage.sql`** - User authentication checks and tool submission improvements
- **`20250221155049_broad_star.sql`** - (Empty) Schema adjustment
- **`20250221161007_small_snowflake.sql`** - Combined tools view creation
- **`20250221161112_ivory_prism.sql`** - Enhanced combined tools view
- **`20250221161143_twilight_dust.sql`** - Further view improvements
- **`20250221161352_ancient_river.sql`** - Major submission system overhaul with status management
- **`20250221161651_patient_sunset.sql`** - Combined tools view updates
- **`20250221161741_lucky_moon.sql`** - Additional view refinements
- **`20250221161846_pink_math.sql`** - Tools view creation
- **`20250221161927_white_bread.sql`** - Enhanced tools view
- **`20250221162050_wild_violet.sql`** - Function updates for tool management
- **`20250221162239_steep_butterfly.sql`** - Tools view improvements
- **`20250221162838_aged_summit.sql`** - Additional view enhancements
- **`20250221165858_smooth_meadow.sql`** - Further tools view updates
- **`20250221173726_round_shadow.sql`** - Tools view refinements
- **`20250221173801_nameless_palace.sql`** - Additional view improvements
- **`20250221173840_aged_meadow.sql`** - Enhanced tools view
- **`20250221173902_curly_dune.sql`** - Further view updates
- **`20250221173936_violet_feather.sql`** - Tools view enhancements
- **`20250221181711_falling_surf.sql`** - Final tools view optimization

#### Recent Feature Updates (March 4, 2025)
- **`20250304044619_rough_mountain.sql`** - Tool submission function updates
- **`20250304045014_crimson_portal.sql`** - Criteria update function improvements
- **`20250304052549_dark_mountain.sql`** - Tag update function enhancements
- **`20250304052654_aged_stream.sql`** - Additional criteria function updates
- **`20250304052842_divine_glitter.sql`** - Admin system improvements with enhanced functions
- **`20250304053008_azure_art.sql`** - Admin users table updates
- **`20250304053911_light_cell.sql`** - Function improvements for admin operations
- **`20250304054732_ivory_bar.sql`** - Comprehensive admin functions and tools view
- **`20250304054925_cool_spark.sql`** - Function refinements
- **`20250304055102_quiet_shrine.sql`** - Tools view optimization
- **`20250304055435_late_sound.sql`** - Admin tools view creation
- **`20250304055827_crystal_beacon.sql`** - Enhanced admin functions and views
- **`20250304060120_cool_hill.sql`** - Tool status management and admin tools view
- **`20250304060353_empty_flower.sql`** - Tool status function updates
- **`20250304060555_fading_truth.sql`** - Final tool status function improvements

---

## Documentation (`docs/`)
- Directory for project documentation (currently empty)

---

## Key Technical Features

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Chart.js** for interactive data visualizations
- **React Context** for state management
- **Drag & Drop** functionality with @dnd-kit

### Backend & Database
- **Supabase** for PostgreSQL database and authentication
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live data updates
- **Admin role management** system
- **Tool submission and approval workflow**

### User Experience
- **Responsive design** for desktop and mobile
- **Progressive enhancement** with mobile-first approach
- **Intelligent onboarding** with guided questionnaires
- **Interactive filtering** and comparison tools
- **PDF export** functionality for reports

### Data Management
- **Dynamic tool comparison** with weighted scoring
- **Flexible criteria system** with user customization
- **Tag-based categorization** (methodologies, functions)
- **User preference persistence**
- **Admin content management**

---

## Application Flow

1. **Welcome/Onboarding** - Introduction and guided setup
2. **Criteria Ranking** - User sets importance weights for evaluation criteria
3. **Tool Selection** - Browse and filter available PPM tools
4. **Comparison & Analysis** - Visual charts and detailed comparisons
5. **Recommendations** - Personalized tool suggestions based on user priorities
6. **Export & Action** - Download reports and next steps

This comprehensive structure enables organizations to make informed decisions about PPM tool selection through data-driven analysis and personalized recommendations. 