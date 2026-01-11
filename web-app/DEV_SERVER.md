# Dev Server Management

## Quick Start

### Start the dev server:
```bash
cd web-app
./dev.sh
```

Server sẽ chạy tại: **http://localhost:5173**

### Start in background (daemon mode):
```bash
cd web-app
nohup bash dev.sh > /tmp/vite-dev.log 2>&1 < /dev/null &
```

### Stop the dev server:
```bash
cd web-app
./stop.sh
```

### View logs (nếu chạy background):
```bash
tail -f /tmp/vite-dev.log
```

---

## Giải pháp cho lỗi "can't connect to localhost:5173"

### 🔧 Scripts đã tạo:

1. **`web-app/dev.sh`** - Script khởi động dev server
   - Tự động kill process cũ trên port 5173
   - Force port 5173 (không cho Vite đổi port)
   - Chạy được cả foreground và background

2. **`web-app/stop.sh`** - Script dừng dev server
   - Kill gracefully hoặc force kill nếu cần
   - Đảm bảo port 5173 được giải phóng

3. **`scripts/run-dev.sh`** - Auto-restart script
   - Tự động restart khi server crash
   - Có cleanup trap khi Ctrl+C

### 🎯 Cách dùng hàng ngày:

**Option 1: Chạy trong terminal riêng (khuyên dùng)**
```bash
cd web-app
./dev.sh
```
Giữ terminal này mở, HMR sẽ hoạt động tự động.

**Option 2: Chạy background**
```bash
cd web-app
nohup bash dev.sh > /tmp/vite-dev.log 2>&1 < /dev/null &
```
Server chạy nền, xem log bằng: `tail -f /tmp/vite-dev.log`

**Option 3: Dùng VS Code Task**
- Press `Cmd+Shift+P`
- Chọn `Tasks: Run Task`
- Chọn `Run web-app dev server`

### 🚨 Khi gặp lỗi kết nối:

1. **Kill tất cả process:**
   ```bash
   cd web-app
   ./stop.sh
   ```

2. **Start lại:**
   ```bash
   ./dev.sh
   ```

3. **Hoặc one-liner:**
   ```bash
   cd web-app && ./stop.sh && ./dev.sh
   ```

### 💡 Tips:

- **Luôn dùng `./dev.sh`** thay vì `pnpm dev` để tránh conflict port
- **Mở dedicated terminal** cho dev server thay vì chạy background
- **Không Ctrl+Z** (suspend) process - dùng Ctrl+C để stop
- **Check status:**
  ```bash
  lsof -iTCP:5173 -sTCP:LISTEN
  ```

### 🔍 Debug:

**Check port:**
```bash
lsof -iTCP:5173 -sTCP:LISTEN
```

**Check process:**
```bash
ps aux | grep vite
```

**View logs realtime:**
```bash
tail -f /tmp/vite-dev.log
```

---

## Tại sao lỗi thường xảy ra?

1. **Background process bị suspend (Ctrl+Z)** → dùng Ctrl+C thay vì
2. **Multiple pnpm dev chạy cùng lúc** → dev.sh tự động cleanup
3. **Port conflict** → dev.sh force port 5173
4. **Terminal job control** → dùng nohup hoặc dedicated terminal
