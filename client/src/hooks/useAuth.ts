import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: () => apiRequest("/api/auth/user"),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}