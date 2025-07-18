# 📊 Best Strategies for Smooth Real-time Time Series Chart (T1)

## ✅ Goal
- Show per-second data of T1 over days
- Zoom to second-level granularity
- Scroll smoothly across history
- Show realtime updates via WebSocket
- Keep frontend fast, even with big history

---

## 🟩 1. Load aggregated data first (hour/min)
**Problem solved:**  
- Fast first load; avoid loading millions of points

---

## 🔍 2. Lazy load raw per-second data only for visible window
**Problem solved:**  
- Need second-level detail when user zooms in

---

## 📦 3. Keep only a sliding window of raw data in memory
**Problem solved:**  
- Avoid high memory use when scrolling across days

---

## ⚡ 4. Prefetch & lookahead buffer
**Problem solved:**  
- User scrolls quickly; hides network latency

---

## 🔄 5. Throttle / debounce dataZoom events
**Problem solved:**  
- Prevent CPU overload & too many API calls when user drags fast

---

## 🧰 6. Cancel in-flight API requests
**Problem solved:**  
- Older API responses coming late show wrong data

---

## 🧊 7. Cache already loaded chunks
**Problem solved:**  
- Avoid repeat API calls when scrolling back and forth

---

## 🔧 8. Dynamic granularity switch
**Problem solved:**  
- Avoid slow render when zoomed out; show summary (hour/min)

---

## 📊 9. Realtime right-edge update via WebSocket
**Problem solved:**  
- Keep chart alive with new data every second

---

## ⚡ 10. Progressive rendering & large mode in ECharts
**Problem solved:**  
- Smooth draw, even with large data

Example:
```js
progressive: 5000,
large: true,
largeThreshold: 20000
