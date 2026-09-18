# Connect your ESP32 firmware

This is a **conceptual guide, not compilable firmware**. It does not assume a particular touchscreen driver or WebSocket library. It can guide a PlatformIO / ESP-IDF project using an ESP32-S3, LVGL, and a JC3248W535EN touchscreen.

## Four settings

```cpp
const char* WIFI_NAME = "MyWiFi";               // Wi-Fi SSID
const char* WIFI_PASSWORD = "password";        // Keep this in your firmware project
const char* WEBSOCKET_SERVER = "192.168.1.10"; // Computer's local IP, not localhost
const int WEBSOCKET_PORT = 8080;               // Node server port
```

Use your real values. Connect to `ws://192.168.1.10:8080/`, with path `/`. The computer and ESP32 should use the same Wi-Fi network.

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

- اضبط اسم شبكة Wi-Fi وكلمة مرورها وعنوان IP المحلي للحاسوب والمنفذ `8080`.
- عند نجاح كل اتصال أرسل `ESP32_CONNECTED` أولًا، ثم يمكنك إرسال `Hello computer`.
- النص القادم من الموقع نص UTF-8 عادي، ولا يحتاج إلى تحليل JSON.
- مرّر النص المستلم إلى مهمة العرض لتحديث شاشة LVGL وفق قواعد مشروعك.
- أعد الاتصال بعد انقطاع Wi-Fi، ثم أرسل تعريف الجهاز مجددًا.
- تحقق من Serial Monitor عند حدوث مشكلة. عرض العربية على شاشة الجهاز يحتاج أيضًا إلى خط ودعم عرض مناسبين في برنامج الشاشة.
