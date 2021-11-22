const express = require("express");

const fs = require("fs");

const path = require("path");

const { exec } = require("child_process");

var list = "";

var listFilePath = "public/uploads/" + Date.now() + "list.txt";

var outputFilePath = Date.now() + "output.mp4";

const bodyParser = require("body-parser");

const multer = require("multer");
const cors = require("cors");

const app = express();
var playlistSavePath = "C:\\Images\\Playlists\\";
var dir = "public";
var subDirectory = "public/uploads";
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
const { getVideoDurationInSeconds } = require('get-video-duration')


const ffmpeg = require("fluent-ffmpeg")()
  .setFfprobePath(ffprobe.path)
  .setFfmpegPath(ffmpegInstaller.path);

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

const imageFilter = function (req, file, cb) {
  // Accept videos only
  if (!file.originalname.match(/\.(png)$/)) {
    req.fileValidationError = "Only video files are allowed!";
    return cb(new Error("Only video files are allowed!"), false);
  }
  cb(null, true);
};

var imgupload = multer({ storage: storage, fileFilter: imageFilter });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
// });

const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Application is in running mode.");
});

// app.post("/imageToVideo", imgupload.array("imgfiles", 1000), (req, res) => {
//   list = "";
//   if (req.imgfiles) {
//     req.imgfiles.forEach((file) => {
//       list = `file ${file.filename}`;
//       var idx = list.lastIndexOf(".");
//       list = list.substring(0, idx);
//       var videoshow = require("../");

//       var audio = __dirname + "/../test/fixtures/song.mp3";

//       var options = {
//         transition: true,
//       };

//       var images = file;

//       videoshow(images, options)
//         .audio()
//         .save("img.mp4")
//         .on("start", function (command) {
//           console.log("ffmpeg process started:", command);
//         })
//         .on("error", function (err) {
//           console.error("Error:", err);
//         })
//         .on("end", function (output) {
//           console.log("Video created in:", output);
//         });
//       res.send("<h1>Action Completed</h1>");
//     });
//   }
// });

app.post("/imageToVideo", (req, res) => {
  console.log(req.body);
  var videoshow = require("../");

  var audio = __dirname + "/../test/fixtures/song.mp3";

  var options = {
    transition: true,
  };

  var images = req.body;
  var plName = req.body[0].plid;
  req.body.forEach((ele) => {
    if (ele.type == "image") {
      videoshow(images, options)
        .audio()
        .save(playlistSavePath + plName + "\\" + "ImageVideo.mp4")
        .on("start", function (command) {
          console.log("ffmpeg process started:", command);
        })
        .on("error", function (err) {
          console.error("Error:", err);
        })
        .on("end", function (output) {
          console.log("Video created in:", output);
        });
    } else if (ele.type == "gif") {
      gifConvert(ele.path, playlistSavePath + plName + "\\", ele.fname, ele.loop);
    }
    res.send("<h1>Action Completed</h1>");
  });
});
app.get("/", (req, res) => {
  console.log(req);
  var videoshow = require("../");

  var audio = __dirname + "/../test/fixtures/song.mp3";

  var options = {
    transition: true,
  };

  var images = files;

  videoshow(images, options)
    .audio()
    .save(playlistSavePath + "ImageVideo.mp4")
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

function gifConvert(path, destPath, fname, duration) {
  ffmpeg
    .input(path)
    .outputOptions([
      "-pix_fmt yuv420p",
      "-c:v libx264",
      "-movflags +faststart",
      "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
    ])
    .noAudio()
    .output(destPath + "GIF.mp4")
    .on("end", () => {
      console.log("Ended");
      getVideoDurationInSeconds(
        destPath + "GIF.mp4"
      ).then((gifLen) => {
        const loopCount = Math.round(duration / gifLen);
        console.log(loopCount);
        exec(
          `ffmpeg -stream_loop ${loopCount} -t ${duration} -i ${destPath + "GIF.mp4"} -c copy ${destPath + "GIFoutput.mp4"}`,
          (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            } else {
              console.log("videos are successfully merged");
              // res.download(outputFilePath, (err) => {
              //   if (err) throw err;
    
              //   req.files.forEach((file) => {
              //     fs.unlinkSync(file.path);
              //   });
    
              //   fs.unlinkSync(listFilePath);
              //   fs.unlinkSync(outputFilePath);
              // });
            }
          }
        );
      })
    })
    .on("error", (e) => console.log(e))
    .run();
  
    
}

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

files = [
  {
    path: __dirname + "/../test/fixtures/step_1.png",
    disableFadeOut: true,
    loop: 2,
  },
  {
    path: __dirname + "/../test/fixtures/step_2.png",
    disableFadeIn: true,
    loop: 2,
  },
];
