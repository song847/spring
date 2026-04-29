const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fileUpload = require('express-fileupload');
const { initDb } = require('./db');
const { register, login } = require('./auth');
const { getPlans, addPlan, deletePlan } = require('./plans');
const { searchUser, sendFriendRequest, acceptFriendRequest, getFriends } = require('./social');
const { createPost, getPosts, deletePost } = require('./posts');
const { sendMessage, getMessages } = require('./messages');
const { getAllUsers, deleteUser, updateUser, createAdmin } = require('./admin');
const { getWeather } = require('./weather');
const { createNestItem, getNestItems, deleteNestItem } = require('./nest');
const { webSearch } = require('./search');
const { searchMusic, getRecommendations, uploadMusic, deleteMusic, getUploadedSongs } = require('./music');
const { uploadClothes, getWardrobeItems, deleteWardrobeItem, recommendMatches, smartRecommend, updateWardrobeItem, getCategories } = require('./wardrobe');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }));

const UPLOAD_DIR = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/api/register', register);
app.post('/api/login', login);

app.get('/api/plans', getPlans);
app.post('/api/plans', addPlan);
app.delete('/api/plans/:id', deletePlan);

app.get('/api/users/search', searchUser);
app.post('/api/friends/request', sendFriendRequest);
app.post('/api/friends/accept', acceptFriendRequest);
app.get('/api/friends', getFriends);

app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`,
    type: mediaType,
    filename: req.file.filename
  });
});

app.post('/api/posts', createPost);
app.get('/api/posts', getPosts);
app.delete('/api/posts/:id', deletePost);

app.post('/api/messages', sendMessage);
app.get('/api/messages', getMessages);

app.get('/api/admin/users', getAllUsers);
app.delete('/api/admin/users', deleteUser);
app.put('/api/admin/users', updateUser);
app.post('/api/admin/create', createAdmin);

app.get('/api/weather', getWeather);

app.post('/api/nest', createNestItem);
app.get('/api/nest', getNestItems);
app.delete('/api/nest/:id', deleteNestItem);

app.get('/api/search', webSearch);

app.get('/api/music/search', searchMusic);
app.get('/api/music/recommend', getRecommendations);
app.get('/api/music/uploaded', getUploadedSongs);
app.post('/api/music/upload', uploadMusic);
app.delete('/api/music/:id', deleteMusic);

app.get('/api/wardrobe', getWardrobeItems);
app.post('/api/wardrobe', uploadClothes);
app.delete('/api/wardrobe/:id', deleteWardrobeItem);
app.get('/api/wardrobe/match', recommendMatches);
app.get('/api/wardrobe/smart', smartRecommend);
app.put('/api/wardrobe/:id', updateWardrobeItem);
app.get('/api/wardrobe/categories', getCategories);

app.use('/uploads', express.static(UPLOAD_DIR));

let serverInstance;

function startServer(port = 3000, callback) {
  serverInstance = app.listen(port, () => {
    if (callback) callback();
  });
}

function stopServer(callback) {
  if (serverInstance) {
    serverInstance.close(callback);
  } else if (callback) {
    callback();
  }
}

if (require.main === module) {
  initDb('./database.sqlite', () => {
    startServer(3000, () => {
      console.log('Server running on port 3000');
    });
  });
}

module.exports = { app, startServer, stopServer };
