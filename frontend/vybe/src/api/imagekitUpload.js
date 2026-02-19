import { api } from "./axiosInstance";

/**
 * Upload file(s) to ImageKit.
 * 
 * @param {File | File[]} files - Single file or array of files
 * @param {Object} options
 * @param {boolean} options.showProgress - Whether to track progress (default: true)
 * @returns {Promise<Object[]>} - Returns an array of ImageKit responses
 */
export const uploadToImageKit = async (files, options = { showProgress: true }) => {
  const { showProgress } = options;

  if (!files || (Array.isArray(files) && files.length === 0)) {
    throw new Error("No file(s) provided for upload");
  }

  // Convert single file to array for uniform handling
  const filesArray = Array.isArray(files) ? files : [files];

  // Get auth params from backend
  const { data } = await api.get("/imagekit/auth");
  const { token, expire, signature, publicKey } = data;

  const uploadUrl = "https://upload.imagekit.io/api/v1/files/upload";

  const uploadFile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name || `upload_${Date.now()}`);
    formData.append("publicKey", publicKey);
    formData.append("token", token);
    formData.append("signature", signature);
    formData.append("expire", expire);

    if (showProgress) {
      // Use XMLHttpRequest to track progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable || !options.onProgress) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          options.onProgress(percent, file); // callback receives percent and file
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState !== XMLHttpRequest.DONE) return;

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error("ImageKit upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });
    } else {
      // Simple fetch when progress not needed
      return fetch(uploadUrl, { method: "POST", body: formData })
        .then((res) => {
          if (!res.ok) throw new Error("ImageKit upload failed");
          return res.json();
        });
    }
  };

  // Upload all files (single file will just be one element)
  const results = [];
  for (const file of filesArray) {
    const res = await uploadFile(file);
    results.push(res);
  }

  // Return array of responses if multiple files, or single object if only one
  return Array.isArray(files) ? results : results[0];
};