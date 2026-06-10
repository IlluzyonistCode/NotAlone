import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const syncUser = async (req, res) => {
    try {
        const { email, name, image, provider, providerAccountId } = req.body;

        if (!email)
            return res.status(400).json({ success: false, error: 'Email required' });

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name: name || undefined,
                image: image || undefined
            },
            create: {
                email,
                name: name || email.split('@')[0],
                image: image || null,
                username: name || email.split('@')[0]
            }
        });

        if (provider && providerAccountId) {
            await prisma.account.upsert({
                where: {
                    provider_providerAccountId: {
                        provider,
                        providerAccountId
                    }
                },
                update: {
                    userId: user.id
                },
                create: {
                    userId: user.id,
                    provider,
                    providerAccountId,
                    type: 'oauth'
                }
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                image: user.image
            }
        });
    } catch (error) {
        console.error('Sync user error:', error);

        res.status(500).json({ success: false, error: error.message });
    }
};

export const loginWithCredentials = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ error: 'Username and password required' });

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: username },
                    { username: username }
                ]
            }
        });

        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid)
            return res.status(401).json({ error: 'Invalid credentials' });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                image: user.image
            }
        });
    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({ error: error.message });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password)
            return res.status(400).json({ error: 'Username, email and password required' });
        
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                name: username
            }
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Register error:', error);

        res.status(500).json({ error: error.message });
    }
};

export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        res.json(user || null);
    } catch (error) {
        console.error('Get user error:', error);

        res.status(500).json({ error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        res.json(user || null);
    } catch (error) {
        console.error('Get user error:', error);
        
        res.status(500).json({ error: error.message });
    }
};
