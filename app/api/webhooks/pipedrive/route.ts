/**
 * Pipedrive Webhook Handler — DISABLED
 * Pipedrive integration has been disconnected.
 */

import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ success: false, message: 'Pipedrive integration disabled' }, { status: 410 });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'disabled', message: 'Pipedrive integration disabled' });
}
