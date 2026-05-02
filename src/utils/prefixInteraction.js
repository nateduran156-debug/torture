class PrefixOptions {
  constructor(message, args, cmdData) {
    this._message = message;
    this._args = [...args];
    this._parsed = {};
    this._subcommand = null;
    this._subcommandGroup = null;
    this._parse(cmdData);
  }

  _parse(cmdData) {
    if (!cmdData?.options?.length) return;
    const opts = cmdData.options;
    const args = [...this._args];

    if (opts[0]?.type === 2) {
      const groupName = args.shift()?.toLowerCase();
      this._subcommandGroup = groupName ?? null;
      const group = opts.find(o => o.name === groupName);
      if (group?.options) {
        const subName = args.shift()?.toLowerCase();
        this._subcommand = subName ?? null;
        const sub = group.options.find(o => o.name === subName);
        if (sub?.options) this._parseFlat(sub.options, args);
      }
    } else if (opts[0]?.type === 1) {
      const subName = args.shift()?.toLowerCase();
      this._subcommand = subName ?? null;
      const sub = opts.find(o => o.name === subName);
      if (sub?.options) this._parseFlat(sub.options, args);
    } else {
      this._parseFlat(opts, args);
    }
  }

  _parseFlat(opts, args) {
    for (let i = 0; i < opts.length; i++) {
      const opt = opts[i];
      if (args[i] === undefined) break;
      if (opt.type === 3 && i === opts.length - 1) {
        this._parsed[opt.name] = args.slice(i).join(" ");
      } else {
        this._parsed[opt.name] = args[i];
      }
    }
  }

  _id(name) {
    const val = this._parsed[name];
    if (!val) return null;
    const m = val.match(/(\d{17,19})/);
    return m ? m[1] : null;
  }

  getSubcommand()      { return this._subcommand; }
  getSubcommandGroup() { return this._subcommandGroup; }
  getString(name)      { return this._parsed[name] ?? null; }
  getInteger(name)     { const v = this._parsed[name]; return v != null ? (parseInt(v) || null) : null; }
  getNumber(name)      { const v = this._parsed[name]; return v != null ? (parseFloat(v) || null) : null; }
  getBoolean(name)     { const v = this._parsed[name]; if (!v) return null; return ["true","1","yes"].includes(v.toLowerCase()); }

  getUser(name) {
    const id = this._id(name);
    return id ? (this._message.client.users.cache.get(id) ?? null) : null;
  }
  getMember(name) {
    const id = this._id(name);
    return id ? (this._message.guild?.members.cache.get(id) ?? null) : null;
  }
  getRole(name) {
    const id = this._id(name);
    return id ? (this._message.guild?.roles.cache.get(id) ?? null) : null;
  }
  getChannel(name) {
    const id = this._id(name);
    return id ? (this._message.guild?.channels.cache.get(id) ?? null) : null;
  }
  getMentionable(name) {
    return this.getRole(name) ?? this.getMember(name) ?? null;
  }
  getAttachment()  { return null; }
}

class PrefixInteraction {
  constructor(message, command, args) {
    this.guild   = message.guild;
    this.channel = message.channel;
    this.member  = message.member;
    this.user    = message.author;
    this.client  = message.client;
    this._message = message;
    this._replied = false;
    this._replyMsg = null;

    const rawData = typeof command.data.toJSON === "function" ? command.data.toJSON() : command.data;
    this.options = new PrefixOptions(message, args, rawData);
  }

  _build(opts) {
    if (typeof opts === "string") return { content: opts };
    const out = {};
    if (opts.content)    out.content    = opts.content;
    if (opts.embeds)     out.embeds     = opts.embeds;
    if (opts.components) out.components = opts.components;
    if (opts.files)      out.files      = opts.files;
    return out;
  }

  async reply(opts) {
    if (this._replied) return this.followUp(opts);
    this._replied = true;
    if (opts?.ephemeral) return;
    try {
      this._replyMsg = await this._message.channel.send(this._build(opts));
    } catch {}
    return this._replyMsg;
  }

  async deferReply(opts = {}) {
    if (opts?.ephemeral) return;
    try {
      this._replyMsg = await this._message.channel.send({ content: "⏳" });
      this._replied = true;
    } catch {}
  }

  async editReply(opts) {
    try {
      if (this._replyMsg) return this._replyMsg.edit(this._build(opts));
      return this._message.channel.send(this._build(opts));
    } catch {}
  }

  async followUp(opts) {
    if (opts?.ephemeral) return;
    try {
      return this._message.channel.send(this._build(opts));
    } catch {}
  }

  isRepliable() { return true; }
}

module.exports = { PrefixInteraction };
