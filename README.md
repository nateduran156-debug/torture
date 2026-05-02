# luna-bot

A feature-rich Discord bot with 132 slash commands. Built with **discord.js v14**.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your `.env` file**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `DISCORD_BOT_TOKEN` — from [Discord Developer Portal](https://discord.com/developers/applications)
   - `CLIENT_ID` — your bot's application ID
   - `GUILD_ID` — (optional) your server ID for instant slash command registration during testing
   - `LASTFM_API_KEY` — free from [Last.fm API](https://www.last.fm/api/account/create)
   - `FORTNITE_API_KEY` — free from [fortnite-api.com](https://fortnite-api.com)

3. **Enable Privileged Intents**
   In the Developer Portal → Your App → Bot, enable:
   - **Server Members Intent**
   - **Message Content Intent**
   - **Presence Intent**

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

---

## Commands (132 total)

### 🛡️ Moderation
| Command | Description |
|---------|-------------|
| `/ban` | Ban a user |
| `/unban` | Unban a user |
| `/kick` | Kick a member |
| `/softban` | Ban then immediately unban to clear messages |
| `/hardban` | Permanently ban + delete 7 days of messages |
| `/hackban` | Ban a user by ID (not in server) |
| `/tempban` | Temporarily ban a member (auto-unbans) |
| `/mute` | Timeout a member |
| `/unmute` | Remove a timeout |
| `/warn` | Warn a member |
| `/warnings` | View a member's warnings |
| `/delwarn` | Delete a specific warning |
| `/clearwarns` | Clear all warnings |
| `/jail` | Restrict member to jail channel |
| `/unjail` | Release from jail and restore roles |
| `/purge` | Bulk delete messages |
| `/lock` | Lock a channel |
| `/unlock` | Unlock a channel |
| `/slowmode` | Set slowmode |
| `/nick` | Change a member's nickname |
| `/role` | Add or remove a role |
| `/strip` | Remove all roles from a member |
| `/stripstaff` | Remove dangerous permissions from a member's roles |
| `/deafen` | Server-deafen in voice |
| `/undeafen` | Undeafen in voice |
| `/move` | Move member to another voice channel |
| `/setup` | Create jail channel, jail role, and mute roles |
| `/antinuke` | Configure anti-nuke |

### 🔧 Utility
| Command | Description |
|---------|-------------|
| `/ping` | Bot latency |
| `/uptime` | Bot uptime |
| `/botinfo` | Bot statistics |
| `/help` | View all commands |
| `/avatar` | View a user's avatar |
| `/banner` | View a user's banner |
| `/userinfo` | Detailed user info |
| `/serverinfo` | Detailed server info |
| `/roleinfo` | Role info |
| `/icon` | Server icon |
| `/snipe` | Last deleted message |
| `/editsnipe` | Last edited message |
| `/steal` | Steal an emoji from another server |
| `/stealemoji` | Steal a custom emoji into this server |
| `/emojiinfo` | Info about a custom emoji |
| `/inviteinfo` | Info about an invite code |
| `/membercount` | Server member count breakdown |
| `/color` | Preview a hex color |
| `/poll` | Create a poll |
| `/reminder` | Set reminders |
| `/todo` | Personal to-do list |
| `/prefix` | View or change the bot prefix |

### 🎉 Fun
| Command | Description |
|---------|-------------|
| `/8ball` | Magic 8-ball |
| `/coinflip` | Flip a coin |
| `/roll` | Roll dice |
| `/rps` | Rock paper scissors |
| `/joke` | Random joke |
| `/meme` | Random meme |
| `/ship` | Ship two users |
| `/rate` | Rate something |
| `/pp` | pp size meter |
| `/gay` | Gay percentage |
| `/fact` | Random fact |
| `/roast` | Roast a user |
| `/compliment` | Compliment a user |
| `/hug` `/kiss` `/slap` `/pat` | Action commands |

### 💰 Economy
| Command | Description |
|---------|-------------|
| `/balance` | View wallet + bank |
| `/daily` | Claim daily reward |
| `/weekly` | Claim weekly reward |
| `/work` | Work for coins |
| `/beg` | Beg for money |
| `/crime` | Risky crime activity |
| `/rob` | Rob another user |
| `/deposit` `/withdraw` | Bank management |
| `/pay` | Transfer coins |
| `/slots` | Slot machine |
| `/shop` `/buy` `/inventory` | Item shop |
| `/leaderboard` | Richest users |

### 📊 Leveling
| Command | Description |
|---------|-------------|
| `/rank` | View XP rank card |
| `/xpleaderboard` | Top 10 XP leaderboard |
| `/levels` | Configure leveling system |

### 🎊 Giveaways
| Command | Description |
|---------|-------------|
| `/giveaway start` | Start a giveaway |
| `/giveaway end` | End a giveaway early |
| `/giveaway reroll` | Reroll winners |
| `/giveaway edit prize/host/duration` | Edit a giveaway |

### 🎵 Music
| Command | Description |
|---------|-------------|
| `/play` | Play a song or playlist |
| `/queue` | View the music queue |
| `/nowplaying` | Current track info |
| `/skip` | Skip current track |
| `/pause` `/resume` | Pause/resume playback |
| `/stop` | Stop and disconnect |
| `/volume` | Set/view volume |
| `/shuffle` | Shuffle the queue |
| `/loop` | Set loop mode |
| `/remove` | Remove a track |
| `/clearqueue` | Clear the queue |
| `/lyrics` | Fetch song lyrics |

### 🎸 Last.fm
| Command | Description |
|---------|-------------|
| `/lastfm set/logout/profile` | Account management |
| `/fmset` | Quickly link Last.fm username |
| `/np` | Now playing |
| `/recenttracks` | Recently played |
| `/topartists` `/toptracks` `/topalbums` | Top stats |
| `/whoknows` | Server artist leaderboard |
| `/taste` | Compare music taste |

### ⚙️ Configuration
| Command | Description |
|---------|-------------|
| `/welcome add/remove/view` | Welcome messages |
| `/goodbye set/disable/view` | Goodbye messages |
| `/boost add/remove/view` | Boost messages |
| `/log add/remove/list` | Event logging |
| `/alias add/remove/list` | Command aliases |
| `/autoresponder add/remove/list` | Auto responders |
| `/timer add/remove/list` | Scheduled messages |
| `/reactiontrigger add/remove/list` | Auto-react |
| `/bumpreminder set/disable/view` | Bump reminders |
| `/reactionrole add/remove/list` | Reaction roles |
| `/buttonrole add/remove/list` | Button roles |
| `/boosterrole create/color/rename/delete` | Booster roles |
| `/starboard` | Starboard config |
| `/clownboard` | Clownboard config |
| `/counter add/remove/list` | Server counters |
| `/voicemaster` | Temp voice channels |
| `/tickets` | Ticket system |
| `/autorole` | Auto-assign role on join |
| `/bind` | Staff role bindings |
| `/settings` | Bot settings |

### 🎮 Integrations
| Command | Description |
|---------|-------------|
| `/fortnite shop/cosmetic/stats` | Fortnite commands |
| `/webhook create/send/delete/list` | Webhook management |

---

## File Structure

```
discord-bot/
├── src/
│   ├── index.js                   # Entry point
│   ├── deploy-commands.js         # Slash command deployer
│   ├── managers/
│   │   └── MusicManager.js        # Music queue + @discordjs/voice
│   ├── commands/                  # 132 commands across 10 categories
│   ├── events/                    # Discord event handlers
│   └── utils/
│       ├── embed.js               # Embed builder with luna logo
│       ├── database.js            # JSON file-based persistence
│       └── permissions.js         # Permission helpers
├── data/                          # Auto-created JSON data files
├── config.json                    # Colors, economy values, XP config
├── .env.example                   # Environment variable template
└── package.json
```

## Notes
- All embeds use `#2b2d31` default color, green for success, red for errors
- Music streams from YouTube via `play-dl` + `ffmpeg-static`
- Last.fm commands require a free API key
- Tempbans are automatically restored on bot restart
