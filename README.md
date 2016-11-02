# app-chat-rabbitmq
Simple Chat App using RabbitMq

Design :

- Client berkomunikasi dengan server menggunakan REST API dan mendapatkan notifikasi melalui Socket yang terhubung dengan server secara realtime.
- Terdapat 3 buah exchange yaitu : chat_controller, group_controller dan user_controller. Untuk masing-masing exchange terdapat queue yang bertugas menangani action-action yang berbeda sehingga fungsi dari RabbitMQ pada aplikasi ini adalah sebagai Work Queue (Load Balancer).

- Untuk chat_controller terdapat queue : chat_user dan chat_group.
- Untuk group_controller terdapat queue : group_create, group_invite dan group_kick.
- Untuk user_controller terdapat queue : user_add.

Prerequisite :

- RabbitMQ installed and run on localhost and default port
- MySQL installed and run on localhost and default port
- Import tables.sql (located in root folder) to MySQL
- Node.JS installed

To run :
- npm install
- npm start
- application will be available on localhost:3000
