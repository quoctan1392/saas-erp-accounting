# Cách khắc phục Vite server bị crash thường xuyên

## Nguyên nhân

1. **Node.js hết bộ nhớ** - Default heap size quá nhỏ
2. **File watchers limit** - macOS giới hạn số file theo dõi
3. **Port conflict** - Process zombie chiếm port 5173
4. **HMR overload** - Quá nhiều file thay đổi cùng lúc

## Giải pháp nhanh

### Cách 1: Dùng script tự động restart (KHUYẾN NGHỊ)

```bash
cd web-app
./start-dev.sh
```

Script này sẽ:
- ✅ Tự động kill process cũ
- ✅ Tăng memory limit lên 4GB
- ✅ Auto-restart khi crash (tối đa 3 lần)
- ✅ Log đầy đủ vào `vite.log`

### Cách 2: Tăng giới hạn file watchers (KHUYÊN DÙNG)

```bash
# Kiểm tra giới hạn hiện tại
sysctl -n kern.maxfiles

# Tăng giới hạn (cần chạy 1 lần duy nhất)
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=32768

# Làm vĩnh viễn: Tạo file /etc/sysctl.conf
echo "kern.maxfiles=65536" | sudo tee -a /etc/sysctl.conf
echo "kern.maxfilesperproc=32768" | sudo tee -a /etc/sysctl.conf
```

### Cách 3: Tăng Node.js memory

```bash
# Export trước khi chạy
export NODE_OPTIONS="--max-old-space-size=4096"
cd web-app
pnpm dev
```

### Cách 4: Xóa cache và reinstall

```bash
cd web-app

# Xóa cache Vite
rm -rf node_modules/.vite

# Nếu vẫn lỗi, reinstall toàn bộ
rm -rf node_modules pnpm-lock.yaml
pnpm install
./start-dev.sh
```

## Phòng ngừa lâu dài

### 1. Tạo file `.env.local` để config Vite

```bash
cd web-app
cat > .env.local << 'EOF'
# Giảm tải HMR
VITE_HMR_TIMEOUT=60000
VITE_HMR_OVERLAY=false

# Server config
VITE_PORT=5173
VITE_HOST=0.0.0.0
EOF
```

### 2. Cập nhật `vite.config.ts`

Thêm config này để giảm crash:

```typescript
export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      timeout: 60000,
      overlay: false,
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
  },
})
```

### 3. Dùng PM2 cho production-like dev

```bash
# Cài PM2
npm install -g pm2

# Chạy với PM2 (auto-restart)
cd web-app
pm2 start start-dev.sh --name web-app --watch

# Xem logs
pm2 logs web-app

# Stop
pm2 stop web-app
pm2 delete web-app
```

## Debug khi crash

```bash
# Kiểm tra process
ps aux | grep vite

# Kiểm tra port
lsof -iTCP:5173 -sTCP:LISTEN

# Xem logs đầy đủ
tail -f web-app/vite.log

# Kill tất cả Node processes (CẢNH BÁO: Kills ALL node)
pkill -9 node

# Kiểm tra memory
vm_stat | head -5
```

## Tóm tắt các lệnh thường dùng

```bash
# Khởi động an toàn (DÙNG CÁI NÀY)
cd web-app && ./start-dev.sh

# Nếu bị crash, restart:
pkill -9 vite; ./start-dev.sh

# Tăng file limit (chỉ cần 1 lần):
sudo sysctl -w kern.maxfiles=65536

# Clear cache:
rm -rf node_modules/.vite && ./start-dev.sh
```
