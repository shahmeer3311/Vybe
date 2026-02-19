import multer from 'multer';
import fs from "fs"
import path from "path";

const uploadDir=path.join(process.cwd(),"public");
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true});
    console.log("📂 Created upload directory:", uploadDir);
}

const storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,uploadDir),
    filename:(req,file,cb)=>{
        const uniquename=`${Date.now()}-${file.originalname}`;
        cb(null,uniquename);
    }
});

const fileFilter=(req,file,cb)=>{
    const allowedTypes=["image/","video/"];
    if(allowedTypes.some((type)=>file.mimetype.startsWith(type))){
        cb(null,true);
    }else{
        cb(new Error("❌ Only image and video files are allowed"),false);
    }
};

const limit={
    fileSize:50*1024*1024,
}

const upload=multer({storage,fileFilter,limits:limit});

export const uploadSingle=upload.single("media");
export const uploadMultiple=upload.array("media",10);

export default upload;