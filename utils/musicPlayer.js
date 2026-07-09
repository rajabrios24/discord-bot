const {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} = require('@discordjs/voice');
const { play } = require('play-dl');

class Queue extends Map {
  constructor() {
    super();
  }
}

class Song {
  constructor({ title, url, duration, thumbnail, requestedBy }) {
    this.title = title;
    this.url = url;
    this.duration = duration;
    this.thumbnail = thumbnail;
    this.requestedBy = requestedBy;
  }
}

class MusicPlayer {
  constructor() {
    this.queues = new Queue();
    this.autoplay = new Map();
    this.volume = new Map();
    this.textChannel = new Map();
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        songs: [],
        player: createAudioPlayer(),
        connection: null,
        currentSong: null,
        loop: false,
        loopQueue: false,
        shuffle: false,
        paused: false,
      });
    }
    return this.queues.get(guildId);
  }

  getVolume(guildId) {
    return this.volume.get(guildId) || 100;
  }

  setVolume(guildId, vol) {
    this.volume.set(guildId, vol);
    const queue = this.getQueue(guildId);
    if (queue.player) {
      const resource = queue.player._resource;
      if (resource && resource.volume) {
        resource.volume.setVolume(vol / 100);
      }
    }
  }

  async playSong(guildId, voiceChannel, song) {
    const queue = this.getQueue(guildId);
    queue.currentSong = song;

    try {
      const stream = await play.stream(song.url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true,
      });

      const vol = this.getVolume(guildId);
      resource.volume.setVolume(vol / 100);

      // Set timeout agar bot auto leave setelah 5 menit idle
      clearTimeout(this.autoplay.get(guildId));
      this.autoplay.delete(guildId);

      queue.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      queue.connection.subscribe(queue.player);
      queue.player.play(resource);

      // Handle connection events
      queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
        if (queue.connection.rejoinAttempts < 5) {
          await queue.connection.rejoin();
        } else {
          this.clearQueue(guildId);
          queue.connection.destroy();
        }
      });

      entersState(queue.connection, VoiceConnectionStatus.Ready, 30_000);

      // Handle when song finishes
      queue.player.once(AudioPlayerStatus.Idle, () => {
        if (queue.loop) {
          this.playSong(guildId, voiceChannel, song);
        } else if (queue.songs.length > 0) {
          const nextSong = queue.songs.shift();
          this.playSong(guildId, voiceChannel, nextSong);
        } else {
          queue.currentSong = null;
          // Autoleave setelah 5 menit
          const timeout = setTimeout(() => {
            const conn = getVoiceConnection(guildId);
            if (conn) conn.destroy();
            if (this.queues.has(guildId)) this.queues.delete(guildId);
          }, 300_000);
          this.autoplay.set(guildId, timeout);
        }
      });

      return song;
    } catch (error) {
      console.error('Error playing song:', error);
      queue.currentSong = null;
      // Try next song in queue
      if (queue.songs.length > 0) {
        const nextSong = queue.songs.shift();
        return this.playSong(guildId, voiceChannel, nextSong);
      }
      throw error;
    }
  }

  skip(guildId, voiceChannel) {
    const queue = this.getQueue(guildId);
    if (queue.songs.length > 0) {
      queue.player.stop();
      // The Idle event handler will pick up the next song
      return true;
    } else {
      queue.player.stop();
      queue.currentSong = null;
      const conn = getVoiceConnection(guildId);
      if (conn) conn.destroy();
      if (this.queues.has(guildId)) this.queues.delete(guildId);
      return false;
    }
  }

  stop(guildId) {
    const queue = this.getQueue(guildId);
    queue.player.stop();
    queue.songs = [];
    queue.currentSong = null;
    queue.paused = false;
    const conn = getVoiceConnection(guildId);
    if (conn) conn.destroy();
    if (this.queues.has(guildId)) this.queues.delete(guildId);
  }

  pause(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.player && queue.player.state.status === AudioPlayerStatus.Playing) {
      queue.player.pause();
      queue.paused = true;
      return true;
    }
    return false;
  }

  resume(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.player && queue.player.state.status === AudioPlayerStatus.Paused) {
      queue.player.unpause();
      queue.paused = false;
      return true;
    }
    return false;
  }

  leave(guildId) {
    const queue = this.getQueue(guildId);
    queue.player.stop();
    const conn = getVoiceConnection(guildId);
    if (conn) conn.destroy();
    if (this.queues.has(guildId)) this.queues.delete(guildId);
    clearTimeout(this.autoplay.get(guildId));
    this.autoplay.delete(guildId);
    this.volume.delete(guildId);
  }

  toggleLoop(guildId) {
    const queue = this.getQueue(guildId);
    queue.loop = !queue.loop;
    if (queue.loop) queue.loopQueue = false;
    return queue.loop;
  }

  toggleLoopQueue(guildId) {
    const queue = this.getQueue(guildId);
    queue.loopQueue = !queue.loopQueue;
    if (queue.loopQueue) queue.loop = false;
    return queue.loopQueue;
  }

  toggleShuffle(guildId) {
    const queue = this.getQueue(guildId);
    queue.shuffle = !queue.shuffle;
    if (queue.shuffle) {
      // Fisher-Yates shuffle
      for (let i = queue.songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
      }
    }
    return queue.shuffle;
  }

  addToQueue(guildId, song) {
    const queue = this.getQueue(guildId);
    queue.songs.push(song);
    return queue.songs.length;
  }

  removeFromQueue(guildId, index) {
    const queue = this.getQueue(guildId);
    if (index < 0 || index >= queue.songs.length) return null;
    return queue.songs.splice(index, 1)[0];
  }

  clearQueue(guildId) {
    const queue = this.getQueue(guildId);
    queue.songs = [];
  }
}

module.exports = { MusicPlayer, Song };
