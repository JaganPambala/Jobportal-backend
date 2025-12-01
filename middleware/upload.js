import multer from 'multer';
import path from 'path';
import fs from 'fs';

const makeUploadDir = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Avatar storage
const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
makeUploadDir(avatarDir);
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

// Resume storage
const resumeDir = path.join(process.cwd(), 'uploads', 'resumes');
makeUploadDir(resumeDir);
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.test(ext)) {
    return cb(new Error('Only image files are allowed for avatars'), false);
  }
  cb(null, true);
};

const resumeFileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.test(ext)) {
    return cb(new Error('Only PDF/DOC/DOCX files are allowed for resume'), false);
  }
  cb(null, true);
};

export const avatarUpload = multer({ storage: avatarStorage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const resumeUpload = multer({ storage: resumeStorage, fileFilter: resumeFileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
