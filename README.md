In our scenario, chairs and tables can be ordered through a system. Users can register by entering their usernames and passwords, and they can perform their operations within the application by using a JWT token.
Table production takes 25 seconds and there are 5 units in stock. Chair production takes 10 seconds and there are 20 units in stock. For ease of testing, the stocks are defined statically. If desired, the resetStock line can be removed from order-queue-backend/src/products/product.service.ts.
The created users appear in the database as shown below. For our test scenario, we will use the user-vip and user-regular users.
<img width="619" height="322" alt="resim" src="https://github.com/user-attachments/assets/ea3ed3fe-1fa3-47fc-8463-018229d3ddaa" />


Additionally, the products section is stored in the database in the following format.

<img width="449" height="348" alt="resim" src="https://github.com/user-attachments/assets/6e3da5fa-7b6c-401d-b731-911c729ad4d7" />


We can log in with the user-regular account and place orders. While the order currently being processed appears in the top right corner, the queued orders are displayed in the waiting section.

<img width="846" height="541" alt="resim" src="https://github.com/user-attachments/assets/24e82f0f-bb43-44dc-b314-baef692b8e1e" />


When an order is placed and completed, we can see its output in the console.

<img width="949" height="72" alt="resim" src="https://github.com/user-attachments/assets/2c6bc706-519c-4e04-81c0-ab766b4eca80" />


Lets log in as user-regular and place orders. Some of our orders should be completed, while others should still be in progress.

 

<img width="1366" height="616" alt="resim" src="https://github.com/user-attachments/assets/fd30d880-0ff2-4ef9-94dd-71cbb28a8350" />



Now lets log out and log in as user-vip. We can view the orders placed by user-regular as well as the live queue.

<img width="1365" height="638" alt="resim" src="https://github.com/user-attachments/assets/f33dd7a0-2632-47d8-b5a1-53ada036d214" />


When user-vip places an order, it moves ahead of all pending orders in the queue, but it must wait for the currently processing order to be completed.

<img width="1363" height="649" alt="resim" src="https://github.com/user-attachments/assets/5631c29b-3c55-4cf9-b2ab-30e1152f1c7c" />


Once the order being processed for user-regular is completed, the order placed by user-vip begins processing.

<img width="1365" height="783" alt="resim" src="https://github.com/user-attachments/assets/e3302479-8e07-4a3d-b6a4-c22639f9a499" />


When we log out and then log in as user-regular, we see that user-vip has moved our orders to the pending state and that their own orders are being processed.

<img width="1359" height="697" alt="resim" src="https://github.com/user-attachments/assets/e4abf25a-9bab-4069-abe4-6ca29a8b0258" />


All order operations are performed atomically. At most one order can be processed at a time, and no new orders can be placed once the stock is depleted.

<img width="1250" height="713" alt="resim" src="https://github.com/user-attachments/assets/fe3e4a5b-568d-4dc5-8c6d-c6b9d410011a" />


These orders appear in our database as shown below.

<img width="951" height="776" alt="resim" src="https://github.com/user-attachments/assets/2184ceb0-0467-4424-9630-500e2f5cc76d" />


As you can see, even if non-VIP orders were created earlier, they are evaluated based on BullMQ priority, and VIP orders are placed ahead of non-VIP ones.

