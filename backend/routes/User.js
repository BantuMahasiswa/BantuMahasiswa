router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user) 
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
