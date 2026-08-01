# WuWa Data Repository

Repositori terpusat untuk manajemen data **Wuthering Waves** (Karakter, Senjata, Echo, Sonata, dan Material). Proyek ini dirancang untuk mendukung aplikasi frontend (SvelteKit) dengan struktur data yang optimal, ringan, dan mudah disinkronkan.

## Struktur Folder

````text
root/
├── constants/          # Data statis (Elemen, Tipe Senjata, Rarity, Materials)
├── echoes/             # Data Echo & Index
├── events/             # Data Event & Banner
├── quests/             # Data Lore, Story, & Glossary
├── resonators/         # Data Karakter & Index Utama
├── scripts/            # Script otomatisasi sinkronisasi (Node.js)
├── sonatas/            # Data Set Echo & Index
├── weapons/            # Data Senjata per tipe & Index
├── index.json          # (Legacy/Root) Index karakter utama
└── package.json        # Konfigurasi NPM scripts
````

## Quick Start

### 1. Instalasi Dependensi
Proyek ini hanya membutuhkan **Node.js** (v18+). Tidak ada dependensi eksternal yang berat.

### 2. Sinkronisasi Data
Gunakan perintah berikut untuk memperbarui file `index.json` di masing-masing folder setelah melakukan perubahan pada data mentah:

| Command | Deskripsi | Target |
| :--- | :--- | :--- |
| `npm run rsync` | Sinkronisasi Karakter | `resonators/index.json` |
| `npm run esync` | Sinkronisasi Echo | `echoes/index.json` |
| `npm run wsync` | Sinkronisasi Senjata | `weapons/index.json` |
| `npm run ssync` | Sinkronisasi Sonata | `sonatas/index.json` |

## Panduan Edit Data

### 1. Karakter (Resonators)
- **Lokasi**: `resonators/{id}.json`
- **Format**: JSON Object tunggal.
- **Sinkronisasi**: Jalankan `npm run rsync` setelah edit.
- **Field Penting**: `name`, `element`, `rarity`, `version`, `roles`, `icon`.

### 2. Senjata (Weapons)
- **Lokasi**: `weapons/{type}.json` (contoh: `sword.json`, `broadblade.json`)
- **Format**: Array of Objects.
- **Sinkronisasi**: Jalankan `npm run wsync`.
- **Catatan**: Pastikan `weaponType` sesuai dengan nama file.

### 3. Echo
- **Lokasi**: `echoes/{slug}.json` atau `echoes/echoes.json`
- **Format**: Array of Objects.
- **Sinkronisasi**: Jalankan `npm run esync`.
- **Stats Format**: Gunakan object `{ "cost": 4, "stat": "CR%/CDMG%" }` untuk kemudahan parsing di frontend.

### 4. Sonata
- **Lokasi**: `sonatas/sonatas.json`
- **Format**: Array of Objects.
- **Sinkronisasi**: Jalankan `npm run ssync`.
- **Meta Data**: Pastikan setiap entry memiliki `version` dan `color` hex code.

## Technical Details

### Optimasi Performa
- **Zero Waterfall Load**: File `index.json` di setiap folder hanya berisi metadata ringan (`name`, `image`, `rarity`, dll) untuk loading cepat di halaman list/grid.
- **Pure Array Output**: File index dihasilkan dalam format array murni `[...]` tanpa wrapper object untuk efisiensi parsing JSON.
- **Caching**: Frontend menggunakan strategi caching berbasis timestamp untuk mengurangi request berulang.

### Konvensi Penamaan
- **ID/Slug**: Menggunakan `kebab-case` (contoh: `cartethyia`, `impermanence-heron`).
- **Icon Path**: `/icons/characters/{id}.webp` atau `/icons/items/{name}.webp`.
- **Image Path**: `/characters/{id}.webp` atau `/weapons/{type}/{id}.webp`.

## Kontribusi

1. Fork repository ini.
2. Buat branch fitur baru (`git checkout -b feature/update-char-data`).
3. Lakukan perubahan pada file JSON terkait.
4. Jalankan script sync yang sesuai (misal: `npm run rsync`).
5. Commit dan Push perubahan.
6. Buka Pull Request.

---

**Dikembangkan oleh:** Kinn
