const { Telegraf } = require("telegraf");
const axios = require("axios");
const dotenv = require("dotenv");
const ytdl = require("ytdl-core");

dotenv.config();
const token = process.env.API;

const bot = new Telegraf(token);

bot.start((ctx) => {
    ctx.reply(`Welcome ${ctx?.update?.message?.from?.first_name} 👋 . I'm Youtube mp3 downloader bot. You can use the "/song url" command to download music.`)
});

const downloadImage = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
}

bot.on("message", async (ctx) => {
  if (ctx.message.text.startsWith("/song")) {
    try {
      const url = ctx?.update?.message?.text.slice(6);

      const info = await ytdl.getInfo(url);

      const audioStream = ytdl(url, { quality: "highestaudio" });

      const filename = `${info.videoDetails.title} - ${info.videoDetails.author}.m4a`;

      const thumbUrl =
        info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
          .url;

      const thumbBuffer = await downloadImage(thumbUrl);

      ctx.replyWithAudio(
        { source: audioStream, filename: filename },
        {
          title: info.videoDetails.title,
          performer: info.videoDetails.author.name,
          duration: info.videoDetails.lengthSeconds,
          thumb: { source: thumbBuffer },
        }
      );

      ctx.reply("🚀 Downloading the audio file. Please wait...");
    } catch (error) {
      console.error("Error:", error.message);
      ctx.reply(
        "Error fetching audio. Please check the YouTube link and try again."
      );
    }
  }
});

bot.launch();
