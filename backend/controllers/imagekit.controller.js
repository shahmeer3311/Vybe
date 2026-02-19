import { asyncHandler } from "../utils/asyncHandler.js";
import { getImageKitAuthParams } from "../utils/imageKit.js";

// Returns { token, expire, signature, publicKey, urlEndpoint } for client-side uploads
export const getImageKitAuth = asyncHandler(async (req, res) => {
  const auth = getImageKitAuthParams();
  return res.status(200).json(auth);
});


// Generates a temporary, cryptographically signed permission so the browser can upload files directly to ImageKit without exposing your private API key.

// It is the security bridge between your backend and ImageKit. The frontend calls this endpoint to get the necessary parameters (token, signature, expire) to securely upload files directly to ImageKit's upload API. This way, the frontend can upload files without ever having access to your private API key, while still ensuring that only authorized uploads are allowed.