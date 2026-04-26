const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// RENDER İÇİN KRİTİK: Portu Render belirler, yerelde 5000 kullanılır.
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Veritabanı dosyası yolu
const DB_FILE = path.join(__dirname, 'database.json');

// Veritabanını kontrol et ve oku
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error("Dosya okuma hatası:", err);
        return [];
    }
};

// Veritabanına yaz
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Dosya yazma hatası:", err);
    }
};

// 1. Tüm izinleri getir (Admin paneli için)
app.get('/izinler', (req, res) => {
    res.json(readDB());
});

// 2. Yeni izin talebi oluştur (Personel formu için)
app.post('/izin-talep', (req, res) => {
    const izinler = readDB();
    const yeniIzin = {
        id: Date.now(),
        adSoyad: req.body.adSoyad,
        tur: req.body.tur,
        baslangic: req.body.baslangic,
        bitis: req.body.bitis,
        aciklama: req.body.aciklama,
        durum: "Beklemede"
    };
    
    izinler.push(yeniIzin);
    writeDB(izinler);
    
    console.log(`✅ Yeni talep alındı: ${req.body.adSoyad}`);
    res.status(201).json(yeniIzin);
});

// 3. İzin durumunu güncelle (Onayla/Reddet)
app.put('/izin-durum/:id', (req, res) => {
    const izinler = readDB();
    const { id } = req.params;
    const { durum } = req.body;

    const index = izinler.findIndex(i => i.id == id);
    if (index !== -1) {
        izinler[index].durum = durum;
        writeDB(izinler);
        console.log(`🔄 Talep güncellendi (ID: ${id}): ${durum}`);
        res.json(izinler[index]);
    } else {
        res.status(404).send("İzin bulunamadı.");
    }
});

// RENDER İÇİN KRİTİK: '0.0.0.0' dış trafiği içeri alır
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sunucu aktif! Port: ${PORT}`);
});