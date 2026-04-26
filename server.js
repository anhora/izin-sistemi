const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Dosya okuma/yazma için
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_FILE = './database.json';

// Veritabanını (JSON dosyası) okuma fonksiyonu
const readDB = () => {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

// Veritabanına yazma fonksiyonu
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// 1. GET /izinler: Tüm izinleri listele
app.get('/izinler', (req, res) => {
    const izinler = readDB();
    res.json(izinler);
});

// 2. POST /izin-talep: Yeni izin oluştur
app.post('/izin-talep', (req, res) => {
    const izinler = readDB();
    const yeniIzin = {
        id: Date.now(), // Basit benzersiz ID
        adSoyad: req.body.adSoyad,
        tur: req.body.tur,
        baslangic: req.body.baslangic,
        bitis: req.body.bitis,
        aciklama: req.body.aciklama,
        durum: "Beklemede" // Varsayılan durum
    };
    
    izinler.push(yeniIzin);
    writeDB(izinler);
    res.status(201).json(yeniIzin);
});

// 3. PUT /izin-durum/:id: Durumu güncelle (Onayla/Reddet)
app.put('/izin-durum/:id', (req, res) => {
    const izinler = readDB();
    const { id } = req.params;
    const { durum } = req.body;

    const index = izinler.findIndex(i => i.id == id);
    if (index !== -1) {
        izinler[index].durum = durum;
        writeDB(izinler);
        res.json(izinler[index]);
    } else {
        res.status(404).send("İzin bulunamadı");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sunucu ${PORT} portunda aktif.`);
});
