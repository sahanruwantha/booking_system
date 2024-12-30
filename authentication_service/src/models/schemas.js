const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    userType: { 
        type: String, 
        enum: ['COMMUTER', 'ADMIN', 'OPERATOR'], 
        default: 'COMMUTER' 
    }
}, { timestamps: true });

const refreshTokenSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = {
    User: mongoose.model('User', userSchema),
    RefreshToken: mongoose.model('RefreshToken', refreshTokenSchema)
}; 