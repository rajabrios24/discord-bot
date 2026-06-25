# Discord Bot - Welcome, Goodbye, Auto Role, Button Role

Bot Discord basic dengan 4 fitur: welcome message, goodbye message, auto role, dan role pilihan via button.

## 📁 Struktur Folder
```
discord-bot/
├── commands/
│   ├── ping.js
│   └── setup-roles.js
├── events/
│   ├── ready.js
│   ├── guildMemberAdd.js      # welcome image + auto role + log join
│   ├── guildMemberRemove.js   # goodbye + log leave
│   ├── messageUpdate.js       # log edit message
│   ├── messageDelete.js       # log delete message
│   └── interactionCreate.js   # button & slash command handler
├── utils/
│   ├── welcomeImage.js        # generate welcome image dengan canvas
│   └── logger.js              # kirim embed log ke LOG_CHANNEL_ID
├── config.json                # daftar role untuk button
├── deploy-commands.js         # script daftarin slash command
├── index.js                   # entry point
├── .env.example
└── package.json
```

## 🚀 Cara Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Siapkan file `.env`
Salin `.env.example` jadi `.env`, lalu isi:

```
DISCORD_TOKEN=token_bot_kamu
CLIENT_ID=application_id_bot_kamu
WELCOME_CHANNEL_ID=id_channel_welcome
GOODBYE_CHANNEL_ID=id_channel_goodbye
AUTO_ROLE_ID=id_role_otomatis
LOG_CHANNEL_ID=id_channel_log
GUILD_ID=id_server_kamu
```

**Cara dapat ID-ID ini:**
- Aktifkan **Developer Mode**: Discord Settings → Advanced → Developer Mode (ON)
- Klik kanan channel/role/server → "Copy ID"
- `CLIENT_ID` = Application ID, ada di [Discord Developer Portal](https://discord.com/developers/applications) → pilih bot kamu → General Information

### 3. Aktifkan Privileged Intents (PENTING!)
Di [Discord Developer Portal](https://discord.com/developers/applications) → pilih bot kamu → tab **Bot** → scroll ke **Privileged Gateway Intents** → aktifkan:
- ✅ **SERVER MEMBERS INTENT** (wajib untuk welcome/goodbye/auto role)
- ✅ **MESSAGE CONTENT INTENT**

Tanpa ini bot akan error saat start.

### 4. Edit `config.json`
Ganti `ISI_ID_ROLE_GAMER` dkk dengan ID role asli dari server kamu. Bisa tambah/kurang jumlah role-nya sesuai kebutuhan, style yang tersedia: `Primary`, `Secondary`, `Success`, `Danger`.

### 5. Undang bot ke server dengan permission yang benar
Generate invite link di Developer Portal → tab **OAuth2** → **URL Generator**:
- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Manage Roles`, `Send Messages`, `Embed Links`, `Use Application Commands`, `View Channel`

⚠️ **Penting soal role bot**: Di Server Settings → Roles, posisikan role bot **di atas** semua role yang ingin diatur olehnya (auto role & role button). Bot tidak bisa memberi/mencabut role yang posisinya lebih tinggi dari role bot sendiri.

### 6. Daftarkan slash command
```bash
npm run deploy
```

### 7. Jalankan bot
```bash
npm start
```

Kalau muncul `✅ Bot online sebagai NamaBot#0000` di terminal, berarti sukses.

## 🎮 Cara Pakai

| Command | Fungsi |
|---|---|
| `/ping` | Test apakah bot online |
| `/setup-roles` | Kirim pesan dengan button role (perlu permission Manage Roles) |

- **Welcome/Goodbye**: otomatis jalan saat ada member join/leave, tidak perlu command. Welcome message kini pakai custom image (avatar + gradient background, di-generate dengan canvas).
- **Auto Role**: otomatis diberikan saat member join, asal `AUTO_ROLE_ID` sudah diisi di `.env`.
- **Button Role**: jalankan `/setup-roles` sekali di channel yang diinginkan, member tinggal klik button untuk toggle role (klik lagi = lepas role).
- **Logging**: kalau `LOG_CHANNEL_ID` diisi di `.env`, bot otomatis mencatat ke channel tersebut:
  - Member join (akun dibuat kapan, total member)
  - Member leave (role yang dimiliki, kapan join, sisa member)
  - Message edited (isi sebelum & sesudah)
  - Message deleted (isi pesan yang dihapus)

  ⚠️ Log edit/delete message **hanya berfungsi untuk pesan yang sudah di-cache bot** (pesan yang muncul setelah bot online di sesi berjalan). Ini limitasi Discord API — pesan lama yang belum pernah "dilihat" bot tidak bisa di-tampilkan isinya saat dihapus/diedit. Kalau ingin history lebih panjang, perlu database tambahan (di luar scope basic ini).

  Logging ini opsional — kalau `LOG_CHANNEL_ID` tidak diisi, fitur ini otomatis nonaktif tanpa error.

### 🎨 Custom Welcome Image
Warna gradient background welcome image bisa diganti di `events/guildMemberAdd.js`, cari baris:
```js
gradientColors: ['#1f1c2c', '#928dab'],
```
Ganti dengan 2 kode warna hex favorit kamu.

## 🛠️ Troubleshooting Cepat

| Masalah | Solusi |
|---|---|
| Bot tidak kirim welcome message | Cek `WELCOME_CHANNEL_ID` benar & bot punya akses ke channel itu |
| Welcome image gagal/error saat join | Cek koneksi internet server bot (perlu fetch avatar dari CDN Discord), lihat log error di terminal |
| Auto role tidak jalan | Pastikan SERVER MEMBERS INTENT aktif & posisi role bot di atas role yang dituju |
| Button role error saat diklik | Cek `roleId` di `config.json` sudah benar, dan posisi role bot di atas role tersebut |
| `/setup-roles` tidak muncul di Discord | Jalankan `npm run deploy` lagi, pastikan `CLIENT_ID` & `GUILD_ID` benar |
| Error "Used disallowed intents" saat start | Aktifkan Privileged Gateway Intents di Developer Portal (lihat langkah 3) |
| Log edit/delete tidak muncul untuk pesan lama | Normal — bot hanya bisa baca isi pesan yang sudah ke-cache (setelah bot online) |

## 📦 Next Steps (kalau mau dikembangin lagi)
- Leveling system / XP
- Moderation command (kick, ban, mute, warn)
- Database (SQLite/MongoDB) supaya config per-server bisa diatur lewat command, bukan edit file manual, dan log message lama tidak hilang setelah restart
