# CodelessShipMore

A Next.js application with AI-powered features and multi-profile AI provider management.

## Features

- **Profile-First AI Settings**: Organize AI providers by profiles (Work, Personal, Development, etc.)
- **Multi-Provider Support**: Configure multiple AI providers per profile (OpenAI, Anthropic, Google, custom OpenAI-compatible)
- **Secure Storage**: API keys are encrypted and stored locally using localStorage
- **Clean Migration**: Automatic migration from IndexedDB to localStorage
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Developer Utilities

The application includes six powerful developer tools:

1. **JSON Viewer** - Format, validate, and visualize JSON data with an interactive tree view
2. **SQL Placeholder** - Fill JDBC-style parameter placeholders in SQL queries
3. **Properties Converter** - Convert between YAML, Properties, and ENV formats with Spring @Value support
4. **Record to Protobuf** - Convert Java 17 records to Protocol Buffers with multiple conversion modes
5. **Prompt Enhancer** - AI-powered prompt improvement with configurable parameters
6. **AI Settings** - Comprehensive provider and profile management interface

## AI Provider Management

The application supports a flexible profile-based system for managing AI providers:

- **Built-in Providers**: OpenAI, Anthropic Claude, Google Gemini, Cerebras
- **Custom Providers**: Add any OpenAI-compatible provider
- **Profile Isolation**: Each profile has its own set of providers and configurations
- **Multiple Active Providers**: Enable multiple providers simultaneously

## Getting Started

First, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Data Storage

AI settings are stored in your browser using:
- **localStorage**: For profile and provider configurations
- **Encryption**: AES-GCM encryption for API keys
- **Automatic Migration**: Seamless upgrade from previous IndexedDB implementation
- **No Server Storage**: All data stays on your device

## Development

This project uses:
- **Next.js 16**: with Turbopack for fast development
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **shadcn/ui**: For UI components
- **React Hooks**: For state management

## Documentation

For comprehensive documentation, see the `/docs` directory:

- [📋 Project Overview & PDR](./docs/project-overview-pdr.md) - Product vision, requirements, and roadmap
- [🏗️ System Architecture](./docs/system-architecture.md) - Detailed architecture patterns and design
- [💻 Code Standards](./docs/code-standards.md) - Coding conventions and best practices
- [📊 Codebase Summary](./docs/codebase-summary.md) - Overview of project structure and key files

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
