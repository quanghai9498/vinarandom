const fs = require('fs');
const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const mime = require('mime-types');

const app = express();
const PORT = 3000;


// Cấu hình này phục vụ tất cả file trong /public (cả .txt, .html, .js, ảnh...)
app.use(express.static(path.join(__dirname, 'public')));

// 1. Serve favicon TRƯỚC các middleware khác
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// 2. Set MIME types - ĐÃ SỬA LỖI
app.use((req, res, next) => {
    if (req.url.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
    } else if (req.url.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
    } else if (req.url.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
    }
    next(); // ← THIẾU DẤNG } TRƯỚC ĐÂY
});

// 3. Serve static files từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// 4. Route chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. API để lấy danh sách tệp trong thư mục ListClass
app.get('/api/listclass', (req, res) => {
    const folderPath = path.join(__dirname, 'ListClass');
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi khi đọc thư mục' });
        }
        const excelFiles = files.filter(file =>
            file.endsWith('.xlsx') || file.endsWith('.xls')
        );
        res.json({ files: excelFiles });
    });
});

// 6. API để lấy nội dung của một tệp cụ thể
app.get('/api/listclass/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'ListClass', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Không tìm thấy tệp' });
    }
});


app.use('/Sound', express.static(path.join(__dirname, 'Sound'), {
    setHeaders: (res, path) => {
        const mimeType = mime.lookup(path);
        if (mimeType) {
            res.setHeader('Content-Type', mimeType);
        }
        // Thêm headers cho audio
        if (path.endsWith('.mp3')) {
            res.setHeader('Accept-Ranges', 'bytes');
        }
    }
}));

app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));
