const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
var playlistSavePath = "C:\\Images\\Playlists\\";
var plname = "";
var plduration = 30;

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

  //Videos Merge
  ("use strict");

  let videoStitch = require("video-stitch");

  let videoMerge = videoStitch.merge;

  videoMerge()
    .original({
      fileName: playlistSavePath + plname + ".mp4",
      duration: plduration,
    })
    .clips([
      {
        startTime: "00:00:00",
        fileName: __dirname + "/../test/fixtures/video.mp4",
        duration: "00:00:15",
      },
      {
        startTime: "00:00:00",
        fileName: __dirname + "/../test/fixtures/AVI_Media.avi",
        duration: "00:00:15",
      },
    ])
    .merge()
    .then(
      (outputFile) => {
        console.log("path to output file", outputFile);
      },
      (error) => {
        console.log(error);
      }
    );
});

server.listen(3000, () => {
  console.log("listening on *:3000");
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
