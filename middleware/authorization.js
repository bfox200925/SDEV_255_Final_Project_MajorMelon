function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function ensureTeacher(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'teacher') {
        return next();
    }
    res.redirect('/login');
}

function ensureStudent(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'student') {
        return next();
    }
    res.redirect('/login');
}

module.exports = { ensureAuthenticated, ensureTeacher, ensureStudent };
