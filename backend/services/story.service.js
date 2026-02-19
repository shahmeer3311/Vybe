import User from "../models/user.model";
import uploadOnImageKit from "../utils/imageKit";

export const uploadStoryService=async({userId, files, title, description})=>{
    const user=await User.findById(userId);
    console.log("Story", userId, files);

    if(!user) throw new ApiError(404,"User not found");
    if(!files.length){
        throw new ApiError(400,"At least one media file is required");
    }

    const uploadedMedia=[];
    for(const file of files){
        try {
            const mediaUrl=await uploadOnImageKit(file.path);
            uploadedMedia.push({
                url: mediaUrl,
                fileType: file.mimeType.startsWith("image") ? "image" : "video"
            });
            
        } catch (error) {
            throw new ApiError(500, "Failed to upload media");
        }
    }
    const stories=await Promise.all(
        uploadedMedia.map((media)=>{
            return Story.create({
                author: userId,
                title,
                description,
                mediaType: media.fileType,
                mediaUrl: media.url
            })
        })
    );

    user.stories.push(...stories.map((s)=>s._id));
    await user.save();

    return stories;
}