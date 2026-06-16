const fs = require('fs');
const path = require('path');

const TOOL_MAP = {
  'tiktok': 'tiktok',
  'hook': 'hook',
  'affiliate': 'affiliate',
  'shorts': 'shorts',
  'reels-generator': 'reels',
  'repurpose': 'caption',
  'objection': 'objection',
  'wa-reply': 'reply',
  'story-animation': 'story',
  'trending': 'idea',
  'voice': 'voicescript',
  'fb-pro': 'ads',
  'image-to-animation': 'idea',
  'text-to-video': 'voicescript',
  'video-animation': 'voicescript',
  'voice-to-video': 'voicescript',
  'talking-avatar': 'voicescript',
};

const appDir = path.join(__dirname, 'app');

Object.entries(TOOL_MAP).forEach(([folder, toolKey]) => {
  const filePath = path.join(appDir, folder, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File tidak ada: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(`tool: "${toolKey}"`)) {
    console.log(`✅ Sudah ada: ${folder}`);
    return;
  }

  const updated_content = content.replace(
    /body:\s*JSON\.stringify\(\{(\s*prompt:)/g,
    `body: JSON.stringify({\n          tool: "${toolKey}",$1`
  );

  if (updated_content !== content) {
    fs.writeFileSync(filePath, updated_content, 'utf8');
    console.log(`✅ Updated: ${folder} → tool: "${toolKey}"`);
  } else {
    console.log(`⚠️ Pattern tidak ditemukan: ${folder}`);
  }
});

console.log('\nSelesai!');