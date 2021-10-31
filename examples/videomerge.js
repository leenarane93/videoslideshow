const express = require("express");

const fs = require("fs");

const path = require("path");

const { exec } = require("child_process");

var list = "";

var listFilePath = "public/uploads/" + Date.now() + "list.txt";

var outputFilePath = Date.now() + "output.mp4";

const bodyParser = require("body-parser");

const multer = require("multer");

const app = express();
var playlistSavePath = "C:\\Images\\Playlist\\";
var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const videoFilter = function (req, file, cb) {
  // Accept videos only
  if (!file.originalname.match(/\.(mp4)$/)) {
    req.fileValidationError = "Only video files are allowed!";
    return cb(new Error("Only video files are allowed!"), false);
  }
  cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: videoFilter });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Application is in running mode.");
});

app.post("/imageToVideo", upload.array("imgfiles", 1000), (req, res) => {
  list = "";
  if (req.imgfiles) {
    req.imgfiles.forEach((file) => {
      list = `file ${file.filename}`;
      var idx = list.lastIndexOf(".");
      list = list.substring(0, idx);
      var videoshow = require("../");

      var audio = __dirname + "/../test/fixtures/song.mp3";

      var options = {
        transition: true,
      };

      var images = file;

      videoshow(images, options)
        .audio()
        .save(playlistSavePath + list + ".mp4")
        .on("start", function (command) {
          console.log("ffmpeg process started:", command);
        })
        .on("error", function (err) {
          console.error("Error:", err);
        })
        .on("end", function (output) {
          console.log("Video created in:", output);
        });
      res.send("<h1>Action Completed</h1>");
    });
  }
});

app.post("/videoMerge", upload.array("files", 1000), (req, res) => {
  list = "";
  if (req.files) {
    req.files.forEach((file) => {
      list += `file ${file.filename}`;
      list += "\n";
    });

    var writeStream = fs.createWriteStream(listFilePath);

    writeStream.write(list);

    writeStream.end();

    exec(
      `ffmpeg -safe 0 -f concat -i ${listFilePath} -c copy ${outputFilePath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        } else {
          console.log("videos are successfully merged");
          res.download(outputFilePath, (err) => {
            if (err) throw err;

            req.files.forEach((file) => {
              fs.unlinkSync(file.path);
            });

            fs.unlinkSync(listFilePath);
            fs.unlinkSync(outputFilePath);
          });
        }
      }
    );
  }
  res.send("<h1>Action Completed</h1>");
});

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
