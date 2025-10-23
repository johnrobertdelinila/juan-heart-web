import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard
  // In the future, this can check authentication status
  // and redirect to /login if not authenticated
  redirect('/dashboard');
}
