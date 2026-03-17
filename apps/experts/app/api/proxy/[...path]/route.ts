import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://api.raweval.com';

// Validate API URL is set
if (!API_BASE_URL) {
  console.error(
    'API_BASE_URL is not configured. Set NEXT_PUBLIC_API_URL or API_URL environment variable.'
  );
}

// SSL certificate verification is enabled by default
// api.raweval.com should have a valid SSL certificate

/**
 * Generic API proxy route
 * Proxies all API requests to avoid CORS issues
 *
 * Usage: /api/proxy/auth/register, /api/proxy/experts, etc.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';

    // Get token from Authorization header only (server-side)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Build headers
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    const headers: Record<string, string> = {};

    // For multipart, do NOT set Content-Type — let fetch set it with the correct boundary
    if (!isMultipart) {
      headers['Content-Type'] = contentType || 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Get body for POST/PUT/PATCH
    let body: BodyInit | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (isMultipart) {
        // For multipart/form-data (file uploads), pass the raw body through
        // We must read it as a blob/arrayBuffer to preserve binary data
        try {
          body = await request.arrayBuffer();
          // Preserve the original Content-Type with boundary
          headers['Content-Type'] = contentType;
        } catch (error) {
          console.error('Failed to read multipart body:', error);
          return NextResponse.json(
            { error: 'Failed to read file upload' },
            { status: 400 }
          );
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        // Form-encoded data
        try {
          body = await request.text();
          if (!body || (typeof body === 'string' && body.trim().length === 0)) {
            return NextResponse.json(
              { error: 'Request body is empty' },
              { status: 400 }
            );
          }
        } catch (error) {
          console.error('Failed to read form-encoded body:', error);
          return NextResponse.json(
            { error: 'Failed to read request body' },
            { status: 400 }
          );
        }
      } else {
        // JSON or other content types
        try {
          const requestBody = await request.json();
          body = JSON.stringify(requestBody);
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
    // LLM calls go to /llm-calls/* (no /api/v1 prefix)
    // Other API calls go to /api/v1/*
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Defensive: Strip protocol and domain if included in path (prevent double-prefixing)
    // Sometimes client might send absolute URL as path: "http://host/api/..."
    if (normalizedPath.match(/^(\/?)https?:\//)) {
      console.warn(
        'Proxy received absolute URL in path, stripping protocol:',
        normalizedPath
      );
      // Remove protocol and domain, keep path
      // Regex matches http:// or https://, then anything until next /
      normalizedPath = normalizedPath.replace(/^(\/?)https?:\/\/[^\/]+/, '');
      // Ensure we start with /
      if (!normalizedPath.startsWith('/'))
        normalizedPath = `/${normalizedPath}`;
    }

    // Route mapping:
    // - /llm-calls/* → keep as-is
    // - /api/v1/* → keep as-is (already prefixed)
    // - /api/v2/* → keep as-is (V2 endpoints like /api/v2/interview/*)
    // - /v2/* → prefix with /api (V2 endpoints without /api prefix)
    // - everything else → prefix with /api/v1
    let targetPath: string;
    if (normalizedPath.startsWith('/llm-calls/') || normalizedPath === '/llm-calls') {
      targetPath = normalizedPath;
    } else if (normalizedPath.startsWith('/api/v1') || normalizedPath.startsWith('/api/v2')) {
      targetPath = normalizedPath;
    } else if (normalizedPath.startsWith('/v2/')) {
      // V2 endpoints: /v2/interview/* → /api/v2/interview/*
      targetPath = `/api${normalizedPath}`;
    } else {
      // Default: /orchestrator/start → /api/v1/orchestrator/start
      targetPath = `/api/v1${normalizedPath}`;
    }
    
    const targetUrl = `${API_BASE_URL}${targetPath}${queryString}`;

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Proxy request:', {
        method,
        targetUrl,
        hasBody: !!body,
        contentType: headers['Content-Type'],
        isMultipart,
        hasToken: !!token,
      });
    }

    let response: Response;
    try {
      // Add timeout to fetch
      const controller = new AbortController();
      // LLM-backed endpoints (orchestrator, interview) need longer timeouts
      const isLongRunning = targetUrl.includes('/orchestrator/') || targetUrl.includes('/interview/');
      const timeoutMs = isLongRunning ? 120000 : 30000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Build fetch headers - don't set Content-Length manually, let fetch handle it
      const fetchHeaders: Record<string, string> = { ...headers };
      
      // Remove Content-Length if we set it manually - fetch will set it correctly
      delete fetchHeaders['Content-Length'];
      delete fetchHeaders['content-length'];

      response = await fetch(targetUrl, {
        method,
        headers: fetchHeaders,
        body: body || undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error('Fetch error:', {
        error: fetchError,
        url: targetUrl,
        method,
        apiBaseUrl: API_BASE_URL,
      });

      // Check if it's a network/connection error
      const isNetworkError =
        fetchError instanceof TypeError &&
        (fetchError.message.includes('fetch failed') ||
          fetchError.message.includes('ECONNREFUSED') ||
          fetchError.message.includes('ETIMEDOUT'));

      const errorMessage = isNetworkError
        ? `Cannot connect to API server at ${API_BASE_URL}. Please check if the backend is running and accessible.`
        : fetchError instanceof Error
          ? fetchError.message
          : 'Failed to connect to API server';

      return NextResponse.json(
        {
          error: errorMessage,
          ...(process.env.NODE_ENV === 'development' && {
            details: {
              url: targetUrl,
              apiBaseUrl: API_BASE_URL,
              error: String(fetchError),
              message:
                fetchError instanceof Error
                  ? fetchError.message
                  : 'Unknown error',
            },
          }),
        },
        { status: 503 } // 503 Service Unavailable for connection issues
      );
    }

    const responseContentType = response.headers.get('content-type');
    let data: unknown;

    if (responseContentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle error responses - could be JSON or plain text
      let errorMessage = 'Request failed';

      if (typeof data === 'string') {
        // Plain text error (e.g., "Internal Server Error")
        errorMessage = data;
      } else if (data && typeof data === 'object') {
        // JSON error response - handle various error formats
        const errorData = data as {
          detail?: string | unknown[];
          message?: string;
          error?: string | { code?: string; message?: string };
        };

        // Handle Pydantic validation errors (detail is an array)
        if (Array.isArray(errorData.detail)) {
          const firstError = errorData.detail[0];
          if (
            firstError &&
            typeof firstError === 'object' &&
            'msg' in firstError
          ) {
            errorMessage =
              (firstError as { msg: string }).msg || 'Validation error';
          } else {
            errorMessage = 'Validation error';
          }
        } else {
          // Handle nested error object (e.g., { error: { code: "HTTP_500", message: "..." } })
          if (
            errorData.error &&
            typeof errorData.error === 'object' &&
            'message' in errorData.error
          ) {
            errorMessage =
              (errorData.error as { message: string }).message ||
              'Request failed';
          } else {
            // Handle flat error format
            errorMessage =
              (typeof errorData.detail === 'string'
                ? errorData.detail
                : undefined) ||
              (typeof errorData.error === 'string'
                ? errorData.error
                : undefined) ||
              errorData.message ||
              'Request failed';
          }
        }
      }

      console.error(`API error [${response.status}]:`, {
        path,
        url: targetUrl,
        method,
        error: errorMessage,
        responseData: data,
        contentType,
      });

      return NextResponse.json(
        {
          error: errorMessage,
          ...(process.env.NODE_ENV === 'development'
            ? {
                details: data,
                status: response.status,
                url: targetUrl,
              }
            : {}),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Return more detailed error in development
    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.message
          : 'Internal server error'
        : 'Internal server error';

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && error instanceof Error
          ? { details: error.stack }
          : {}),
      },
      { status: 500 }
    );
  }
}
