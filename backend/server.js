const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Post = require('./models/Post');
const bodyParser = require('body-parser');
const authenticateToken = require('./middleware/authenticateToken');
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Pengguna berhasil terdaftar' });
    } catch (error) {
        res.status(400).json({ message: 'Email sudah terdaftar' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password, description } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Pengguna tidak ditemukan' });
        }

        const isPasswordValid = await bcrypt.compare(password,description, user.password, user.description);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Kata sandi tidak valid' });
        }

        const token = jwt.sign({ userId: user._id }, 'jwt_secret', { expiresIn: '8h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});


// Route POST /posts
app.post('/posts', authenticateToken, async (req, res) => {
    const { description } = req.body;
    console.log('User ID:', req.userId);  
    console.log('Description:', description);
    if (!description) {
        return res.status(400).json({ message: 'Deskripsi tidak boleh kosong.' });
    }

    try {
        const newPost = new Post({
            description,
            userId: req.userId // Gunakan userId dari middleware autentikasi
        });
        await newPost.save();
        res.status(201).json({ message: 'Post berhasil dibuat.', post: newPost });
        console.log(`User ${req.userId} membuat post baru.`); // Log untuk debugging
    } catch (error) {
        console.error(error); // Cetak error jika ada masalah
        res.status(500).json({ message: 'Gagal membuat post.' });
    }
});


app.get('/user/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    try {
        const decoded = jwt.verify(token, 'jwt_secret');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        res.json({ email: user.email, id: user._id });
    } catch (error) {
        res.status(403).json({ message: 'Token tidak valid' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);
});
