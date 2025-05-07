# API TOKO BEKAS ONLINE

link API:
`http`

### Alur:

1. login dan registrasi akun terlebih dahulu
2. Token JWT akan dikirim melalui response setelah login
3. Token JWT akan digunakan di Headers (Bearer Token) agar bisa mengakses API (toko barang bekas)

### Documentasi Endpoint:

- `/api/login` - untuk login
- `/api/register` - untuk registrasi
- `/api/produk` - mengambil semua data produk
- `/api/produk` - untuk menambahkan data produk
- `/api/produk/{id}` - menampilkan produk sesuai id
- `/api/transaksi` - menampilkan transaksi
- `/api/transaksi` - manambahkan transaksi sesuai barang dan user dan ada
- `/api/transaksi/{id}` - menampilkan transaksi sesuai id

### Endpoint untuk UI:

- `/login` - untuk login
- `/registrasi` - untuk regitrasi
- `/dashboard` - untuk mengambil token jwt dan lainnya
