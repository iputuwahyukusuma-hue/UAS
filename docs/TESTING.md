Dokumentasi Pengujian
Project

Google Keep Clone REST API

Teknologi yang digunakan:

Node.js
Express.js
MySQL (Laragon)
Metode Pengujian

Pengujian dilakukan menggunakan beberapa tools berikut:

Jest sebagai test runner untuk menjalankan seluruh unit test.
Supertest untuk melakukan pengujian endpoint REST API melalui HTTP Request dan Response.
Unit Testing pada layer Controller, Service, dan Model.
Jest Mock untuk mensimulasikan database sehingga pengujian tidak mengakses database MySQL secara langsung.
Code Coverage untuk mengukur tingkat cakupan pengujian terhadap source code.
File yang Diuji
1. API Route & Controller Test

File

tests/note.test.js
Skenario Pengujian
Membuat catatan baru.
Mengambil seluruh data catatan.
Mengambil detail catatan berdasarkan ID.
Memperbarui isi catatan.
Menghapus catatan.
Memindahkan catatan ke Sampah (Soft Delete).
Mengembalikan catatan dari Sampah.
Mengarsipkan catatan.
Membatalkan arsip catatan.
Pencarian catatan berdasarkan keyword.
Pengelolaan label dinamis pada catatan.
Validasi status HTTP dan response body.
2. Service Test

File

tests/note.service.test.js
Skenario Pengujian
Menguji proses bisnis sebelum data dikirim ke Model.
Memastikan fungsi service memanggil model yang sesuai.
Memastikan data yang dikembalikan sesuai dengan hasil model.
3. Model Test

File

tests/note.model.test.js
Skenario Pengujian
Mengambil seluruh data (SELECT).
Mengambil data berdasarkan ID.
Menambahkan data (INSERT).
Memperbarui data (UPDATE).
Menghapus data (DELETE).
Memindahkan data ke Sampah.
Mengembalikan data dari Sampah.
Mengarsipkan data.
Membatalkan arsip.
Melakukan pencarian data menggunakan query.
4. Database Test

File

tests/db.test.js
Skenario Pengujian
Memastikan modul database berhasil dibuat.
Memastikan koneksi database dapat digunakan oleh Model.
Memastikan konfigurasi database berjalan sesuai kebutuhan aplikasi.
Implementasi Mocking

Seluruh proses akses database dimock menggunakan Jest Mock, sehingga proses pengujian tidak melakukan perubahan terhadap database MySQL Laragon.

Contoh implementasi:

// Mock database
jest.mock('../src/database/db', () => ({
  query: jest.fn()
}));

// Mock model
jest.mock('../src/models/note.model');

Dengan pendekatan ini:

Pengujian berjalan lebih cepat.
Tidak mengubah data asli pada database.
Hasil pengujian menjadi konsisten.
Memudahkan pengujian berbagai skenario tanpa bergantung pada kondisi database.
Hasil Eksekusi Pengujian
Ringkasan Pengujian (Test Summary)
Test Suites : 4 passed, 4 total
Tests       : 62 passed, 62 total
Snapshots   : 0 total
Time        : 1.883 s
Ran all test suites.

Seluruh pengujian berhasil dijalankan tanpa kegagalan (100% berhasil).

Code Coverage
File / Folder	% Statements	% Branches	% Functions	% Lines	Uncovered Line
controllers	97.50%	76.92%	100%	97.50%	Line 45
note.controller.js	97.50%	76.92%	100%	97.50%	Line 45
database	100%	100%	100%	100%	Tidak ada
db.js	100%	100%	100%	100%	Tidak ada
models	100%	100%	100%	100%	Tidak ada
note.model.js	100%	100%	100%	100%	Tidak ada
Overall Project Coverage
Statements : 98.18%
Branches   : 82.35%
Functions  : 100%
Lines      : 98.18%

Kesimpulan

Berdasarkan hasil pengujian, aplikasi Google Keep Clone REST API berhasil melewati seluruh pengujian dengan 4 test suite dan 62 test** yang semuanya berhasil (100%). Hasil code coverage juga sangat baik, yaitu 98,18% untuk *Statements* dan *Lines*, **82,35%** untuk *Branches*, serta **100%** untuk *Functions*. Selain itu, modul database dan model telah mencapai 100% coverage, sehingga dapat disimpulkan bahwa fitur-fitur utama seperti CRUD catatan, pencarian, arsip, restore, soft delete, dan **pengelolaan label berjalan dengan baik. Secara keseluruhan, aplikasi memiliki tingkat stabilitas dan kualitas yang tinggi sehingga layak untuk digunakan.
