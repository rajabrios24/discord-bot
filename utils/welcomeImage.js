const { createCanvas, loadImage } = require('@napi-rs/canvas');

const WIDTH = 1000;
const HEIGHT = 350;
const AVATAR_SIZE = 200;

/**
 * Generate welcome card image sebagai Buffer PNG.
 * @param {object} options
 * @param {string} options.avatarURL - URL avatar member (displayAvatarURL)
 * @param {string} options.username - nama member (username, bukan display name)
 * @param {string} options.guildName - nama server
 * @param {number} options.memberCount - member ke-berapa
 * @param {[string, string]} options.gradientColors - 2 warna hex untuk gradient background, contoh: ['#1f1c2c', '#928dab']
 * @returns {Promise<Buffer>}
 */
async function generateWelcomeImage({
  avatarURL,
  username,
  guildName,
  memberCount,
  gradientColors = ['#1f1c2c', '#928dab'],
}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // ===== 1. Background gradient =====
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, gradientColors[0]);
  gradient.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ===== 2. Sedikit dekorasi: lingkaran transparan di pojok =====
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(WIDTH - 80, 60, 140, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(60, HEIGHT - 40, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ===== 3. Overlay gelap tipis biar teks kebaca =====
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, HEIGHT - 130, WIDTH, 130);
  ctx.restore();

  // ===== 4. Avatar bulat dengan border =====
  const avatarX = 90;
  const avatarY = HEIGHT / 2;

  try {
    const avatarImg = await loadImage(avatarURL);

    // border putih
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, AVATAR_SIZE / 2 + 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // clip bulat untuk avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, AVATAR_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      avatarImg,
      avatarX - AVATAR_SIZE / 2,
      avatarY - AVATAR_SIZE / 2,
      AVATAR_SIZE,
      AVATAR_SIZE
    );
    ctx.restore();
  } catch (err) {
    console.error('[CANVAS] Gagal load avatar, pakai placeholder lingkaran abu-abu:', err.message);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, AVATAR_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#555555';
    ctx.fill();
    ctx.restore();
  }

  // ===== 5. Teks: "WELCOME" =====
  const textX = avatarX + AVATAR_SIZE / 2 + 50;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('SELAMAT DATANG', textX, HEIGHT / 2 - 25);

  // ===== 6. Teks: username =====
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#ffe66d';
  let displayName = username;
  // potong kalau kepanjangan biar gak overflow
  if (ctx.measureText(displayName).width > WIDTH - textX - 40) {
    while (ctx.measureText(displayName + '...').width > WIDTH - textX - 40 && displayName.length > 0) {
      displayName = displayName.slice(0, -1);
    }
    displayName += '...';
  }
  ctx.fillText(displayName, textX, HEIGHT / 2 + 25);

  // ===== 7. Teks: nama server & member count =====
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#dddddd';
  ctx.fillText(`di ${guildName} • Member #${memberCount}`, textX, HEIGHT / 2 + 65);

  return canvas.encode('png');
}

module.exports = { generateWelcomeImage };
