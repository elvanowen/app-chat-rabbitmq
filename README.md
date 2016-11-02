# app-chat-rabbitmq
Simple Chat App using RabbitMQ

Kelompok :

- Vincent Theophilus Ciputra / 13513005
- Elvan Owen / 13513082


Application Design :

- Client berkomunikasi dengan server menggunakan REST API dan mendapatkan notifikasi melalui Socket yang terhubung dengan server secara realtime.
- Terdapat 3 buah exchange yaitu : chat_controller, group_controller dan user_controller. Untuk masing-masing exchange terdapat queue yang bertugas menangani action-action yang berbeda sehingga fungsi dari RabbitMQ pada aplikasi ini adalah sebagai Work Queue (Load Balancer).

- Untuk chat_controller terdapat queue : chat_user dan chat_group.
- Untuk group_controller terdapat queue : group_create, group_invite dan group_kick.
- Untuk user_controller terdapat queue : user_add.

Petunjuk Instalasi :

1. Prerequisite :
  - RabbitMQ installed and run on localhost and default port
  - MySQL installed and run on localhost and default port
  - Import tables.sql (located in root folder) to MySQL
  - Node.JS installed

2. To run :
  - npm install
  - npm start
  - application will be available on localhost:3000

Daftar Tes yang telah dilakukan :

1. Melakukan registrasi user baru
2. Login ke sistem
3. Menambahkan friend
4. Mengirim pesan ke friend
5. Membuat grup baru
6. Invite friend ke dalam grup yang sudah dibuat
7. Mengirim pesan ke grup
8. Mengeluarkan user dari grup
9. Melihat notifikasi pesan baru

Langkah-langkah melakukan tes :

1. Setelah menjalankan program, buka aplikasi di 3 komputer yang berbeda
2. Pada komputer A, lakukan registrasi dengan username: elvan dan password: elvan
3. Pada komputer B, lakukan registrasi dengan username: vincent dan password: vincent
4. Pada komputer C, lakukan registrasi dengan username: elcent dan password: elcent
5. Lakukan login pada setiap komputer dengan username dan password yang sudah dibuat
6. User elvan menambahkan friend user vincent dengan mengklik tombol + dalam friends panel dan mengetikan vincent lalu klik add
7. Friends panel pada user vincent akan langsung bertambah user elvan dan ada tulisan 'You have been added as friend' sebagai notifikasi
8. User elvan menambahkan friend user elcent dengan mengklik tombol + dalam friends panel dan mengetikan elcent lalu klik add
9. Friends panel pada user elcent akan langsung bertambah user elvan dan ada tulisan 'You have been added as friend' sebagai notifikasi
10. User elvan mengklik user vincent pada friends panel dan akan muncul chat panel
11. User elvan mengirim pesan ke user vincent dengan mengetikan "Hii" dan tekan tombol send atau enter
12. Akan muncul notifikasi pada friends panel di user vincent sesuai jumlah chat yang belum di baca
13. User vincent mengklik user elvan pada friends panel dan akan muncul chat panel
14. Notifikasi pada friends panel akan menghilang
15. User elvan membuat group dengan mengklik tombol + pada group panel dan mengetikan nama group "Group A" dan menekan tombol add
16. Akan muncul pop-up choose user untuk memilih user yang akan diinvite ke dalam grup, isi choose user sesuai dengan user yang ada di friends panel
17. Centang tick-box di sebelah user vincent dan elcent dan tekan tombol pilih
18. User vincent dan elcent akan diinvite ke dalam grup dan akan muncul "Group A" pada group panel masing-masing user dan ada tulisan 'You have been invited to this group' sebagai notifikasi
19. User elcent menekan group "Group A" pada group panel dan akan keluar chat panel
20. User elcent menulis pesan "Hii elvan dan vincent" dan menekan tombol send
21. Akan muncul notifikasi pada user elvan dan vincent di group panel
22. User elvan menekan icon sampah pada chat panel group A dan akan muncul choose user panel
23. Pilih user elcent dan user elcent akan dikeluarkan dari group A
