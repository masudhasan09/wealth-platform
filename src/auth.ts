import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUserByEmail, verifyUserPassword } from '@/lib/db';
import { loginSchema } from '@/lib/validation';
import { authConfig } from '@/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const user = await getUserByEmail(validated.data.email);
        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyUserPassword(
          validated.data.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});
