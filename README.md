# ReelRum

ReelRum is a platform that connects property owners with individuals looking to rent spaces for short-term use. This MVP implementation focuses on creating a seamless experience for both property providers and renters.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS with ShadCN UI components
- **Backend**: Supabase (Authentication, Database, Storage)
- **Payment Processing**: Stripe
- **Deployment**: Vercel

## Features

- User authentication (signup, login, password reset)
- Property listing creation and management
- Property search with filters
- Booking system with availability calendar
- Payment processing
- User profiles and reviews
- Notifications system

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Project Structure

- `/app`: Next.js app router pages and layouts
- `/components`: Reusable UI components
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and configuration
- `/types`: TypeScript type definitions
- `/utils`: Helper functions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
