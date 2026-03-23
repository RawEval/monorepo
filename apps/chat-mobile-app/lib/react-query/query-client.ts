import { QueryClient } from '@tanstack/react-query';

let queryClient: QueryClient | undefined;

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds — matches web
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = makeQueryClient();
  }
  return queryClient;
}
