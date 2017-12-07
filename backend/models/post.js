// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var PostSchema = new mongoose.Schema({
    username: String,
    email: String,
    text: String,
    type: String,
    replies: [String],
    participants: [String],
    dateCreated: Date
});

// Export the Mongoose model
module.exports = mongoose.model('Post', PostSchema);
