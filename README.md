In our scenario, chairs and tables can be ordered through a system. Users can register by entering their usernames and passwords, and they can perform their operations within the application by using a JWT token.
Table production takes 25 seconds and there are 5 units in stock. Chair production takes 10 seconds and there are 20 units in stock. For ease of testing, the stocks are defined statically. If desired, the resetStock line can be removed from order-queue-backend/src/products/product.service.ts.
The created users appear in the database as shown below. For our test scenario, we will use the user-vip and user-regular users.
![image.png](attachment:8c106375-3825-4875-9f4d-18d3afab1401:image.png)

Additionally, the products section is stored in the database in the following format.

![image.png](attachment:55959aea-82cc-4439-a170-47a1ec77e1db:image.png)

We can log in with the user-regular account and place orders. While the order currently being processed appears in the top right corner, the queued orders are displayed in the waiting section.

![image.png](attachment:27eb3f14-4963-4466-822c-01feb696410f:image.png)

bir sipariş verildiğinde ve tamamlandığında çıktısını konsolumuzda görebilmekteyiz. 

![image.png](attachment:e902f28c-e862-4359-b19d-506844d72c04:image.png)

Lets log in as user-regular and place orders. Some of our orders should be completed, while others should still be in progress.

 

![Ekran görüntüsü 2025-12-28 163839.png](attachment:252381d8-6230-4ba6-bbbb-146232453e1c:Ekran_grnts_2025-12-28_163839.png)

Now lets log out and log in as user-vip. We can view the orders placed by user-regular as well as the live queue.

![Ekran görüntüsü 2025-12-28 163854.png](attachment:db38674e-da6e-4675-b90c-f29940257592:Ekran_grnts_2025-12-28_163854.png)

When user-vip places an order, it moves ahead of all pending orders in the queue, but it must wait for the currently processing order to be completed.

![Ekran görüntüsü 2025-12-28 163901.png](attachment:99d97979-3e6e-4a69-ab34-f9133ce3a2dc:Ekran_grnts_2025-12-28_163901.png)

Once the order being processed for user-regular is completed, the order placed by user-vip begins processing.

![Ekran görüntüsü 2025-12-28 163906.png](attachment:2d94447a-df0e-4ccd-a2f4-7df4d373c803:Ekran_grnts_2025-12-28_163906.png)

When we log out and then log in as user-regular, we see that user-vip has moved our orders to the pending state and that their own orders are being processed.

![Ekran görüntüsü 2025-12-28 163930.png](attachment:39327a94-bdfb-44d9-918f-ed0cbc79c19c:Ekran_grnts_2025-12-28_163930.png)

All order operations are performed atomically. At most one order can be processed at a time, and no new orders can be placed once the stock is depleted.

![image.png](attachment:65490f3e-05ee-4334-9edc-7dcd16c6f210:image.png)

These orders appear in our database as shown below.

![Ekran görüntüsü 2025-12-28 163953.png](attachment:5f41fada-485d-4077-9060-57afd4517b94:Ekran_grnts_2025-12-28_163953.png)

As you can see, even if non-VIP orders were created earlier, they are evaluated based on BullMQ priority, and VIP orders are placed ahead of non-VIP ones.
