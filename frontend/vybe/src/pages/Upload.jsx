import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MdOutlineKeyboardBackspace, MdClose } from "react-icons/md";
import { Form, useNavigate } from "react-router-dom";
import { createPostApi } from "../api/postApi";
import { uploadToImageKit } from "../api/imagekitUpload";
import { createStoryApi } from "../api/storyApi";
import { createLoopApi } from "../api/loopApi";

const Upload = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("post");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [showPreviewDiv, setShowPreviewDiv] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    let validFiles = files;

    if (selected === "loop") {
      validFiles = files.filter((f) => f.type.startsWith("video/"));
      if (!validFiles.length) return alert("Loop must be a video.");
      validFiles = [validFiles[0]];
    } else if (selected === "story") {
      validFiles = files.filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
      );
    } else if (selected === "post") {
      validFiles = files.filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
      );
    }
    if (!validFiles.length) return alert("Invalid file type.");
    const newPreviewFiles = validFiles.map((f) => URL.createObjectURL(f));

    if (selected === "story" || selected === "post") {
      setPreviewFiles((prev) => [...prev, ...newPreviewFiles]);
      setMediaFiles((prev) => [...prev, ...validFiles]);
    } else {
      setPreviewFiles(newPreviewFiles);
      setMediaFiles(validFiles);
    }
    setShowPreviewDiv(true);
    e.target.value = null;
  };

  const removeFile = (idx) => {
    setMediaFiles((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length === 0) setShowPreviewDiv(false);
      return updated;
    });
    setPreviewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm=()=>{
    setMediaFiles([]);
    setPreviewFiles([]);
    setCaption("");
    setShowPreviewDiv(false);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const postMutation = useMutation({
    mutationFn: (payload) => createPostApi(payload),
    onSuccess: (data) => {
      console.log("Post created successfully:", data);
      resetForm();
      navigate("/");
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      setIsUploading(false);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const storyMutation = useMutation({
    mutationFn: (payload) => createStoryApi(payload),
    onSuccess: (data) => {
      console.log("Story created successfully:", data);
      resetForm();
      navigate("/");
    },
    onError: (error) => {
      console.error("Error creating story:", error);
      setIsUploading(false);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const loopMutation = useMutation({
    mutationFn: (payload) => createLoopApi({ caption: payload.caption, media: payload.media.map(m => m.url) }),
    onSuccess: (data) => {
      console.log("Loop created successfully:", data);
      resetForm();
      navigate("/");
    },
    onError: (error) => {
      console.error("Error creating loop:", error);
      setIsUploading(false);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

 const handleBackendUpload = async () => {
  if (!caption && mediaFiles.length === 0) {
    alert("Please add caption or media.");
    return;
  }

  try {
    setIsUploading(true);
    setUploadProgress(0);

    const totalFiles = mediaFiles.length || 1;
    const uploadedMedia = [];

    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];

      const result = await uploadToImageKit(file, {
        showProgress: true, // enable progress tracking
        onProgress: (percent) => {
          const overall = Math.round(((i + percent / 100) / totalFiles) * 100);
          setUploadProgress(overall);
        },
      });

      uploadedMedia.push({
        url: result.url,
        type: file.type.startsWith("video/") ? "video" : "image",
      });
    }

    const payload = {
      caption,
      media: uploadedMedia,
    };

   if(selected==="post") await postMutation.mutateAsync(payload);
   if(selected==="story") await storyMutation.mutateAsync(payload);
   if(selected==="loop") await loopMutation.mutateAsync(payload); 
  } catch (error) {
    console.error("Error during upload flow:", error);
    setIsUploading(false);
  }
};

  const inputRef = useRef(null);

  const handleUploadClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center relative">
      {/* Header */}
      <div className="w-full h-14 flex gap-5 items-center py-10 px-5 border-b-2 border-gray-600">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(-1)}
          className="w-7 h-7 cursor-pointer"
        />
        <div className="font-semibold text-xl py-4">Upload Media</div>
      </div>

      {!showPreviewDiv && (
        <div className="w-[80%] max-w-200 h-20 mt-10">
        <div className="w-full h-full rounded-full bg-white flex items-center px-5 shadow-lg">
          {["post", "story", "loop"].map((opt) => (
            <div
              key={opt}
              onClick={() => setSelected(opt)}
              className={`flex-1 h-12 mx-1 flex items-center justify-center rounded-full cursor-pointer transition-all ${
                selected === opt
                  ? "bg-black text-white scale-105"
                  : "text-black hover:bg-black hover:text-white"
              }`}
            >
              {opt.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
      )}

      <div className="w-[80%] max-w-200 mt-10 relative">
        <div
          className="w-full h-64 border-2 border-gray-500 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer"
          onClick={() => inputRef.current.click()}
        >
          <p>
            Click to Upload {selected === "post" ? "Image/Video" : selected}
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          ref={inputRef}
          accept={selected === "loop" ? "video/*" : "image/*,video/*"}
          multiple={selected === "story" || selected === "post"}
        />

        {showPreviewDiv && (
          <div className="absolute h-fit inset-0 bg-black p-3 border shadow-amber-50 rounded-2xl z-20 flex items-center overflow-y-auto px-10">
           <div className="absolute top-6 left-0">
             <MdOutlineKeyboardBackspace
              className="w-8 h-8 cursor-pointer mb-4 pl-2"
              onClick={resetForm}
            />
           </div>

          <div className="w-full">
             <div className="w-[75%] h-auto flex flex-col gap-3">
              <div className="flex gap-15 w-full">
                {previewFiles.map((url, idx) => (
                <div key={idx} className="relative w-full flex">
                  {mediaFiles[idx].type.startsWith("image/") ? (
                    <img
                      src={url}
                      className="w-full min-h-[150px] max-h-[250px] rounded-xl border border-gray-700"
                    />
                  ) : (
                    <video
                      src={url}
                      controls
                      className="w-full min-h-[300px] rounded-xl border border-gray-700"
                    />
                  )}
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-2 right-2 bg-red-600 p-1 rounded-full"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>
                </div>
              ))}
              </div>

              {/* Add More button for stories */}
              {(selected === "story" || selected === "post")  && (
                <button
                  onClick={handleUploadClick}
                  className="mt-3 w-full py-2 bg-blue-600 rounded-xl text-white font-semibold
                  cursor-pointer"
                >
                  + Add More
                </button>
              )}
            </div>

            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full mt-5 px-3 py-8 rounded-xl bg-gray-900 border border-gray-700 text-white resize-none"
            />

            {isUploading && (
              <div className="w-full mt-4">
                <p className="text-sm mt-4 mb-1">Upload: {uploadProgress}%</p>
                <div className="h-3 bg-gray-700 rounded">
                  <div
                    className="h-3 bg-green-600 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {!isUploading && (
              <button
                onClick={handleBackendUpload}
                className="cursor-pointer mt-5 bg-purple-600 px-6 py-2 rounded-xl text-white font-semibold"
              >
                Upload
              </button>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
