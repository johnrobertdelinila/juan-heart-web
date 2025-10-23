import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get<User>('/user'),
    enabled: false, // Only fetch when user is authenticated
  });
}
