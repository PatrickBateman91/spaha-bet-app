const multer = require('multer');
const DIR = './public';
const path = require('path');
const createCustomError = require('../helperFunctions/createCustomError');

const maxSize = 3097152;
const profilePictureStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${DIR}/profile-pictures/`);
    },
    filename: function (req, file, cb) {
        cb(null, `${req.body.nickname}-profile-picture${path.extname(file.originalname).toLowerCase()}`)
    }
})
const upload = multer({
    storage: profilePictureStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error(createCustomError(400, 'Only .png, .jpg and .jpeg image formats are allowed!', [])))
        }
    },
    limits: { fileSize: maxSize }
});

module.exports = upload;