const express = require('express');
const router = express.Router();

// GET: Logout the user
router.get('/', (req, res) => {
    req.logout(() => {
        res.redirect('/');  // Redirect to home after logout
    });
});

module.exports = router;
