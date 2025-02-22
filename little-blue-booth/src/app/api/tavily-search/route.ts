import { NextResponse } from 'next/server';
import { tavily } from '@tavily/core';
import { z } from 'zod';
import { env } from '~/env';

const TavilySearchSchema = z.object({
  query: z.string(),
  searchDepth: z.enum(['basic', 'advanced']).optional().default('basic'),
  topic: z.enum(['general', 'news']).optional().default('general'),
  days: z.number().optional().default(3),
  timeRange: z.string().optional(),
  maxResults: z.number().min(0).max(20).optional().default(5),
  includeImages: z.boolean().optional().default(false),
  includeImageDescriptions: z.boolean().optional().default(false),
  includeAnswer: z.union([z.boolean(), z.string()]).optional().default(false),
  includeRawContent: z.boolean().optional().default(false),
  includeDomains: z.array(z.string()).optional().default([]),
  excludeDomains: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = TavilySearchSchema.parse(body);

    const client = tavily({ apiKey: env.server.TAVILY_API_KEY });

    const result = await client.search(params);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Tavily Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
