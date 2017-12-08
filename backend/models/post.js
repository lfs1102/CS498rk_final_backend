// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var PostSchema = new mongoose.Schema({
    username: String,
    email: String,
    text: String,
    type: String,
    replyUsernames: [String],
    replyEmails: [String],
    replies: [String],
    participants: [String],
    latitude: Number,
    longitude: Number,
    dateCreated: Date,
    dateLastReplied: Date
});

// Export the Mongoose model
module.exports = mongoose.model('Post', PostSchema);
