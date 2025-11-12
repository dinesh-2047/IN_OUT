import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ROLE_VALUES = [
	"student",
	"teacher",
	"class_incharge",
		"classincharge",
	"warden",
	"security",
	"hod",
	"dean",
	"vc",
];

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			minlength: 3,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
		},
		role: {
			type: String,
			required: true,
			enum: ROLE_VALUES,
			lowercase: true,
			trim: true,
		},
		studentId: {
			type: String,
			trim: true,
		},
		employeeId: {
			type: String,
			trim: true,
		},
		contactNumber: {
			type: String,
			trim: true,
		},
		avatar: {
			type: String,
			trim: true,
		},
		refreshToken: {
			type: String,
			select: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function hashPassword(next) {
	if (!this.isModified("password")) {
		return next();
	}

	const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
	this.password = await bcrypt.hash(this.password, saltRounds);
	next();
});

userSchema.methods.isPasswordCorrect = async function isPasswordCorrect(password) {
	return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
	return jwt.sign(
		{
			_id: this._id,
			role: this.role,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
		}
	);
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
		}
	);
};

userSchema.statics.roles = ROLE_VALUES;

const User = mongoose.model("User", userSchema);

export { User };
