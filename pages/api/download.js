import ytdl from "ytdl-core";

export default async (req, res) => {
  // Extract the YouTube URL from the request body
  const youtubeUrl = req.body.url; // Change here to get URL from body
  if (!youtubeUrl) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const videoIdMatch = youtubeUrl.match(/v=([a-zA-Z0-9_-]+)/);
    if (!videoIdMatch) {
      throw new Error("Invalid YouTube URL");
    }
    const videoId = videoIdMatch[1];
    const info = await ytdl.getInfo(videoId);

    // Check if the video is available
    if (!info || !info.videoDetails) {
      throw new Error("Video not found or unavailable");
    }

    // Find the audio format
    const audioFormat = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
    });

    // Set the filename to the title with mp3 extension
    const filename = `${info.videoDetails.title}.mp3`;

    // Sanitize the filename
    const sanitizedFilename = filename.replace(/[^a-z0-9 ._-]/gi, "");

    // Set the Content-Disposition header with sanitized filename
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sanitizedFilename}"`
    );

    // Pipe the audio stream to the response
    ytdl(videoId, { format: audioFormat }).pipe(res);
  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.message.includes("410")) {
      return res
        .status(410)
        .json({ error: "The requested video is no longer available." });
    }

    return res.status(400).json({ error: error.message });
  }
};
