'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from './query-client';
import { DemoInterceptor } from '@/lib/demo/demo-interceptor';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {IS_DEMO ? (
        <DemoInterceptor>{children}</DemoInterceptor>
      ) : (
        children
      )}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
