Dokumentasi Pengujian
Project

Google Keep Clone REST API
Teknologi yang digunakan:

Node.js
Express.js
MySQL (Laragon)
Metode Pengujian

Pengujian pada aplikasi dilakukan menggunakan beberapa alat berikut:

Jest sebagai test runner untuk menjalankan seluruh pengujian secara otomatis.
Supertest untuk melakukan pengujian endpoint REST API melalui HTTP Request dan HTTP Response.
Unit Testing untuk menguji logika program pada layer Controller dan Model.
Jest Mock untuk mensimulasikan database sehingga pengujian tidak mengubah data asli pada MySQL Laragon.
Code Coverage untuk mengukur seberapa besar bagian kode yang telah diuji.
File yang Diuji
1. API Route & Controller Test

File

tests/note.test.js
Skenario Pengujian
1. Pembuatan Catatan dengan Label Dinamis

Memastikan endpoint dapat menerima label yang diketik bebas oleh pengguna kemudian menyimpan data dengan benar.

Expected Result

Status HTTP 201 Created
Data catatan berhasil dibuat.
2. Soft Delete (Move to Trash)

Menguji proses pemindahan catatan ke menu Sampah dengan mengubah nilai is_deleted menjadi 1.

Expected Result

Status HTTP 200 OK
Data berhasil dipindahkan ke Sampah.
3. Search Note

Menguji fitur pencarian catatan menggunakan query parameter.

Expected Result

API mengembalikan daftar catatan yang sesuai dengan kata kunci.
4. Archive Note

Menguji proses pengarsipan catatan.

Expected Result

Nilai is_archived berubah menjadi 1.
Status HTTP 200 OK.
2. Service / Model Test

File

tests/note.service.test.js
tests/note.model.test.js
Skenario Pengujian
1. getAll()

Memastikan fungsi mengambil seluruh data dari database.

Query yang diuji

SELECT * FROM notes;

Expected Result

Mengembalikan data dalam bentuk array.
2. create()

Memastikan proses penyimpanan data berjalan dengan benar.

Query yang diuji

INSERT INTO notes (...);

Expected Result

Data berhasil disimpan.
Mengembalikan nilai insertId.
3. update()

Memastikan proses perubahan isi catatan berjalan sesuai parameter yang diberikan.

Query yang diuji

UPDATE notes
SET ...
WHERE id = ?;

Expected Result

Data berhasil diperbarui.
4. delete()

Memastikan proses penghapusan permanen berjalan dengan benar.

Query yang diuji

DELETE FROM notes
WHERE id = ?;

Expected Result

Mengembalikan nilai true.
Implementasi Mocking

Seluruh koneksi database dimock menggunakan Jest Mock sehingga proses pengujian tidak mengakses database MySQL secara langsung.

Contoh implementasi:

// Mock koneksi database
jest.mock('../src/database/db', () => ({
  query: jest.fn()
}));

// Mock model
jest.mock('../src/models/note.model');

Dengan pendekatan ini:

Pengujian berjalan lebih cepat.
Data database tetap aman.
Hasil pengujian menjadi konsisten.
Hasil Eksekusi Pengujian
Test Summary
Test Suites : 3 passed, 3 total
Tests       : 9 passed, 9 total
Snapshots   : 0 total
Time        : 1.962 s
Ran all test suites.

Seluruh skenario pengujian berhasil dijalankan tanpa adanya kegagalan.

Code Coverage
File	Statements	Branches	Functions	Lines	Uncovered
controllers/note.controller.js	67.5%	50%	50%	67.5%	4-8, 22, 28, 45, 51, 56-61
database/db.js	100%	100%	100%	100%	Tidak ada
models/note.model.js	100%	100%	100%	100%	Tidak ada
Overall Project Coverage
Statements : 76.36%
Branches   : 61.76%
Functions  : 75.00%
Lines      : 76.36%

Kesimpulan:

Berdasarkan hasil pengujian menggunakan Jest, Supertest, dan Mocking, seluruh skenario pengujian berhasil dijalankan dengan tingkat keberhasilan 100% (9 dari 9 pengujian berhasil).

Beberapa hasil yang diperoleh antara lain:
-Seluruh endpoint utama REST API dapat berjalan sesuai fungsi yang diharapkan.
-Modul database (db.js) dan model (note.model.js) memperoleh code coverage 100%, menunjukkan seluruh logika pada kedua modul telah berhasil diuji.
-Fitur label dinamis dapat menerima berbagai variasi input pengguna tanpa menyebabkan kesalahan pada sistem.
-Mekanisme Soft Delete berhasil mengubah status is_deleted sehingga catatan berpindah ke menu Sampah tanpa menghapus data secara permanen.
-Fitur Search Note dan Archive Note juga berjalan sesuai spesifikasi.

Secara keseluruhan, backend Google Keep Clone REST API menunjukkan tingkat stabilitas yang baik dengan seluruh pengujian berhasil dilewati. Meskipun demikian, code coverage pada layer Controller masih sebesar 67,5%, sehingga masih terdapat beberapa kondisi yang belum diuji. Penambahan skenario pengujian pada bagian Controller akan membantu meningkatkan cakupan pengujian dan kualitas aplikasi di masa mendatang.