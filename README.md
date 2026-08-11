# Dokumentasi Data API WuWa

**Versi 3.0.0** | **Terakhir Diperbarui: Agustus 2026**

---

## 📖 Tentang Proyek Ini

Ini adalah repositori data untuk game **Wuthering Waves**, berisi kumpulan data lengkap yang disusun secara terstruktur untuk memudahkan pengembangan aplikasi, situs web, atau alat analisis.

Data diambil dari **API Encore** dan diolah ke dalam bahasa indonesia dengan format JSON yang mudah digunakan.

**Tujuan utama:**
- Menyediakan data karakter, senjata, echo, dan lainnya dalam satu tempat.
- Memudahkan akses data dengan struktur folder yang rapi.
- Mendukung pengembangan aplikasi berbasis data WuWa.

---

## 📁 Struktur Folder

```
wuwa-data/
├── resonators/        # Data utama karakter
├── builds/            # Data build karakter (echo, weapon, teams)
├── lores/             # Data lore karakter (cerita, item, deskripsi)
├── weapons/           # Data senjata
├── echoes/            # Data echo
├── sonatas/           # Data set echo (sonata)
├── teams/             # Data tim/rekomendasi komposisi
├── constants/         # File konstanta (role, element, dll)
└── scripts/           # Script utilitas untuk sync data
```

---

## 🗂️ Detail Setiap Folder

### 1. `resonators/` - Data Karakter Utama

Berisi file JSON untuk setiap karakter dengan data ringan (tanpa build & lore).

**Contoh struktur:**
```json
{
  "id": 1403,
  "name": "Aalto",
  "element": 4,
  "rarity": 4,
  "weapon": 3,
  "version": "1.0",
  "lastUpdated": "2026-02-07",
  "roles": [16, 3],
  "sonatas": [8, 4],
  "faction": "Black Shores",
  "affiliation": "The Black Shores",
  "class": "Congenital",
  "image": "/characters/aalto.webp",
  "icon": "/icons/characters/aalto.webp",
  "skills": {...},
  "materials": {...},
  "sequences": [...],
  "favorRole": {...}
}
```

**Field penting:**
- `id` → ID unik dari Encore
- `element` → ID element (1=Glacio, 2=Fusion, 3=Electro, 4=Aero, 5=Spectro, 6=Havoc)
- `weapon` → ID tipe senjata (1=Broadblade, 2=Sword, 3=Pistols, 4=Gauntlets, 5=Rectifier)
- `roles` → Array ID role (lihat `constants/combatRoles.json`)
- `sonatas` → Array ID sonata (lihat `sonatas/index.json`)

---

### 2. `builds/` - Data Build Karakter

Berisi rekomendasi build untuk setiap karakter.

**Contoh struktur:**
```json
{
  "id": 1403,
  "name": "Aalto",
  "recommendedStats": {
    "ATK": "1700+",
    "Energy Regen": "130-140"
  },
  "build": {
    "bestWeapon": "The Last Dance",
    "echoDetails": {...},
    "teams": ["jiyan-hypercarry", "aalto-hypercarry"]
  },
  "analysisCharts": [...]
}
```

**Catatan:** `teams` berisi ID dari `teams/index.json` (bukan duplikasi data).

---

### 3. `lores/` - Data Lore Karakter

Berisi cerita, deskripsi, item, dan laporan karakter.

**Contoh struktur:**
```json
{
  "id": 1403,
  "name": "Aalto",
  "lore": {
    "description": "Aalto adalah seorang Information Broker...",
    "stories": [...],
    "items": [...],
    "specialFood": {...}
  }
}
```

---

### 4. `weapons/` - Data Senjata

Berisi data semua senjata yang tersedia.

**File:**
- `index.json` → Daftar semua senjata
- `sword.json`, `broadblade.json`, dll → Detail per tipe

**Contoh struktur:**
```json
{
  "id": 21020096,
  "name": "Azure Oath",
  "weaponType": 2,
  "rarity": 5,
  "image": "/weapons/sword/azure-oath.webp",
  "subStat": "CRIT Rate",
  "stats": {...}
}
```

---

### 5. `echoes/` - Data Echo

Berisi data echo yang bisa digunakan karakter.

**File:**
- `index.json` → Daftar ringkas echo
- `echoes.json` → Detail lengkap echo

