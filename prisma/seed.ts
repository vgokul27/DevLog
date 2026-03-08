import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@devlog.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'E-commerce Platform',
      description: 'Building a full-stack e-commerce platform with payment integration',
      techStack: JSON.stringify(['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL']),
      status: 'Building',
      repoUrl: 'https://github.com/example/ecommerce',
      userId: user.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Portfolio Website',
      description: 'Personal portfolio showcasing projects and blog posts',
      techStack: JSON.stringify(['React', 'Tailwind CSS', 'Framer Motion']),
      status: 'Shipped',
      liveUrl: 'https://example.com',
      repoUrl: 'https://github.com/example/portfolio',
      userId: user.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Mobile Fitness App',
      description: 'React Native app for tracking workouts and nutrition',
      techStack: JSON.stringify(['React Native', 'Expo', 'Firebase']),
      status: 'Idea',
      userId: user.id,
    },
  });

  // Create sample entries
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  await prisma.entry.create({
    data: {
      title: 'Learned about React Server Components',
      body: `# React Server Components

Today I dove deep into React Server Components and how they work in Next.js 15. Key takeaways:

- Server Components run only on the server, reducing client bundle size
- They can directly access backend resources (databases, file system)
- Great for data fetching without useEffect
- You can mix Server and Client Components seamlessly

The mental model shift is understanding that RSC is about where code runs, not when.`,
      date: now,
      tags: JSON.stringify(['React', 'Next.js', 'Server Components']),
      projectId: project1.id,
      userId: user.id,
    },
  });

  await prisma.entry.create({
    data: {
      title: 'Implemented Stripe Payment Integration',
      body: `# Stripe Integration

Successfully integrated Stripe checkout into the e-commerce platform:

1. Set up Stripe webhook handlers in Next.js API routes
2. Implemented proper error handling and idempotency
3. Added order confirmation emails
4. Created admin dashboard for viewing transactions

Challenges faced:
- Understanding webhook signature verification
- Handling failed payments gracefully
- Testing with Stripe CLI

Total time: ~6 hours`,
      date: yesterday,
      tags: JSON.stringify(['Stripe', 'Payments', 'Next.js', 'Backend']),
      projectId: project1.id,
      userId: user.id,
    },
  });

  await prisma.entry.create({
    data: {
      title: 'CSS Grid vs Flexbox - When to Use Each',
      body: `# CSS Grid vs Flexbox

Solidified my understanding of when to use each layout system:

**Use Flexbox when:**
- Laying out items in a single direction (row or column)
- Content should determine layout
- Items need to wrap naturally

**Use Grid when:**
- Creating two-dimensional layouts
- You need precise control over rows AND columns
- Layout should be more rigid and structured

Best approach: Use both! Grid for overall page layout, Flexbox for component internals.`,
      date: twoDaysAgo,
      tags: JSON.stringify(['CSS', 'Layout', 'Frontend']),
      userId: user.id,
    },
  });

  await prisma.entry.create({
    data: {
      title: 'Set up CI/CD Pipeline with GitHub Actions',
      body: `# GitHub Actions CI/CD

Created a robust deployment pipeline:

\`\`\`yaml
- Run tests on every PR
- ESLint and TypeScript checks
- Build verification
- Automatic deployment to Vercel on merge to main
\`\`\`

This saves so much time and prevents broken code from reaching production!`,
      date: threeDaysAgo,
      tags: JSON.stringify(['DevOps', 'CI/CD', 'GitHub Actions']),
      projectId: project2.id,
      userId: user.id,
    },
  });

  // Create sample resources
  await prisma.resource.create({
    data: {
      title: 'Next.js 15 Documentation',
      url: 'https://nextjs.org/docs',
      category: 'Docs',
      notes: 'Official docs - great for App Router patterns',
      isFavorite: true,
      isRead: true,
      tags: JSON.stringify(['Next.js', 'Documentation']),
      userId: user.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: 'TypeScript Deep Dive',
      url: 'https://basarat.gitbook.io/typescript/',
      category: 'Course',
      notes: 'Comprehensive guide to TypeScript',
      isFavorite: true,
      isRead: false,
      tags: JSON.stringify(['TypeScript', 'Learning']),
      userId: user.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: 'The Primeagen - Vim Motions',
      url: 'https://youtube.com/watch?v=example',
      category: 'Video',
      notes: 'Great intro to Vim motions for productivity',
      isFavorite: false,
      isRead: true,
      tags: JSON.stringify(['Vim', 'Productivity']),
      userId: user.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: 'Stripe API Reference',
      url: 'https://stripe.com/docs/api',
      category: 'Docs',
      notes: 'Need this for payment integration',
      isFavorite: false,
      isRead: true,
      tags: JSON.stringify(['Stripe', 'API']),
      userId: user.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: 'React Query Practical Guide',
      url: 'https://tkdodo.eu/blog/practical-react-query',
      category: 'Article',
      notes: 'Best practices for using React Query',
      isFavorite: true,
      isRead: false,
      tags: JSON.stringify(['React Query', 'State Management']),
      userId: user.id,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
