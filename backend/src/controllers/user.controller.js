import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	clearAuthCookies,
	generateAuthTokens,
	setAuthCookies,
} from "../utils/authTokens.js";

const sanitizeUser = (user) => {
	if (!user) {
		return null;
	}

	const { password, refreshToken, __v, ...rest } = user.toObject({ getters: true });
	return rest;
};

const ensureRoleSpecificFields = (role, { studentId, employeeId, course, roomNumber }) => {
	const courseRequiredRoles = ["student", "teacher", "class_incharge", "classincharge"];

	if (role === "student" && !studentId) {
		throw new ApiError(400, "Student ID is required for student accounts");
	}

	if (role === "student" && !roomNumber) {
		throw new ApiError(400, "Room number is required for student accounts");
	}

	if (courseRequiredRoles.includes(role) && !course) {
		throw new ApiError(400, "Course information is required for this role");
	}

	if (role !== "student" && role !== "security" && !employeeId) {
		throw new ApiError(400, "Employee ID is required for staff accounts");
	}
};

const registerUser = asyncHandler(async (req, res) => {
	const {
		fullName,
		username,
		email,
		password,
		confirmPassword,
		role,
		studentId,
		employeeId,
		contactNumber,
		avatar,
		course,
		roomNumber,
	} = req.body || {};

	if (!fullName || !username || !email || !password || !role) {
		throw new ApiError(400, "Full name, username, email, password, and role are required");
	}

	if (confirmPassword && confirmPassword !== password) {
		throw new ApiError(400, "Password confirmation does not match");
	}

	const normalizedRole = role.toLowerCase();

	if (!User.roles.includes(normalizedRole)) {
		throw new ApiError(400, "Invalid role provided");
	}

	const trimmedCourse = typeof course === "string" ? course.trim() : "";
	const normalizedCourse = trimmedCourse ? trimmedCourse.toUpperCase() : undefined;

	const trimmedRoom = typeof roomNumber === "string" ? roomNumber.trim() : "";
	const normalizedRoomNumber = trimmedRoom || undefined;

	ensureRoleSpecificFields(normalizedRole, {
		studentId,
		employeeId,
		course: normalizedCourse,
		roomNumber: normalizedRoomNumber,
	});

	const normalizedEmail = email.toLowerCase();
	const normalizedUsername = username.toLowerCase();

	const existingUser = await User.findOne({
		$or: [{ email: normalizedEmail }, { username: normalizedUsername }],
	});

	if (existingUser) {
		throw new ApiError(409, "User with the provided email or username already exists");
	}

	const user = await User.create({
		fullName,
		username: normalizedUsername,
		email: normalizedEmail,
		password,
		role: normalizedRole,
		studentId,
		employeeId,
		contactNumber,
		avatar,
		course: normalizedCourse,
		roomNumber: normalizedRoomNumber,
	});

	const createdUser = await User.findById(user._id).select("-password -refreshToken");

	return res
		.status(201)
		.json(new ApiResponse(201, createdUser, "Account created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body || {};

	if (!password || (!username && !email)) {
		throw new ApiError(400, "Username or email and password are required");
	}

	const identifier = username ? { username: username.toLowerCase() } : { email: email.toLowerCase() };

	const user = await User.findOne(identifier).select("+password +refreshToken");

	if (!user) {
		throw new ApiError(401, "Invalid credentials");
	}

	const isPasswordValid = await user.isPasswordCorrect(password);

	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid credentials");
	}

	const { accessToken, refreshToken } = await generateAuthTokens(user._id);
	setAuthCookies(res, accessToken, refreshToken);

	const safeUser = sanitizeUser(user);

	return res.status(200).json(
		new ApiResponse(200, { user: safeUser, accessToken, refreshToken }, "Logged in successfully")
	);
});

const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user?._id,
		{
			$unset: { refreshToken: 1 },
		},
		{ new: true, timestamps: false }
	);

	clearAuthCookies(res);

	return res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];

	if (!incomingRefreshToken) {
		throw new ApiError(401, "Refresh token is missing");
	}

	let decodedToken;

	try {
		decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
	} catch (error) {
		throw new ApiError(401, "Invalid refresh token");
	}

	const user = await User.findById(decodedToken?._id).select("+refreshToken");

	if (!user || !user.refreshToken) {
		throw new ApiError(401, "Refresh token is invalid or expired");
	}

	if (user.refreshToken !== incomingRefreshToken) {
		throw new ApiError(401, "Refresh token has been rotated. Please log in again");
	}

	const accessToken = user.generateAccessToken();
	const refreshToken = user.generateRefreshToken();

	user.refreshToken = refreshToken;
	await user.save({ validateBeforeSave: false });

	setAuthCookies(res, accessToken, refreshToken);

	const safeUser = sanitizeUser(user);

	return res
		.status(200)
		.json(new ApiResponse(200, { user: safeUser, accessToken, refreshToken }, "Tokens refreshed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
	const currentUser = await User.findById(req.user?._id).select("-password -refreshToken");

	return res.status(200).json(new ApiResponse(200, currentUser, "Current user fetched"));
});

