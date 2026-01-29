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
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Get body for POST/PUT/PATCH
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const requestBody = await request.json();
        body = JSON.stringify(requestBody);
      } catch (error) {
        // If not JSON, try to get as text
        try {
          body = await request.text();
        } catch (textError) {
          // If both fail, log and continue without body
          console.error('Failed to read request body:', { error, textError });
          body = undefined;
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

    // LLM calls API uses /llm-calls prefix (not /api/v1/llm-calls)
    // The backend middleware strips /llm-calls prefix internally
    let targetPath: string;
    if (normalizedPath.startsWith('/llm-calls/') || normalizedPath === '/llm-calls') {
      // Keep /llm-calls prefix as-is (backend will strip it)
      targetPath = normalizedPath;
    } else if (normalizedPath.startsWith('/api/v1')) {
      // Already has /api/v1 prefix
      targetPath = normalizedPath;
    } else {
      // Add /api/v1 prefix for regular API calls
      targetPath = `/api/v1${normalizedPath}`;
    }
    
    const targetUrl = `${API_BASE_URL}${targetPath}${queryString}`;

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Proxy request:', {
        method,
        path,
        normalizedPath,
        targetPath,
        targetUrl,
        hasBody: !!body,
        bodyLength: body?.length,
        bodyContent: body, // Log full body for debugging
        contentType: headers['Content-Type'],
        allHeaders: Object.keys(headers),
        hasToken: !!token,
      });
    }

    let response: Response;
    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      response = await fetch(targetUrl, {
        method,
        headers: {
          ...headers,
          // Only set Content-Length if we have a body
          ...(body && {
            'Content-Length': String(Buffer.byteLength(body, 'utf8')),
          }),
        },
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

    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType?.includes('application/json')) {
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
