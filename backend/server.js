const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Post = require('./models/Post'); // Model Post
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Untuk JSON payload
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Untuk URL encoded payload

// Koneksi ke MongoDB
mongoose.connect('mongodb+srv://suryadisimanungkalitt:AmkXD0bDaTnCZKGA@cluster0.fl4vi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Konfigurasi multer untuk menangani file upload
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // Maksimal 10MB
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = './uploads';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })
});

// Rute untuk mengunggah post
app.post('/posts', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Menggunakan sharp untuk mengubah ukuran gambar
        const imageBuffer = await sharp(req.file.path)
            .resize(200, 200) // Ubah ukuran ke 200x200
            .toBuffer();

        // Simpan gambar yang diubah ukurannya ke sistem file
        const imagePath = path.join('uploads', req.file.filename);
        await fs.promises.writeFile(imagePath, imageBuffer);

        // Simpan post ke database
        const newPost = new Post({
            image: imagePath,
            description: req.body.description,
        });
        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the image.');
    }
});

// Rute untuk pendaftaran pengguna
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Email already exists' });
    }
});

// Rute untuk login pengguna
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, 'jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Rute untuk mendapatkan profil pengguna
app.get('/user/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'jwt_secret');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ email: user.email, id: user._id });
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
