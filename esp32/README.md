# Connect your ESP32 firmware

We are using the **JC3248W535EN** ESP32-S3 touchscreen board. This is a **conceptual guide, not compilable firmware** for a PlatformIO / ESP-IDF project using LVGL. It does not assume a particular touchscreen driver or WebSocket library.

## Touchscreen connection settings

The intended firmware should provide a settings screen with an on-screen keyboard so you can enter the computer's local IP address directly on the touchscreen. You should also be able to enter a Wi-Fi network name (SSID) and password and connect to a different Wi-Fi network whenever needed, without editing or reflashing the firmware.

Keep these settings accessible after connecting. When you apply new settings, the firmware should close the existing WebSocket connection, reconnect Wi-Fi if the network changed, and connect to the selected server IP and port. After switching networks, make sure the computer and board are on the same Wi-Fi network and update the computer's IP address on the touchscreen if it changed.

This repository does not include the device firmware or touchscreen settings UI; these are requirements for the firmware you build using this guide.

## Four settings

Firmware means the program running on the board. Once the touchscreen settings screen is implemented, these are the values you enter there:

| Setting | What to enter | Example |
| --- | --- | --- |
| Wi-Fi name (SSID) | The network name you choose on your computer | `MyWiFi` |
| Wi-Fi password | The password for that network | Your actual Wi-Fi password |
| Server IP | The computer's local IPv4 address, without `ws://` or a port | `192.168.1.10` |
| Server port | The number used by the message server | `8080` |

The examples below are for the person writing the board's firmware. They explain the logic and cannot be uploaded to the board as a working program.

```cpp
const char* WIFI_NAME = "MyWiFi";             // Wi-Fi network name (SSID)
const char* WIFI_PASSWORD = "password";      // Wi-Fi password
const char* WEBSOCKET_SERVER = "192.168.1.10"; // Computer's local IP, not localhost
const int WEBSOCKET_PORT = 8080;             // Node server port
```

These constants only illustrate the four connection values. In the device firmware, use editable settings populated from the touchscreen instead of hardcoded credentials and IP addresses. Connect to `ws://192.168.1.10:8080/`, with path `/`, substituting your selected IP and port. The computer and ESP32 should use the same Wi-Fi network.

## Conceptual flow (pseudocode)

The names below illustrate events. They are not APIs you can paste into ESP-IDF.

```cpp
onWiFiConnected() {
    websocket.connect(WEBSOCKET_SERVER, WEBSOCKET_PORT, "/");
}

onWebSocketConnected() {
    // Always identify first, including after a reconnect.
    websocket.send("ESP32_CONNECTED");
    websocket.send("Hello computer");
}

onWebSocketMessage(message) {
    // Queue the received text for the display task.
    displayMessageQueue.push(message);
    websocket.send("Message received");
}

inDisplayTask() {
    // Update an LVGL label using your project's normal LVGL task/locking rules.
    showOnScreen(displayMessageQueue.pop());
}

onWebSocketDisconnected() {
    // Schedule a reconnect after a short delay when Wi-Fi is available.
    scheduleReconnect();
}
```

Use your firmware library’s real connection and data callbacks. Handle incoming text length and reassemble fragmented messages before displaying them; WebSocket callbacks do not always contain an entire message. Use the library's ping/pong support so the server can detect lost Wi-Fi. Avoid updating LVGL directly from a networking task unless your project’s LVGL locking rules allow it.

The server sends **plain UTF-8 text** to the device, without a JSON wrapper. The first device frame must be `ESP32_CONNECTED`; later frames can be any non-empty text. Messages are limited to 8 KiB on the server; the website input allows up to 1,000 characters. Device text must be sent as WebSocket text frames, not binary frames. If the board sends JSON text, the website displays that text unchanged.

Only one ESP32 can connect at a time. Disconnect the old device before trying another. The browser must be connected when the device sends a reply: this server does not store messages for later delivery.

Arabic text can travel through the connection as UTF-8. Rendering Arabic on the device screen additionally depends on your firmware's font and text shaping support. Browser Arabic support does not configure the device display.

## شرح بالعربية

هذا مثال توضيحي **غير قابل للترجمة البرمجية مباشرةً**. استخدم دوال مكتبة WebSocket الموجودة في مشروع الجهاز.

- نستخدم لوحة **JC3248W535EN** المزودة بشاشة لمس. يجب أن يتيح برنامج الجهاز إدخال عنوان IP المحلي للحاسوب واسم شبكة Wi-Fi وكلمة مرورها من خلال لوحة مفاتيح على الشاشة، مع المنفذ `8080` افتراضيًا.
- يمكنك تغيير الشبكة عند الحاجة من شاشة الإعدادات دون تعديل البرنامج أو إعادة تحميله على الجهاز. بعد التغيير، تأكد من اتصال الحاسوب واللوحة بالشبكة نفسها وحدّث عنوان IP إذا تغيّر.
- هذه متطلبات لبرنامج الجهاز؛ المستودع لا يتضمن تنفيذ البرنامج أو واجهة إعدادات شاشة اللمس.
- عند نجاح كل اتصال أرسل `ESP32_CONNECTED` أولًا، ثم يمكنك إرسال `Hello computer`.
- النص القادم من الموقع نص UTF-8 عادي، ولا يحتاج إلى تحليل JSON.
- مرّر النص المستلم إلى مهمة العرض لتحديث شاشة LVGL وفق قواعد مشروعك.
- أعد الاتصال بعد انقطاع Wi-Fi، ثم أرسل تعريف الجهاز مجددًا.
- تحقق من Serial Monitor عند حدوث مشكلة. عرض العربية على شاشة الجهاز يحتاج أيضًا إلى خط ودعم عرض مناسبين في برنامج الشاشة.
