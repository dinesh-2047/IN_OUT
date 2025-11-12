import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

const ACCESS_COOKIE_DEFAULT = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_DEFAULT = 7 * 24 * 60 * 60 * 1000; // 7 days

const parseDurationToMs = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = /^([0-9]+)([smhd])$/i.exec(value.trim());

  if (!match) {
    return fallback;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return fallback;
  }
};

const buildCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge,
  path: "/",
});

const generateAuthTokens = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found for token generation");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const accessMaxAge = parseDurationToMs(
    process.env.ACCESS_TOKEN_COOKIE_MAX_AGE,
    ACCESS_COOKIE_DEFAULT
  );
  const refreshMaxAge = parseDurationToMs(
    process.env.REFRESH_TOKEN_COOKIE_MAX_AGE,
    REFRESH_COOKIE_DEFAULT
  );

  res.cookie("accessToken", accessToken, buildCookieOptions(accessMaxAge));
  res.cookie("refreshToken", refreshToken, buildCookieOptions(refreshMaxAge));
};

const clearAuthCookies = (res) => {
  const options = buildCookieOptions(0);
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

export { generateAuthTokens, setAuthCookies, clearAuthCookies };
