import ImageKit from "imagekit";
import dotenv from "dotenv";

// Ensure environment variables from .env are loaded before initializing ImageKit
dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Helper to generate authentication parameters for client-side uploads
export const getImageKitAuthParams = () => {
  const auth = imagekit.getAuthenticationParameters();

  return {
    token: auth.token,
    expire: auth.expire,
    signature: auth.signature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  };
};

export default imagekit;