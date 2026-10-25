import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUserByEmail, getUserById, verifyUserPassword } from '@/lib/db';
import { loginSchema } from '@/lib/validation';

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        const user = await getUserById(token.id as string);
        if (!user) {
          return {
            ...session,
            user: undefined as unknown as typeof session.user,
            expires: new Date(0).toISOString(),
          };
        }
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});

