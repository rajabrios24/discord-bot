const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const { play } = require('play-dl');

class MusicPlayer {
  constructor() {
    this.player = createAudioPlayer();
    this.queue = [];
    this.currentSong = null;
    this.loop = false;
    this.shuffle = false;
  }

  async play(guild, channel, song) {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    this.currentSong = song;
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    this.player.play(resource);
    connection.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.loop) {
        this.play(guild, channel, song);
      } else {
        this.skip(guild, channel);
      }
    });
  }

  skip(guild, channel) {
    if (this.queue.length > 0) {
      const nextSong = this.shuffle ? this.queue.sort(() => Math.random() - 0.5)[0] : this.queue.shift();
      this.play(guild, channel, nextSong);
    } else {
      this.currentSong = null;
    }
  }

  stop() {
    this.player.stop();
    this.queue = [];
    this.currentSong = null;
  }

  toggleLoop() {
    this.loop = !this.loop;
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
  }

  addToQueue(song) {
    this.queue.push(song);
  }

  removeFromQueue(index) {
    this.queue.splice(index, 1);
  }

  clearQueue() {
    this.queue = [];
  }
}

module.exports = MusicPlayer;