**Contoh struktur:**
```json
{
  "id": 390080005,
  "name": "Bell-Borne Geochelone",
  "sonatas": [7, 8],
  "cost": 4,
  "rarity": 3,
  "elementId": 1,
  "image": "/echoes/bell-borne-geochelone.webp"
}
```

---

### 6. `sonatas/` - Data Set Echo (Sonata)

Berisi data set echo (2-piece / 5-piece bonus).

**File:** `index.json`

**Contoh struktur:**
```json
{
  "id": 8,
  "name": "Moonlit Clouds",
  "slug": "moonlit-clouds",
  "image": "/icons/sonatas/mc.webp",
  "version": "3.0",
  "color": "#686868"
}
```

---

### 7. `teams/` - Data Komposisi Tim

Berisi rekomendasi komposisi tim untuk berbagai karakter.

**File:** `index.json`

**Contoh struktur:**
```json
{
  "id": "jiyan-hypercarry",
  "name": "Jiyan Hypercarry",
  "members": ["Jiyan", "Aalto", "Shorekeeper", "Verina"],
  "note": "Aalto memberikan 23% Aero DMG Amplify...",
  "characterId": 1404,
  "characterName": "Jiyan"
}
```

---

### 8. `constants/` - File Konstanta

Berisi data referensi untuk mapping ID ke nama.

**File:**
- `combatRoles.json` → Mapping role ID ke nama
- `elements.json` → Mapping element ID ke nama
- `weapons.json` → Mapping weapon type ID ke nama
- `rarity.json` → Mapping rarity ID ke label

---


## 🗺️ Mapping Data

### Element ID
| ID  | Nama    |
| --- | ------- |
| 1   | Glacio  |
| 2   | Fusion  |
| 3   | Electro |
| 4   | Aero    |
| 5   | Spectro |
| 6   | Havoc   |

### Weapon Type ID
| ID  | Nama       |
| --- | ---------- |
| 1   | Broadblade |
| 2   | Sword      |
| 3   | Pistols    |
| 4   | Gauntlets  |
| 5   | Rectifier  |

### Rarity
| ID  | Label |
| --- | ----- |
| 4   | 4★    |
| 5   | 5★    |

---

## 📦 Cara Menggunakan Data

### Contoh 1: Mengambil data karakter

```javascript
const aalto = require('./resonators/aalto.json');
console.log(aalto.name); // "Aalto"
console.log(aalto.element); // 4 (Aero)
```

### Contoh 2: Mengambil build karakter

```javascript
const aaltoBuild = require('./builds/aalto.json');
console.log(aaltoBuild.build.bestWeapon); // "The Last Dance"
```

### Contoh 3: Mengambil team rekomendasi

```javascript
const teams = require('./teams/index.json');
const jiyanTeams = teams.filter(t => t.characterId === 1404);
console.log(jiyanTeams[0].name); // "Jiyan Hypercarry"
```

### Contoh 4: Mapping role ID ke nama

```javascript
const roles = require('./constants/combatRoles.json');
const roleMap = {};
roles.forEach(r => roleMap[r.id] = r.name);
console.log(roleMap[16]); // "Aero DMG Amplification"
```

---

## 🔗 Sumber Data

Data diambil dari:

- **Encore API** - [https://api-v2.encore.moe/api](https://api-v2.encore.moe/api)
- **Dokumentasi API** - [https://api-v2.encore.moe/_docs/scalar](https://api-v2.encore.moe/_docs/scalar)

---

## 📝 Catatan Versi

| Versi | Tanggal      | Perubahan                                                                                                        |
| ----- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| 3.0.0 | Agustus 2026 | - Restrukturisasi folder<br>- Pemisahan build, lore, teams<br>- Penambahan ID mapping<br>- Sinkronisasi otomatis |
| 2.0.0 | -            | - Penambahan data echoes<br>- Penambahan data sonatas                                                            |
| 1.0.0 | -            | - Initial release<br>- Data karakter dan senjata                                                                 |

---

## 📄 Lisensi

Data ini bersumber dari game **Wuthering Waves** dan API **Encore**. Gunakan untuk keperluan non-komersial dan edukasi.

---

**Dibuat dengan ❤️ untuk komunitas Wuthering Waves**