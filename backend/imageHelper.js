const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const getImagePath = () => {
  const configuredPath = process.env.IMAGE_SAVE_PATH;
  if (configuredPath) {
    return path.resolve(__dirname, configuredPath);
  }
  return path.join(__dirname, 'data', 'images', 'runcertify');
};

const initImageDir = () => {
  const dir = getImagePath();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const saveBase64Image = (base64Str) => {
  if (!base64Str || !base64Str.startsWith('data:image/')) return base64Str;

  initImageDir();
  
  const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64Str;
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const base64Data = matches[2];
  
  // UUID + original name logic
  // Since we only get base64 from frontend, we don't have the original filename.
  // We will just use uuid.
  const fileName = `${uuidv4()}.${ext}`;
  const filePath = path.join(getImagePath(), fileName);
  
  fs.writeFileSync(filePath, base64Data, 'base64');
  
  return `/api/images/${fileName}`;
};

const processObjectImages = (obj) => {
  const fields = ['logoUrl', 'themeImageUrl', 'runnerImageUrl', 'signatureUrl', 'badgeImageUrl'];
  for (const field of fields) {
    if (obj[field] && obj[field].startsWith('data:image/')) {
      obj[field] = saveBase64Image(obj[field]);
    }
  }
  return obj;
};

module.exports = {
  saveBase64Image,
  processObjectImages,
  getImagePath
};
