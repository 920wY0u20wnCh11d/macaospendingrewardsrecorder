# Copilot Instructions for Macao Lucky Draw Recorder

## Project Overview
This is a Next.js-based web application designed to manage and track lucky draw awards. The application provides a complete CRUD interface for managing awards with automatic expiry calculation and local storage persistence.

## Architecture & Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Styling**: Tailwind CSS 4
- **Runtime**: React 19.1.0
- **TypeScript**: Full TypeScript implementation
- **Storage**: Browser localStorage with error handling
- **Build**: Static export for GitHub Pages deployment
- **Deployment**: Automated via GitHub Actions

## Key Features & Business Logic

### Award Management
- **CRUD Operations**: Create, Read, Update, Delete awards
- **Data Validation**: 
  - Required fields validation
  - Weekend date restriction (no draws on Saturday/Sunday)
  - Past date prevention for new draws
  - Form validation with real-time feedback

### Automatic Calculations
- **Expiry Date**: Automatically calculated as 30 days after draw date
- **Status Management**: Awards automatically marked expired when past expiry date
- **Statistics**: Real-time calculation of totals, pending, claimed, expired counts

### User Interface
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Component Structure**: Modular React components with proper separation of concerns
- **User Experience**: Form validation, loading states, confirmation dialogs
- **Visual Feedback**: Color-coded status indicators, progress bars, statistics dashboard

## File Structure & Components

### Core Components
- `src/components/AwardForm.tsx` - Award creation/editing with validation
- `src/components/AwardList.tsx` - Awards display with action buttons
- `src/components/Summary.tsx` - Statistics dashboard and progress tracking

### Utilities & Types
- `src/types/award.ts` - TypeScript interfaces for Award and form data
- `src/utils/storage.ts` - localStorage management with error handling
- `src/utils/dateUtils.ts` - Date validation, formatting, and calculations

### Pages & Layout
- `src/app/page.tsx` - Main application page with state management
- `src/app/layout.tsx` - Root layout with metadata
- `src/app/globals.css` - Global styles and Tailwind configuration

## Development Workflows

### Local Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server on localhost:3000
npm run build       # Build for production
npm run lint        # Run ESLint
```

### Key Development Conventions
- **State Management**: React hooks (useState, useEffect) for local state
- **Data Persistence**: localStorage with proper error boundaries
- **Form Handling**: Controlled components with real-time validation
- **Error Handling**: Try-catch blocks for storage operations
- **Component Props**: Proper TypeScript interfaces for all props
- **Event Handling**: Clear separation of business logic and UI logic

### Validation Logic
- **Draw Date Validation**: 
  - Must not be weekend (Saturday=6, Sunday=0)
  - Must not be in the past
  - Triggers automatic expiry calculation
- **Form Validation**: Real-time validation with error state management
- **Data Integrity**: Consistent data structure across all operations

## Integration Points

### External Dependencies
- **React & Next.js**: Core framework dependencies
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type checking and development experience

### Browser APIs
- **localStorage**: Primary data persistence layer
- **Date API**: Date calculations and validation
- **Form API**: Native form handling with React controlled components

### Deployment Integration
- **GitHub Actions**: Automated deployment to GitHub Pages
- **Static Export**: Next.js configured for static site generation
- **Asset Optimization**: Images and assets optimized for static hosting

## Common Tasks & Patterns

### Adding New Features
1. Define TypeScript interfaces in `src/types/`
2. Create utility functions in `src/utils/` if needed
3. Build React components in `src/components/`
4. Update main page to integrate new functionality
5. Test locally with `npm run dev`
6. Validate build with `npm run build`

### Modifying Award Logic
- Award status is automatically managed based on expiry dates
- All date calculations should use `src/utils/dateUtils.ts` functions
- Storage operations should use `src/utils/storage.ts` with error handling
- UI updates should reflect changes in real-time

### Styling & UI Updates
- Use Tailwind utility classes consistently
- Follow responsive design patterns (mobile-first)
- Maintain consistent color scheme and component spacing
- Test across different screen sizes

### Data Structure
```typescript
interface Award {
  id: string;           // Unique identifier
  name: string;         // Award name
  description: string;  // Award description
  drawDate: string;     // ISO date string
  expiryDate: string;   // Automatically calculated (drawDate + 30 days)
  status: 'pending' | 'claimed' | 'expired';
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

## Deployment & GitHub Pages

### Static Site Configuration
- Next.js configured for static export (`output: 'export'`)
- Base path set for GitHub Pages repository hosting
- Images configured as unoptimized for static hosting
- Trailing slashes enabled for proper routing

### GitHub Actions Workflow
- Triggers on pushes to `main` branch
- Automated build and deployment to GitHub Pages
- Node.js 18 environment with npm caching
- Proper permissions for Pages deployment

### Environment Considerations
- Production builds use repository base path
- Development builds run on localhost without base path
- All assets properly referenced for both environments

## Testing & Quality Assurance

### Manual Testing Checklist
- [ ] Award creation with all validations
- [ ] Award editing and updates
- [ ] Award deletion with confirmation
- [ ] Status changes (pending ↔ claimed)
- [ ] Automatic expiry date calculation
- [ ] Weekend date rejection
- [ ] Past date validation
- [ ] Statistics updates in real-time
- [ ] Local storage persistence across sessions
- [ ] Responsive design on mobile/desktop
- [ ] Static build generation
- [ ] GitHub Pages deployment

### Common Issues & Solutions
- **Date Validation**: Ensure timezone handling is consistent
- **LocalStorage**: Always wrap in try-catch for error handling  
- **Static Export**: Avoid server-side only features
- **Responsive Design**: Test on multiple screen sizes
- **State Updates**: Use functional updates for state consistency

## Performance Considerations
- **Local Storage**: Data persisted locally, no external API calls
- **Static Generation**: Entire app pre-built as static files
- **Component Optimization**: Functional components with proper hooks usage
- **Bundle Size**: Minimal dependencies and optimized build output

## Security Considerations
- **Data Privacy**: All data stored locally in browser
- **Input Validation**: Client-side validation for user experience
- **XSS Prevention**: React's built-in JSX escaping
- **CSRF**: Not applicable (no server-side state)