import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => {
        const uniquename = Date.now() + "-" + file.originalname;
        cb(null, uniquename)
    }
})

const fileCheck = (req, file, cb) => {
    if(file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error("Only PDF files are allowed"), false)
}

export const upload = multer({ storage, fileFilter: fileCheck})