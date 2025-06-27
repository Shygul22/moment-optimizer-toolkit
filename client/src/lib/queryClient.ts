import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if ((error as any)?.status === 401) return false;
        return failureCount < 2;
      },
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        return apiRequest(url);
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if ((error as any)?.status === 401) return false;
        return failureCount < 1;
      },
    },
  },
});

export { queryClient };

// Default fetch function for API requests
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session-based auth
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      // Add status to error for better error handling
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Log the error for debugging
    console.error('API Request failed:', url, error);
    throw error;
  }
};