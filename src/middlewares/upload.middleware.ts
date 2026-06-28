// import multer from "multer";

// const storage = multer.memoryStorage();

// export const upload = multer({
//     storage,

//     limits: {
//         fileSize: 5 * 1024 * 1024,
//     },

//     fileFilter: (req, file, cb) => {
//         const allowedMimeTypes = [
//             "application/pdf",

//             "application/msword",

//             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         ];

//         if (allowedMimeTypes.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error("Invalid file type"));
//         }
//     },
// });

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "mock-tests",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

export const upload = multer({
  storage,
});
