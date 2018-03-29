'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    bday: { type: Date, required: true },
    email: { type: String, required: true },
    level: { type: Number, default: 1 },
    initialFund: { type: Number, default: 5000 },
    currentFund: { type: Number, default: 5000 },
    risk: [{
        x: Number,
        y: Number
    }],
});


UserSchema.virtual('riskArr').get(function() {
    return `${this.risk.x} ${this.risk.y}`.trim();
});

// I'M SO LOST
UserSchema.methods.serialize = function() {
    return {
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || '',
        id: this._id,
        bday: this.bday,
        email: this.email,
        level: this.level,
        initialFund: this.initialFund,
        currentFund: this.currentFund,
        risk: this.riskArr,
    };
};

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };