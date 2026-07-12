# Dokumentasi Pengujian

## Project
Google Keep Clone REST API

## Metode Pengujian

Pengujian dilakukan menggunakan:

- Jest
- Unit Testing
- Mocking (Jest Mock)
- Code Coverage

Database tidak digunakan secara langsung saat pengujian karena seluruh Model dimock menggunakan `jest.mock()`.

---

# File yang diuji

## Note Controller

File:

```
controllers/noteController.js
```

Skenario pengujian:

- Mengambil seluruh note
- Mengambil note berdasarkan ID
- Membuat note
- Update note
- Arsipkan note
- Trash note
- Restore note
- Delete permanen
- Pin note
- Search note
- Reminder
- Menambahkan label
- Menghapus label

Total test:

12+ skenario

---

## Label Controller

File:

```
controllers/labelController.js
```

Skenario pengujian:

- Mengambil seluruh label
- Mengambil label berdasarkan ID
- Membuat label
- Update label
- Delete label

Total test:

5 skenario

---

# Mocking

Seluruh Model dimock menggunakan Jest.

Contoh:

```javascript
jest.mock("../models/noteModel");
jest.mock("../models/labelModel");
```

Dengan demikian pengujian hanya memverifikasi logika pada Controller tanpa mengakses database.

---

# Menjalankan Testing

Install dependency

```bash
npm install
```

Menjalankan seluruh test

```bash
npm test
```

Menjalankan test beserta coverage

```bash
npm test -- --coverage
```

---

# Hasil Pengujian

Test Suite

```
PASS test/noteController.test.js
PASS test/labelController.test.js
```

Total

```
Test Suites : 2 passed
Tests       : 29 passed
```

Coverage Controller

| File | Coverage |
|------|---------|
| noteController.js | ±72% |
| labelController.js | ±85% |

Coverage keseluruhan project

```
Statements : 66%
Branches   : 75%
Functions  : 43%
Lines      : 66%
```

---

# Kesimpulan

Seluruh endpoint utama berhasil diuji menggunakan Unit Testing dengan Jest.

Pengujian berhasil memastikan bahwa:

- Controller dapat mengembalikan response yang benar.
- Validasi input berjalan dengan baik.
- Error handling berjalan sesuai harapan.
- Model berhasil dimock sehingga pengujian tidak bergantung pada database.  tolong buat seperti ini rapi dengan ketikan semua dan tidak ada seperti tabel gitu