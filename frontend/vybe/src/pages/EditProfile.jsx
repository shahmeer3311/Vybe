import React from 'react'
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import {useCurrentUser} from "../hooks/useAuth.js"
import { data, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadToImageKit } from '../api/imagekitUpload';
import { updateUserProfile } from '../api/userApi.js';
import { FaSpinner } from "react-icons/fa";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const EditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fileInputRef = React.useRef(null);

  const { data: currentUser } = useCurrentUser();

  const handleFileChange=(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    setFormData((prev)=>({
      ...prev,
      avatar:URL.createObjectURL(file),
      file
    }))
  };
  const handleAvatarClick=()=>{
    fileInputRef.current.click();
  };
 const handleSubmit = async () => {
  try {
    let profileImgUrl = currentUser?.profileImg || "";

    if (formData.file) {
      const uploaded = await uploadToImageKit(formData.file, { showProgress: false });
      profileImgUrl = uploaded.url; 
    }

    // Prepare the payload
    const payload = {
      name: formData.name,
      userName: formData.userName,
      bio: formData.bio,
      profession: formData.profession,
      gender: formData.gender,
      profileImg: profileImgUrl,
    };

    await mutation.mutateAsync(payload);

    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Profile update failed:", error);
    alert("Failed to update profile.");
  }
};

  const [formData, setFormData] = React.useState({
    name: currentUser?.name || "",
    userName: currentUser?.userName || "",
    bio: currentUser?.bio || "",
    profession: currentUser?.profession || "",
    gender: currentUser?.gender || "",
    avatar: currentUser?.profileImg || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const mutation = useMutation({
  mutationFn: updateUserProfile,
  onSuccess: (data) => {
    queryClient.setQueryData(["currentUser"], data.data);
    alert("Profile updated successfully!");
    navigate(-2); 
  },
  onError: (error) => {
    console.error("Profile update failed:", error);
    alert("Failed to update profile.");
  },
});

  return (
     <div className="w-full min-h-screen bg-black flex flex-col items-center">
      {/* Header */}
      <div className="w-full text-white flex items-center justify-center py-3 relative border-b border-gray-700">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(-1)}
          className="w-7 h-7 text-white absolute left-4 cursor-pointer"
        />
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>
      
       <div className="flex justify-center mt-7 px-4 w-full">
        <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-gray-200">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-dashed border-blue-400 shadow-lg">
              <img
                src={formData.avatar}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={handleAvatarClick}
              className="text-blue-600 font-semibold hover:text-blue-800 transition"
            >
              Change Profile Photo
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-gray-700 font-semibold">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-gray-700 font-semibold">Username</label>
                <input
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-gray-700 font-semibold">Profession</label>
                <input
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-gray-700 font-semibold">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              disabled={mutation.isLoading}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl flex items-center gap-2 justify-center transition 
                ${
                mutation.isLoading ? "opacity-50 cursor-not-allowed" : ""
              }
              `}
            >
              {mutation.isLoading && <FaSpinner className="animate-spin" />}
              {mutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
