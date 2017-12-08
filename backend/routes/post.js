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
                return res.send(wrapper('OK', reformatReplies(docs)))
            }
        })
    })
    
    router.get('/post/all', isLoggedIn, (req, res) => {
        Post.find({}, (err, posts) => {
            if (err) {
                return res.status(500).send(wrapper('Failed to get posts.'));                
            }
            for (var i = 0; i < posts.length; i++) {
                reformatReplies(posts[i]);
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
                docs.dateLastReplied = new Date()
                Post.findByIdAndUpdate(req.params.id, docs, (err, docs_updated) => {
                    if (err) {
                        return res.status(500).send(wrapper('Failed to look up the post.'));                
                    }
                    if (!docs) {
                        return res.status(404).send(wrapper('Post not found.'));                
                    }
                    else {
                        return res.send(wrapper('OK', reformatReplies(docs)));
                    }
                })
            }
        })
    })

    router.post('/post', isLoggedIn, (req, res) => {
        if (!req.body || !req.body.text || !req.body.type) {
            return res.status(400).send(wrapper("Missing request body, or missing text or type"))
        }
        var post = new Post({
            username: req.user.username,
            email: req.user.email,
            text: req.body.text,
            type: req.body.type,
            replyUsernames: [],
            replyEmails: [],
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
function reformatReplies(elem) {
    for (var i = 0; i < elem.replies.length; i++) {
        elem.replies[i] = {
            username: elem.replyUsernames[i],
            email: elem.replyEmails[i],
            text: elem.replies[i]
        }
    }
    elem.replyEmails = undefined;
    elem.replyUsernames = undefined;
    return elem;
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
}