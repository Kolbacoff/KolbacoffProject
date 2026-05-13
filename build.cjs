const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const dist = 'dist';

// Удаляем старый dist
if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
}

// Создаём dist
fs.mkdirSync(dist);

// Сборка JS
esbuild.buildSync({
    entryPoints: ['script.js'],
    bundle: true,
    outfile: 'dist/script.js'
});

// Копирование файлов
const files = ['index.html', 'booking.html', 'style.css', 'supabase.js'];
files.forEach(file => fs.copyFileSync(file, path.join(dist, file)));

// Копирование папок
function copyFolder(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolder(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyFolder('images', 'dist/images');
copyFolder('docs', 'dist/docs');

console.log('Build complete');