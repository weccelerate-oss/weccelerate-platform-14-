/**
 * GET /api/_health/api-keys
 *
 * Public health check for the LLM provider API keys. Returns whether each
 * configured key actually authenticates (not just whether the env var is
 * present). Used to debug 401 issues without needing ADMIN_TOKEN.
 *
 * Hits the smallest possible endpoint per provider so the check is cheap.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ProviderHealth {
  hasKey: boolean;
  works?: boolean;
  status?: number;
  error?: string;
}

async function checkAnthropic(): Promise<ProviderHealth> {
  if (!process.env.ANTHROPIC_API_KEY) return { hasKey: false };
  try {
    // Smallest possible Anthropic call — 1-token completion.
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { hasKey: true, works: true, status: res.status };
    const body = await res.text();
    return { hasKey: true, works: false, status: res.status, error: body.slice(0, 300) };
  } catch (e) {
    return { hasKey: true, works: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function checkOpenAI(): Promise<ProviderHealth> {
  if (!process.env.OPENAI_API_KEY) return { hasKey: false };
  try {
    // /v1/models is a cheap auth check.
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { hasKey: true, works: true, status: res.status };
    const body = await res.text();
    return { hasKey: true, works: false, status: res.status, error: body.slice(0, 300) };
  } catch (e) {
    return { hasKey: true, works: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function checkPerplexity(): Promise<ProviderHealth> {
  if (!process.env.PERPLEXITY_API_KEY) return { hasKey: false };
  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { hasKey: true, works: true, status: res.status };
    const body = await res.text();
    return { hasKey: true, works: false, status: res.status, error: body.slice(0, 300) };
  } catch (e) {
    return { hasKey: true, works: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET() {
  const [anthropic, openai, perplexity] = await Promise.all([
    checkAnthropic(),
    checkOpenAI(),
    checkPerplexity(),
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    providers: { anthropic, openai, perplexity },
    summary: {
      anthropic: anthropic.hasKey ? (anthropic.works ? '✅ works' : `❌ key invalid (${anthropic.status})`) : '⚪ not configured',
      openai: openai.hasKey ? (openai.works ? '✅ works' : `❌ key invalid (${openai.status})`) : '⚪ not configured',
      perplexity: perplexity.hasKey ? (perplexity.works ? '✅ works' : `❌ key invalid (${perplexity.status})`) : '⚪ not configured',
    },
  });
}
