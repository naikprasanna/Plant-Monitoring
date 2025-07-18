# 📊 Real-time Temperature Chart (T1) — Full Design & Implementation Guide

## ✅ Goal

* Show per-second temperature data (T1) over multiple days
* Allow smooth zoom into second-level granularity
* Support fast scrolling left/right without lag
* Show realtime updates every second from WebSocket
* Must feel as smooth as a stock/crypto chart

Tech stack: **React + Apache ECharts**

---

## ⚙️ **Project context**

* Historical data via API:

  ```
  GET /api/t1/history?from&to&granularity=second|minute|hour
  ```
* Realtime data via WebSocket: one new data point every second
* User can scroll or zoom quickly
* Need to combine historical + live data and keep UI fast

---

# ✅ Step by step: strategies, what to do & why

---

## 🟩 1️⃣ Load aggregated data first

* On component mount, call:

  ```
  GET /api/t1/history?from=...&to=...&granularity=hour
  ```
* Store response in `aggData` state
* Render immediately in chart

✅ **Problem solved:**

* Avoids loading millions of points on first load
* Fast first render

---

## 🔍 2️⃣ Lazy load raw per-second data on zoom

* Listen to `dataZoom` event from ECharts
* Detect visible window: `[startValue, endValue]`
* If window ≤ e.g., 2 hours:

  ```
  GET /api/t1/history?from=startValue&to=endValue&granularity=second
  ```
* Store result in `rawData` state
* Switch chart to show rawData

✅ **Problem solved:**

* Only load high-resolution data when user zooms in
* Keeps frontend fast

---

## 📦 3️⃣ Keep sliding window of raw data

* Only keep rawData for visible window + buffer (e.g., ±10min)
* Drop rawData outside this range
* Always keep `aggData` for the full history

✅ **Problem solved:**

* Prevents memory bloat
* Keeps JS heap small

---

## ⚡ 4️⃣ Prefetch next chunk

* Detect scroll direction
* Prefetch next or previous 5–10min of raw per-second data before user actually scrolls into it
* Store in cache

✅ **Problem solved:**

* Hides network latency
* Keeps scroll smooth

---

## 🔄 5️⃣ Throttle & debounce zoom events

* Throttle `dataZoom`:

  ```js
  throttle(handleZoom, 200)
  ```
* Prevents API call on every small scroll move

✅ **Problem solved:**

* Avoids CPU spike and flooding API

---

## 🧰 6️⃣ Cancel in-flight API requests

* Use `AbortController`
* Before making a new request, cancel any running one

✅ **Problem solved:**

* Older, slower API calls don't overwrite newer data

---

## 🧊 7️⃣ Cache loaded chunks

* Use a simple cache:

  ```js
  const cache = new Map()
  ```
* Check cache before making an API call

✅ **Problem solved:**

* Avoids repeat API calls when scrolling back & forth over same range

---

## 🔧 8️⃣ Dynamic granularity switch

* Zoomed out → show hourly data
* Zoomed in → minute data
* Fully zoomed → second-level data

✅ **Problem solved:**

* Avoids drawing too many points when zoomed out
* Keeps render fast

---

## 📊 9️⃣ Realtime right-edge update via WebSocket

* Connect WebSocket:

  ```
  ws.onmessage → add new point
  ```
* If user is at "now", append point to visible data
* If scrolled back, keep new points in `liveBuffer`

✅ **Problem solved:**

* Chart stays live
* Doesn't force-scroll if user is exploring old data

---

## ⚡ 🔟 Progressive & large mode in ECharts

Use in series config:

```js
progressive: 5000,
large: true,
largeThreshold: 20000
```

✅ **Problem solved:**

* Smooth rendering, even with thousands of points

---

## 🧪 11️⃣ Batch API calls when user scrolls fast

* Detect very quick scroll across multiple unloaded ranges
* Instead of many small requests, combine into a single larger call:

  ```
  GET /api/t1/history?from=A&to=B
  ```

✅ **Problem solved:**

* Avoids flooding backend
* Keeps UI smooth

---

## ⚙️ 12️⃣ (Optional) Web Worker

* Use Web Worker to slice/filter big arrays in rawData
* UI stays responsive

✅ **Problem solved:**

* Prevents UI freeze on large data operations

---

# 📐 **Architecture diagram (text)**

```
Frontend (React)
  └─ T1RealTimeChart component
       ├─ aggData (hour/min)
       ├─ rawData (second-level)
       ├─ cache (Map)
       ├─ liveBuffer (new points)
       ├─ prefetch logic
       ├─ throttle dataZoom
       ├─ cancel in-flight requests
       └─ progressive rendering with ECharts
  │
  ├─ API: /api/t1/history
  └─ WebSocket: new data point per second
```

---

# ⚛️ **React component structure**

```jsx
function T1RealTimeChart() {
  // State:
  // - aggData: aggregated data
  // - rawData: detailed per-second data
  // - cache: loaded chunks
  // - liveBuffer: new realtime points
  // - abortController: cancel old requests
  // - wsRef: WebSocket ref

  // On mount:
  // - load aggregated data
  // - start WebSocket connection

  // On zoom/scroll:
  // - throttle events
  // - detect visible window & granularity
  // - check cache → fetch rawData if needed
  // - cancel older requests
  // - prefetch next chunk

  // On WebSocket message:
  // - add point to liveBuffer
  // - if user at "now", append to visible data

  // On unmount:
  // - close WebSocket
  // - abort in-flight request

  // Render <EChartsReact /> with progressive & large mode
}
```

---

# 🧰 **Why this works (summary)**

| Strategy                 | Problem solved                                  |
| ------------------------ | ----------------------------------------------- |
| Load aggData first       | Fast first load                                 |
| Lazy load rawData        | Only load detail when needed                    |
| Sliding window buffer    | Low memory usage                                |
| Prefetch next chunk      | Hide network latency                            |
| Throttle events          | Avoid CPU/network flood                         |
| Cancel in-flight         | Prevent outdated data showing                   |
| Cache                    | Avoid repeat requests                           |
| Dynamic granularity      | Always fast render                              |
| LiveBuffer + WebSocket   | Chart stays live                                |
| Progressive & large mode | Smooth big data                                 |
| Batch calls              | Avoid backend overload on fast scroll           |
| Web Worker               | Keep UI thread smooth when filtering big arrays |

---

# ✅ **Done!**

* Fast initial load
* Smooth zoom & scroll
* Live updates
* Handles crazy fast scroll
* Scalable to days/weeks of data

---

## ✨ **Next steps (optional):**

* Implement backend API & DB design
* Add unit tests & loading indicators
* Add error handling & UX polish

## 🚀 **Want full code?**

If you'd like, ask:
**"Show me the full React + backend code next"**
and I'll build it, copy-paste ready!

```}
```
