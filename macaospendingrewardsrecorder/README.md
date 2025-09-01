# Macao Lucky Draw Recorder

A modern web application for managing and tracking lucky draw awards with automatic expiry calculation and local storage persistence.

![Screenshot](https://github.com/user-attachments/assets/0a5c43bc-508e-4a10-8a69-bb7e23e786f3)

## Features

- ✨ **Award Management**: Complete CRUD operations for lucky draw awards
- 📅 **Smart Date Validation**: Prevents weekend draws and past dates
- ⏰ **Automatic Expiry**: Calculates expiry dates (30 days after draw date)
- 📊 **Real-time Statistics**: Dashboard with progress tracking and insights  
- 💾 **Local Storage**: All data persisted in browser with error handling
- 📱 **Responsive Design**: Mobile-first design using Tailwind CSS
- 🔄 **Status Management**: Track pending, claimed, and expired awards
- ✅ **Form Validation**: Real-time validation with user feedback

## Technology Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Runtime**: React 19.1.0
- **Deployment**: GitHub Pages (Static Export)

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/920wY0u20wnCh11d/macaospendingrewardsrecorder.git
cd macaospendingrewardsrecorder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `out` directory, ready for deployment to GitHub Pages.

## Usage

1. **Add Awards**: Fill in the award form with name, description, and draw date
2. **Validate Dates**: System prevents weekend draws and past dates  
3. **Track Status**: Mark awards as claimed or keep them pending
4. **View Statistics**: Monitor progress and upcoming draws in the dashboard
5. **Manage Awards**: Edit or delete existing awards as needed

## Key Validation Rules

- Draw dates cannot be on weekends (Saturday or Sunday)
- Draw dates cannot be in the past
- Expiry dates are automatically calculated as 30 days after draw date
- Awards automatically expire when past their expiry date

## Data Storage

All data is stored locally in your browser's localStorage. No external server or database is required. Data persists across browser sessions.

## Deployment

The application automatically deploys to GitHub Pages when changes are pushed to the main branch. The deployment workflow:

1. Builds the static Next.js application
2. Optimizes assets for production
3. Deploys to GitHub Pages

Live demo: [https://920wY0u20wnCh11d.github.io/macaospendingrewardsrecorder/](https://920wY0u20wnCh11d.github.io/macaospendingrewardsrecorder/)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m "Add new feature"`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
- Check the [Copilot Instructions](.github/copilot-instructions.md) for detailed documentation
- Open an issue on GitHub
- Review the code comments for implementation details
