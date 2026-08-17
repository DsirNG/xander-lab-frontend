import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

console.log('🔍 Generating SEO-optimized meta tags...');

// Read the built index.html
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Ensure all image URLs are absolute
    html = html.replace(/href="\/favicon/g, 'href="https://dinqor.cn/favicon');
    html = html.replace(/href="\/android-chrome/g, 'href="https://dinqor.cn/android-chrome');
    html = html.replace(/href="\/apple-touch/g, 'href="https://dinqor.cn/apple-touch');
    html = html.replace(/content="\/og-image/g, 'content="https://dinqor.cn/og-image');
    html = html.replace(/content="\/twitter-image/g, 'content="https://dinqor.cn/twitter-image');
    html = html.replace(/content="\/logo-512/g, 'content="https://dinqor.cn/logo-512');

    // Write back
    fs.writeFileSync(indexPath, html);
    console.log('✅ Meta tags optimized successfully!');
    console.log('📝 All image URLs converted to absolute paths');
} else {
    console.error('❌ dist/index.html not found. Please run "npm run build" first.');
    process.exit(1);
}

console.log('\n📋 Next steps:');
console.log('1. Test social media preview: https://developers.facebook.com/tools/debug/');
console.log('2. Verify images are accessible: https://dinqor.cn/og-image.png');
console.log('3. Submit sitemap: https://search.google.com/search-console');
