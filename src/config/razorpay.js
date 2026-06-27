// config/razorpay.js
const IS_DEV = __DEV__; // or check your environment

export const RAZORPAY_KEY_ID = IS_DEV 
  ? "rzp_test_T31kNkUjJACvZ5"  // Test key
  : "rzp_live_xxxxxxxxxxxx"; // Live key