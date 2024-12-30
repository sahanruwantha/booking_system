const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

class AuthController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
    }

    async register(req, res) {
        try {
            const { email, password, firstName, lastName, phoneNumber, userType = 'COMMUTER' } = req.body;

            // First check if user exists
            const existingUser = await db.get('SELECT email FROM users WHERE email = ?', [email]);
            if (existingUser) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();

            await db.run(
                'INSERT INTO users (user_id, email, password, first_name, last_name, phone_number, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, email, hashedPassword, firstName, lastName, phoneNumber, userType]
            );

            const accessToken = this.generateAccessToken(userId, userType);
            const refreshToken = this.generateRefreshToken(userId);

            console.log(accessToken, refreshToken)

            await db.run(
                'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
                [userId, refreshToken]
            );

            res.status(201).json({
                userId,
                accessToken,
                refreshToken,
                userType
            });
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            console.log('Attempting login for email:', email);
            
            const user = await db.get(
                'SELECT user_id, email, password, user_type FROM users WHERE email = ?', 
                [email]
            );
            
            console.log('User found:', user);
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            if (!user.password) {
                console.error('No password hash found for user');
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            console.log('Password valid:', validPassword);
            
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const accessToken = this.generateAccessToken(user.user_id, user.user_type);
            const refreshToken = this.generateRefreshToken(user.user_id);
            console.log(accessToken, refreshToken)

            await db.run(
                'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
                [user.user_id, refreshToken]
            );

            res.json({
                userId: user.user_id,
                accessToken,
                refreshToken,
                userType: user.user_type
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token required' });
            }

            const tokenData = await db.get(
                'SELECT user_id FROM refresh_tokens WHERE token = ?',
                [refreshToken]
            );

            if (!tokenData) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }

            const user = await db.get(
                'SELECT user_id, user_type FROM users WHERE user_id = ?',
                [tokenData.user_id]
            );

            const accessToken = this.generateAccessToken(user.user_id, user.user_type);
            res.json({ accessToken });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    generateAccessToken(userId, userType) {
        return jwt.sign(
            { userId, userType },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    generateRefreshToken(userId) {
        return jwt.sign(
            { userId },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );
    }

    async verifyToken(req, res) {
        try {
            const { token } = req.body;
            
            if (!token) {
                return res.status(401).json({ error: 'Token required' });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Get user details from database
            const user = await db.get(
                'SELECT user_id, user_type FROM users WHERE user_id = ?',
                [decoded.userId]
            );

            if (!user) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            res.json({ 
                user: {
                    userId: user.user_id,
                    userType: user.user_type
                }
            });
        } catch (error) {
            res.status(403).json({ error: 'Invalid token' });
        }
    }
}

module.exports = new AuthController(); 