# PostEdit.AI - AI-Powered Post-Editing Platform

PostEdit.AI is a comprehensive platform designed to streamline the translation and content review process using AI assistance. It provides tools for human translation, post-editing, text classification, sequence tagging (NER), and translation rating tasks.

## Features

- 🔒 **Secure Authentication**
  - Email/password authentication
  - Role-based access control (System Admin, Agent Admin, User)
  - User approval workflow

- 🏢 **Agent Management**
  - Create and manage translation agencies
  - Assign admins and users to agents
  - Track agent performance and statistics

- 📋 **Project Management**
  - Multiple project types:
    - Human Translation
    - Post-Editing
    - Text Classification
    - Sequence Tagging (NER)
    - Literary Translation
    - Translation Rating
  - Task assignment and tracking
  - Review workflow
  - Progress monitoring

- 💬 **Real-time Chat**
  - Direct messaging
  - Group chats
  - File sharing
  - Online presence tracking

- 💼 **Task Management**
  - Intuitive task interfaces
  - Real-time autosave
  - Keyboard shortcuts
  - Bulk task operations
  - Language-specific assignments

- 📊 **Billing and Reports**
  - Per-task billing
  - Customizable rates
  - Billing history
  - Payment tracking
  - Performance analytics

## Tech Stack

- **Frontend Framework**: Next.js 12
- **UI Components**: shadcn/ui + Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Real-time Features**: Firestore Realtime
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Notifications**: Sonner

## Installation

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Firebase project with Authentication and Firestore enabled

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/postedit-ai.git
   cd postedit-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Development

1. Build the Docker image:
   ```bash
   docker build -t postedit-ai .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key \
     -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain \
     -e NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id \
     -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket \
     -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id \
     -e NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id \
     postedit-ai
   ```

### Docker Compose

1. Create a `docker-compose.yml` file:
   ```yaml
   version: '3.8'
   services:
     web:
       build: .
       ports:
         - "3000:3000"
       env_file:
         - .env.local
       volumes:
         - .:/app
         - /app/node_modules
   ```

2. Start the services:
   ```bash
   docker-compose up
   ```

## Project Structure

```
postedit-ai/
├── app/                  # App router components
├── components/           # Reusable components
│   ├── admin/           # Admin dashboard components
│   ├── agent/           # Agent management components
│   ├── auth/            # Authentication components
│   ├── chat/            # Chat components
│   ├── projects/        # Project management components
│   ├── tasks/           # Task management components
│   └── ui/              # UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
│   ├── constants/       # Constants and enums
│   ├── firebase.ts      # Firebase configuration
│   ├── roles.ts         # Role management
│   └── utils.ts         # Utility functions
├── pages/               # Page components
│   ├── admin/          # Admin dashboard pages
│   ├── agent/          # Agent management pages
│   ├── chat/           # Chat pages
│   └── tasks/          # Task management pages
├── public/             # Static assets
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── docker/             # Docker configuration files
```

## Development

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use shadcn/ui components for consistent UI
- Implement proper error handling
- Add JSDoc comments for complex functions

### Testing

Run tests:
```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Building

Build for production:
```bash
npm run build
```

### Deployment

Deploy to production:
```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Guidelines

- Update documentation for any new features
- Add tests for new functionality
- Ensure all tests pass
- Follow the existing code style
- Keep pull requests focused and atomic

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support:
- Open an issue in the GitHub repository
- Email support@postedit.ai
- Join our [Discord community](https://discord.gg/postedit)

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
