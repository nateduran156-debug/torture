const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, entersState, StreamType } = require("@discordjs/voice");
const playdl = require("play-dl");

class MusicQueue {
  constructor(guildId) {
    this.guildId = guildId;
    this.tracks = [];
    this.current = null;
    this.player = createAudioPlayer();
    this.connection = null;
    this.volume = 100;
    this.loop = "none"; // none | track | queue
    this.textChannel = null;
    this._setupPlayer();
  }

  _setupPlayer() {
    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.loop === "track" && this.current) {
        this._playTrack(this.current);
      } else {
        if (this.loop === "queue" && this.current) this.tracks.push(this.current);
        this.current = null;
        this._next();
      }
    });
    this.player.on("error", (err) => {
      console.error("[music] Player error:", err.message);
      this.current = null;
      this._next();
    });
  }

  async _next() {
    if (!this.tracks.length) {
      this.current = null;
      if (this.textChannel) this.textChannel.send({ content: "Queue finished. Leaving voice channel in 30s..." }).catch(() => {});
      setTimeout(() => { if (!this.current) this.destroy(); }, 30000);
      return;
    }
    const track = this.tracks.shift();
    await this._playTrack(track);
  }

  async _playTrack(track) {
    try {
      this.current = track;
      let stream;
      if (track.url.includes("youtube") || track.url.includes("youtu.be")) {
        const info = await playdl.stream(track.url, { quality: 2 });
        stream = createAudioResource(info.stream, { inputType: info.type, inlineVolume: true });
      } else {
        const searched = await playdl.search(track.query || track.title, { source: { youtube: "video" }, limit: 1 });
        if (!searched.length) { this._next(); return; }
        const info = await playdl.stream(searched[0].url, { quality: 2 });
        stream = createAudioResource(info.stream, { inputType: info.type, inlineVolume: true });
        track.url = searched[0].url;
      }
      stream.volume?.setVolume(this.volume / 100);
      this.player.play(stream);
      if (this.textChannel) {
        const { base } = require("../utils/embed");
        const embed = base(null).setTitle("🎵 Now Playing").setDescription(`[${track.title}](${track.url})\n**Duration:** ${track.duration} | **Requested by:** <@${track.requesterId}>`).setThumbnail(track.thumbnail).setColor(0x2b2d31);
        this.textChannel.send({ embeds: [embed] }).catch(() => {});
      }
    } catch (err) {
      console.error("[music] Stream error:", err.message);
      this.current = null;
      this._next();
    }
  }

  async join(voiceChannel) {
    this.connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: voiceChannel.guild.id, adapterCreator: voiceChannel.guild.voiceAdapterCreator });
    try { await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000); } catch { this.destroy(); throw new Error("Could not connect to voice channel."); }
    this.connection.subscribe(this.player);
    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try { await entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000); } catch { this.destroy(); }
    });
  }

  async add(track) {
    this.tracks.push(track);
    if (!this.current) await this._next();
  }

  skip() { this.player.stop(true); }
  pause() { this.player.pause(); }
  resume() { this.player.unpause(); }
  shuffle() { for (let i = this.tracks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]]; } }
  setVolume(vol) { this.volume = vol; }
  remove(index) { if (index < 0 || index >= this.tracks.length) return null; return this.tracks.splice(index, 1)[0]; }
  clear() { this.tracks = []; this.player.stop(true); this.current = null; }

  destroy() {
    this.tracks = [];
    this.current = null;
    try { this.player.stop(true); } catch {}
    try { this.connection?.destroy(); } catch {}
    MusicManager.queues.delete(this.guildId);
  }
}

class MusicManager {
  static queues = new Map();

  static get(guildId) { return this.queues.get(guildId) ?? null; }

  static getOrCreate(guildId) {
    if (!this.queues.has(guildId)) this.queues.set(guildId, new MusicQueue(guildId));
    return this.queues.get(guildId);
  }

  static destroy(guildId) {
    const q = this.queues.get(guildId);
    if (q) q.destroy();
  }

  static async search(query) {
    if (playdl.yt_validate(query) === "video") {
      const info = await playdl.video_info(query);
      const v = info.video_details;
      return [{ title: v.title, url: v.url, duration: v.durationRaw, thumbnail: v.thumbnails?.[0]?.url, query }];
    }
    if (playdl.yt_validate(query) === "playlist") {
      const pl = await playdl.playlist_info(query, { incomplete: true });
      return (pl.videos ?? []).slice(0, 50).map(v => ({ title: v.title, url: v.url, duration: v.durationRaw, thumbnail: v.thumbnails?.[0]?.url, query: v.title }));
    }
    const results = await playdl.search(query, { source: { youtube: "video" }, limit: 1 });
    if (!results.length) return [];
    const v = results[0];
    return [{ title: v.title, url: v.url, duration: v.durationRaw, thumbnail: v.thumbnails?.[0]?.url, query }];
  }
}

module.exports = MusicManager;
