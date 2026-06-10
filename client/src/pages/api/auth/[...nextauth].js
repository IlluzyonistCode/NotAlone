import axios from 'axios';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            checks: ['none'],
            httpOptions: {
                timeout: 100000
            }
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                try {
                    const res = await axios.post('http://localhost:4000/api/auth/login', {
                        username: credentials.username,
                        password: credentials.password
                    });

                    if (res.data.user)
                        return {
                            id: res.data.user.id,
                            email: res.data.user.email,
                            name: res.data.user.username,
                            image: res.data.user.image
                        };

                    return;
                } catch (error) {
                    console.error('Credentials auth error:', error);

                    return;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user'
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                const res = await axios.post('http://localhost:4000/api/auth/sync', {
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId
                });

                if (res.data.success) {
                    user.id = res.data.user.id;
                    user.username = res.data.user.username;

                    return true;
                }

                return false;
            } catch (error) {
                console.error('SignIn callback error:', error);

                return false;
            }
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.image = token.picture;
            }

            return session;
        },
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }

            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }

            return token;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith('/')) return `${baseUrl}${url}`;

            if (new URL(url).origin === baseUrl) return url;

            return baseUrl;
        }
    },
    events: {
        async signIn({ user, account, profile }) {
            console.log(`User signed in: ${user.email} via ${account.provider}`);
        },
        async signOut({ session, token }) {
            console.log(`User signed out: ${token?.email}`);
        },
        async createUser({ user }) {
            console.log(`User created: ${user.email}`);
        },
        async linkAccount({ user, account, profile }) {
            console.log(`Account linked: ${user.email} - ${account.provider}`);
        },
        async session({ session, token }) {
            console.log(`Session updated for: ${token?.email}`);
        }
    },
    debug: process.env.NODE_ENV === 'development',
    logger: {
        error(code, metadata) {
            console.error(`NextAuth error [${code}]:`, metadata);
        },
        warn(code) {
            console.warn(`NextAuth warning: ${code}`);
        },
        debug(code, metadata) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`NextAuth debug [${code}]:`, metadata);
            }
        }
    },
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
        callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
        csrfToken: {
            name: `__Host-next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    }
});
