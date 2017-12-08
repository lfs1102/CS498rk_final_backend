var wrapper = require('../utils/message_wrapper');
var User = require('../models/user');

module.exports = function(router, passport) {

    router.post('/register',
        passport.authenticate('local-signup'),
        function(req, res) {
            res.send(wrapper('OK', {
                username: req.body.username,
                email: req.body.email
            }));
        }
    );

    router.post('/login',
        passport.authenticate('local-login'),
        function(req, res) {
            if (req.isAuthenticated()) {
                return res.status(200).send(wrapper('OK', {
                    username: req.user.username,
                    email: req.user.email
                }));
            }
    });

    router.get('/profile',
        isLoggedIn,
        function(req, res) {
            res.send({ user: req.user, message: "Welcome!"
        });
    });

    router.get('/logout', function(req, res) {
        req.logOut();
        res.send({ message: "logged out!"});
    });

    return router;
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
}
