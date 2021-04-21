const express = require("express");
const cors = require("cors");
const bosyParser = require("body-parser");
const Pusher = require("pusher");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const { resolve } = require("path");
const { rejects } = require("assert");
const mongoPosts = require("./db/fbSchema");

Grid.mongo = mongoose.mongo;

// app config
const app = express();
const port = process.env.PORT || 8080;

//middlewares
app.use(cors());
app.use(express.json());

//db config

const connection_url =
  "mongodb+srv://admin:uhvrVcnnpvtFgqL2@cluster0.wkb0r.mongodb.net/faceboookDB?retryWrites=true&w=majority";
const con = mongoose.createConnection(connection_url, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
let gfs;
con.once("open", () => {
  console.log("connection sucessful");
  gfs = Grid(con.db, mongoose.mongo);
  gfs.collection("images");
});

const storage = new GridFsStorage({
  url: connection_url,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
      const fileInfo = {
        filename: filename,
        bucketName: "images",
      };
      resolve(fileInfo);
    });
  },
});
const upload = multer({ storage });

mongoose.connect(connection_url, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//api route
app.get("/", (req, res) => {
  res.status(200).send("hello world");
});
app.post("/upload/image", upload.single("file"), (req, res) => {
  res.status(201).send(req.file);
});
app.post("/upload/post", (req, res) => {
  const dbPost = req.body;
  mongoPosts.create(dbPost, (err, doc) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(doc);
    }
  });
});
app.get("/retrieve/posts", (req, res) => {
  mongoPosts.find((err, doc) => {
    if (err) {
      res.status(500).send(err);
    } else {
      data.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });
      res.status(200).send(data);
    }
  });
});
app.get("/retrieve/images/single", (req, res) => {
  gfs.files.findOne({ filename: req.query.name }, (err, file) => {
    if (err) {
      res.status(500).json({ err: "file Not found" });
    } else {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    }
  });
});
//listen
app.listen(port, () => {
  console.log("server is listening at port 8080");
});
