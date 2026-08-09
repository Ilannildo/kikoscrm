import { headers } from 'next/headers';
import { getClientIp } from '@/lib/get-client-ip';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function forward(req: Request, params: { path: string[] }) {
	const clientIp = await getClientIp();

	const targetUrl = `${API_URL}/auth/${params.path.join('/')}`;

	const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text();

	const incoming = await headers();
	const outgoingHeaders = new Headers(incoming);

	if (clientIp) outgoingHeaders.set('x-client-ip', clientIp);

	const response = await fetch(targetUrl, {
		method: req.method,
		headers: outgoingHeaders,
		body,
	});

	return new Response(response.body, {
		status: response.status,
		headers: response.headers,
	});
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
	return forward(req, await ctx.params);
}

export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
	return forward(req, await ctx.params);
}
