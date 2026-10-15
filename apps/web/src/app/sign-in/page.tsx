import { AuthForm } from '@/features/auth/auth-form';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return (
    <AuthForm
      mode="sign-in"
      token={typeof query.token === 'string' ? query.token : ''}
    />
  );
}
