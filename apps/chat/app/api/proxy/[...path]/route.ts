import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://api.raweval.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'DELETE');
}

async function handleProxy(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';

    // Auth from header
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    const headers: Record<string, string> = {};
    if (!isMultipart) {
      headers['Content-Type'] = contentType || 'application/json';
    }
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Body for POST/PUT/PATCH
    let body: BodyInit | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (isMultipart) {
        body = await request.arrayBuffer();
        headers['Content-Type'] = contentType;
      } else {
        try {
          const json = await request.json();
          body = JSON.stringify(json);
        } catch {
          try {
            body = await request.text();
          } catch {
            body = undefined;
          }
        }
      }
    }

    // Build target URL
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;

    let targetPath: string;
    if (normalizedPath.startsWith('/llm-calls/') || normalizedPath === '/llm-calls') {
      targetPath = normalizedPath;
    } else if (normalizedPath.startsWith('/api/v1') || normalizedPath.startsWith('/api/v2')) {
      targetPath = normalizedPath;
    } else if (normalizedPath.startsWith('/v2/')) {
      targetPath = `/api${normalizedPath}`;
    } else {
      targetPath = `/api/v1${normalizedPath}`;
    }

    const targetUrl = `${API_BASE_URL}${targetPath}${queryString}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[proxy] ${method} ${targetPath}`, { hasBody: !!body, hasAuth: !!authHeader });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: body || undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseContentType = response.headers.get('content-type');
    let data: unknown;
    if (responseContentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok && process.env.NODE_ENV === 'development') {
      console.error(`[proxy] ${response.status} ${targetPath}`, data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[proxy] error:', error);
    const message = error instanceof Error ? error.message : 'Proxy error';
    return NextResponse.json(
      { error: message },
      { status: 503 }
    );
  }
}
