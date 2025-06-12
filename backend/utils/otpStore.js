// Define the OTP store with a specific type
export const otpStore = {};

// Possible states for OTP verification
export const OTP_STATUS = {
  PENDING: "PENDING",   // OTP has been sent but not verified yet
  VERIFIED: "VERIFIED", // OTP has been verified successfully
  EXPIRED: "EXPIRED",   // OTP has expired
};