const updateProfile = asyncHandler(async (req, res) => {
	const allowedFields = ["fullName", "contactNumber", "avatar", "studentId", "employeeId", "course", "roomNumber"]; // limit updates
	const updates = {};

	allowedFields.forEach((field) => {
		if (Object.prototype.hasOwnProperty.call(req.body || {}, field) && req.body[field] !== undefined) {
			updates[field] = req.body[field];
		}
	});

	if (!Object.keys(updates).length) {
		throw new ApiError(400, "No valid profile fields provided for update");
	}

	if (typeof updates.course === "string") {
		const trimmedCourse = updates.course.trim();
		if (!trimmedCourse) {
			delete updates.course;
		} else {
			updates.course = trimmedCourse.toUpperCase();
		}
	}

	if (typeof updates.roomNumber === "string") {
		const trimmedRoom = updates.roomNumber.trim();
		if (!trimmedRoom) {
			if (req.user?.role === "student") {
				throw new ApiError(400, "Room number cannot be empty for student accounts");
			}
			delete updates.roomNumber;
		} else {
			updates.roomNumber = trimmedRoom;
		}
	}

	const updatedUser = await User.findByIdAndUpdate(req.user?._id, updates, {
		new: true,
		runValidators: true,
	}).select("-password -refreshToken");

	return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body || {};

	if (!oldPassword || !newPassword) {
		throw new ApiError(400, "Old and new passwords are required");
	}

	if (oldPassword === newPassword) {
		throw new ApiError(400, "New password must be different from the old password");
	}

	const user = await User.findById(req.user?._id).select("+password");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const isCurrentPasswordValid = await user.isPasswordCorrect(oldPassword);

	if (!isCurrentPasswordValid) {
		throw new ApiError(400, "Old password is incorrect");
	}

	user.password = newPassword;
	await user.save();

	return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getUsers = asyncHandler(async (req, res) => {
	const { role, search, isActive } = req.query || {};

	const filters = {};

	if (role) {
		const normalizedRole = role.toLowerCase();

		if (!User.roles.includes(normalizedRole)) {
			throw new ApiError(400, "Invalid role filter");
		}

		filters.role = normalizedRole;
	}

	if (typeof isActive !== "undefined") {
		filters.isActive = isActive === "true";
	}

	if (search) {
		const regex = new RegExp(search, "i");
		filters.$or = [
			{ fullName: regex },
			{ username: regex },
			{ email: regex },
			{ studentId: regex },
			{ employeeId: regex },
		];
	}

	const users = await User.find(filters).select("-password -refreshToken").sort({ createdAt: -1 });

	return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	getCurrentUser,
	updateProfile,
	changePassword,
	getUsers,
};
