import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    cb(null, "uploads/");
  },

  filename: (
    req,
    file,
    cb
  ) => {
    const uniqueName =
      Date.now() +
      "-" +
      crypto.randomBytes(8).toString("hex") +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const allowedExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    !allowedExtensions.includes(extension)
  ) {
    return cb(
      new Error(
        "Unsupported file extension"
      )
    );
  }

  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return cb(
      new Error(
        "Unsupported file type"
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,

  limits: {
    fileSize:
      5 * 1024 * 1024, // 5MB
  },

  fileFilter,
});

export default upload;