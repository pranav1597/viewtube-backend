import ffmpeg from "fluent-ffmpeg";


// ffmpeg.setFfprobePath("path/to/ffprobe");

const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      // Extract the duration in seconds
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
};

export { getVideoDuration } 