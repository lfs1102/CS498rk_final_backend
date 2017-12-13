var wrapper = require('../utils/message_wrapper.js')

module.exports = function (router) {
    var Post = require('../models/post');

    router.get('/post/id/:id', isLoggedIn, (req, res) => {
        Post.findById(req.params.id).exec((err, docs) => {
            if (err) {
                return res.status(500).send(wrapper('Failed to get the post.'));                
            }
            if (!docs) {
                return res.status(404).send(wrapper('Post not found.'));                
            } else {
                return res.send(wrapper('OK', reformat(docs)))
            }
        })
    })
    
    router.delete('/post/id/:id', isLoggedIn, (req, res) => {
        Post.findByIdAndRemove(req.params.id).exec((err, docs) => {
            if (err || !docs) {
                return res.status(404).send(wrapper('Post not found with ID ' + req.params.id))
            } else {
                return res.send(wrapper('OK', docs))
            }
        })
    })

    router.post('/post/join/:id', isLoggedIn, (req, res) => {
        Post.findById(req.params.id).exec((err, docs) => {
            if (err) {
                return res.status(500).send(wrapper('Failed to look up the post.'));                
            }
            if (!docs) {
                return res.status(404).send(wrapper('Post not found.'));                
            } else {
                var exist = false
                for (var i = 0; i < docs.participants.length; i++) {
                    if (JSON.parse(docs.participants[i]).email == req.user.email) {
                        exist = true;
                    }
                }
                if (!exist) {
                    docs.participants.push(JSON.stringify({username: req.user.username, email: req.user.email}))
                    docs.dateLastReplied = new Date()
                }
                Post.findByIdAndUpdate(req.params.id, docs, (err, docs_updated) => {
                    if (err) {
                        return res.status(500).send(wrapper('Failed to look up the post.'));                
                    }
                    if (!docs) {
                        return res.status(404).send(wrapper('Post not found.'));                
                    }
                    else {
                        return res.send(wrapper('OK', reformat(docs)));
                    }
                })
            }
        })
    })
    
    router.post('/post/quit/:id', isLoggedIn, (req, res) => {
        Post.findById(req.params.id).exec((err, docs) => {
            if (err) {
                return res.status(500).send(wrapper('Failed to look up the post.'));                
            }
            if (!docs) {
                return res.status(404).send(wrapper('Post not found.'));                
            } else {
                var newParticipants = [];
                for (var i = 0; i < docs.participants.length; i++) {
                    if (JSON.parse(docs.participants[i]).email != req.user.email) {
                        newParticipants.push(docs.participants[i])
                    }
                }
                docs.participants = newParticipants;
                Post.findByIdAndUpdate(req.params.id, docs, (err, docs_updated) => {
                    if (err) {
                        return res.status(500).send(wrapper('Failed to look up the post.'));                
                    }
                    if (!docs) {
                        return res.status(404).send(wrapper('Post not found.'));                
                    }
                    else {
                        return res.send(wrapper('OK', reformat(docs)));
                    }
                })
            }
        })
    })

    router.get('/post/all', isLoggedIn, (req, res) => {
        Post.find({}, (err, posts) => {
            if (err) {
                return res.status(500).send(wrapper('Failed to get posts.'));                
            }
            for (var i = 0; i < posts.length; i++) {
                reformat(posts[i]);
            }
            return res.send(wrapper('OK', posts));
        })
    })

    router.post('/post/reply/:id', isLoggedIn, (req, res) => {
        if (!req.body || !req.body.text) {
            return res.status(400).send(wrapper("Missing request body, or missing text"))
        }
        Post.findById(req.params.id).exec((err, docs) => {
            if (err) {
                return res.status(500).send(wrapper('Failed to look up the post.'));                
            }
            if (!docs) {
                return res.status(404).send(wrapper('Post not found.'));                
            } else {
                docs.replies.push(req.body.text);
                docs.replyEmails.push(req.user.email);
                docs.replyUsernames.push(req.user.username)
                docs.replyDates.push(new Date())
                docs.dateLastReplied = new Date()
                Post.findByIdAndUpdate(req.params.id, docs, (err, docs_updated) => {
                    if (err) {
                        return res.status(500).send(wrapper('Failed to look up the post.'));                
                    }
                    if (!docs) {
                        return res.status(404).send(wrapper('Post not found.'));                
                    }
                    else {
                        return res.send(wrapper('OK', reformat(docs)));
                    }
                })
            }
        })
    })

    router.post('/post', isLoggedIn, (req, res) => {
        if (!req.body || !req.body.text || !req.body.type || !req.body.latitude || !req.body.longitude) {
            return res.status(400).send(wrapper("Missing request body, or missing text, type, latitude or longitude."))
        }
        var post = new Post({
            username: req.user.username,
            email: req.user.email,
            text: req.body.text,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            type: req.body.type,
            replyUsernames: [],
            replyEmails: [],
            replyDates: [],
            replies: [],
            participants: [],
            dateCreated: new Date(),
            dateLastReplied: new Date()
        })
        post.save((err) => {
            if (err) {
                return res.status(500).send(wrapper('Failed to add post.'));
            } else {
                return res.send(wrapper('Success'))
            }
        })
    })

    return router;
}
function reformat(elem) {
    for (var i = 0; i < elem.replies.length; i++) {
        elem.replies[i] = {
            username: elem.replyUsernames[i],
            email: elem.replyEmails[i],
            text: elem.replies[i],
            date: elem.replyDates[i]
        }
    }
    for (var i = 0; i < elem.participants.length; i++) {
        elem.participants[i] = JSON.parse(elem.participants[i])
    }
    elem.replyEmails = undefined;
    elem.replyUsernames = undefined;
    elem.replyDates = undefined;
    return elem;
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
}