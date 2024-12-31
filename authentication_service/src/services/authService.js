const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User, RefreshToken } = require('../models/schemas');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

class AuthService {
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

    async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userId = uuidv4();

        const user = await User.create({
            userId,
            ...userData,
            password: hashedPassword
        });

        const accessToken = this.generateAccessToken(userId, userData.userType);
        const refreshToken = this.generateRefreshToken(userId);

        await RefreshToken.create({
            userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return { userId, accessToken, refreshToken, userType: userData.userType };
    }

    async validateUser(email, password) {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return null;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        return validPassword ? user : null;
    }

    async createNewRefreshToken(userId) {
        const refreshToken = this.generateRefreshToken(userId);
        await RefreshToken.create({
            userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        return refreshToken;
    }
}

module.exports = new AuthService(); 