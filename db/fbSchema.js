const mongoose = require("mongoose");

const fbSchema = new mongoose.Schema({
  user: String,
  imgName: String,
  text: String,
  avatar: String,
  timestamp: String,
});
module.exports = mongoose.model("posts", fbSchema);
