<div align="center">

<!-- Animated Premium Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=1A1A1A&height=320&section=header&text=NOTELITE&fontSize=95&fontAlignY=38&fontColor=ffffff&animation=fadeIn" width="100%"/>

<br/>

<!-- Modern Tech Logo Showcase -->
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/notelite.png" width="140" style="filter: drop-shadow(0 25px 50px rgba(56, 67, 255, 0.4));" />
</p>

<!-- Dynamic Innovation Typing SVG -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=800&size=34&pause=1000&color=1A1A1A&center=true&vCenter=true&width=600&lines=Bento-Style+Productivity.;SQLite+Persistent+Engine.;Apple+Minimalist+UI.;Analytics+Driven+Workflow." alt="Typing SVG" />

<p align="center">
  <font size="4" color="#64748B">Aplikasi manajemen tugas generasi baru dengan desain <b>Apple-Minimalist</b>. <br/>Keseimbangan antara estetika visual dan performa basis data lokal.</font>
</p>

<br/>

<!-- Modern Tech Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Storage-Local_SQLite-4433FF?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Visual-Reanimated_3-1A1A1A?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

</div>

---

## 💎 Konsep: "Precision in Tasking"
**NoteLite** mendefinisikan ulang cara Anda berinteraksi dengan tugas harian. Fokus kami adalah menghilangkan distraksi visual dan menonjolkan fungsionalitas melalui arsitektur data yang kuat.

- **Bento Stats Grid:** Visualisasi performa instan melalui tata letak kartu Bento yang bersih.
- **Priority Intelligence:** Identifikasi tingkat urgensi tugas secara visual melalui indikator titik dan warna adaptif.
- **Zero Latency Interaction:** Menggunakan SQLite untuk memastikan manajemen tugas berjalan super cepat tanpa memerlukan koneksi internet.

---

## 📊 Analytics & Interactive UI
Visualisasi data produktivitas yang elegan membantu Anda melacak pencapaian harian secara presisi.

<div align="center">
  <br/>
  <!-- Ganti link gambar di bawah ini dengan screenshot aplikasimu jika sudah ada -->
  <img 
    src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/RoutinerShowcase.gif" 
    width="420" 
    style="border-radius: 40px; border: 10px solid #1A1A1A; filter: drop-shadow(0 40px 80px rgba(0,0,0,0.15));"
  />
  <br/><br/>
  <p><i>"Manajemen tugas bukan sekadar teks, ini adalah seni mengatur waktu."</i></p>
</div>

---

## 🚀 Fitur Unggulan NoteLite

| Inovasi | Arsitektur Teknis |
| :--- | :--- |
| **Interactive Analytics** | Modal Statistik dengan kurva animasi Bezier untuk pengalaman "Apple-Feel" yang smooth. |
| **Smart Local Database** | Mesin sinkronisasi data internal menggunakan SQLite untuk persistensi permanen. |
| **Cloud-Ref Reference** | Integrasi Cloudinary API untuk melampirkan referensi gambar pada setiap tugas. |
| **Apple Motion Engine** | Penggunaan sistem interpolasi warna dan gesture handler premium di setiap sentuhan. |

---

## 🛠️ The Power Stack
Teknologi pilihan yang mendukung performa eksklusif NoteLite.

<div align="center">

| Core Framework | Storage & API | Library Pendukung |
| :---: | :---: | :---: |
| `React Native / Expo` | `SQLite Engine` | `Lucide Icons` |
| `TypeScript Strict` | `Cloudinary Image API` | `Reanimated 3` |

</div>

---

## 🏗️ Implementasi Data Persistence
NoteLite memastikan data Anda tidak pernah hilang dengan integrasi query SQLite yang efisien.

```typescript
// Query penambahan tugas secara atomik
const addTaskToEngine = async (title: string, priority: number) => {
  return await db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO tasks (title, priority, is_completed) VALUES (?, ?, ?)',
      [title, priority, 0]
    );
  });
};
```

## 📥 Langkah Pemasangan

Mulai operasikan NoteLite untuk menunjang produktivitas Anda.
```Bash
# 1. Duplikasi Engine
git clone https://github.com/Ranggis/notelite.git

# 2. Pasang Semua Dependensi
npm install

# 3. Eksekusi Environment
npx expo start
```

## 👤 Arsitek Aplikasi

<!-- Card Profiler -->
<div align="center">
<div style="height: 6px; width: 60px; background: #3843FF; border-radius: 10px; margin-bottom: -25px; margin-top: 25px;"></div>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="150" align="center">
<img src="https://raw.githubusercontent.com/Ranggis/Api-Image/main/ranggisss.jpg" width="130" style="border-radius: 30px; border: 3px solid #1A1A1A;" />
</td>
<td style="padding-left: 30px;">
<font size="6" color="#1E293B" face="Inter"><strong>M. Ranggis Refaldi</strong></font><br/>
<font size="3" color="#3843FF" face="Inter"><strong>Senior Lead Developer & Product Designer</strong></font><br/>
<font size="2" color="#94A3B8" face="Inter">Informatics Engineering • Universitas Nusa Putra</font>
<br/><br/>
<div style="display: flex; gap: 8px;">
<a href="https://github.com/Ranggis">
<img src="https://img.shields.io/badge/Github-000?style=for-the-badge&logo=github&logoColor=white" />
</a>
<a href="https://instagram.com/ranggiss">
<img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" />
</a>
</div>
</td>
</tr>
</table>
</div>
</td>
</tr>
</div>
<br/>
<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=1A1A1A&height=100&section=footer" width="100%"/>
<p><i>"Setiap baris kode adalah kontribusi untuk masa depan yang lebih terorganisir."</i></p>
</div>
