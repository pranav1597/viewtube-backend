import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({storage});

export const uploadFields = upload.fields([
  {name: "videoFile", maxCount: 1},
  {name: "thumbnail", maxCount: 1},
]);