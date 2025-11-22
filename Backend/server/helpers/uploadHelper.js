const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createStorage(subfolderParam) {
  const uploadsRoot = path.join(__dirname, '..', 'uploads');

  return multer.diskStorage({
    destination: function (req, file, cb) {
      try {
        const subfolder = typeof subfolderParam === 'function' ? subfolderParam(req) : (subfolderParam || '');
        const dest = path.join(uploadsRoot, subfolder);
        ensureDir(dest);
        cb(null, dest);
      } catch (err) {
        cb(err);
      }
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    }
  });
}

function defaultFileFilter(allowedMimes) {
  return function (req, file, cb) {
    if (!allowedMimes || allowedMimes.length === 0) return cb(null, true);
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  };
}

function uploadSingle(subfolder, fieldName, options = {}) {
  const storage = createStorage(subfolder);
  const fileFilter = defaultFileFilter(options.allowedMimes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  const limits = { fileSize: options.maxSize || 5 * 1024 * 1024 };
  const upload = multer({ storage, fileFilter, limits });
  return upload.single(fieldName);
}

function uploadFields(subfolder, fields, options = {}) {
  const storage = createStorage(subfolder);
  const fileFilter = defaultFileFilter(options.allowedMimes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  const limits = { fileSize: options.maxSize || 5 * 1024 * 1024 };
  const upload = multer({ storage, fileFilter, limits });
  return upload.fields(fields);
}

function uploadArray(subfolder, fieldName, maxCount, options = {}) {
  const storage = createStorage(subfolder);
  const fileFilter = defaultFileFilter(options.allowedMimes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  const limits = { fileSize: options.maxSize || 5 * 1024 * 1024 };
  const upload = multer({ storage, fileFilter, limits });
  return upload.array(fieldName, maxCount || 10);
}

module.exports = {
  ensureDir,
  uploadSingle,
  uploadFields,
  uploadArray
};
