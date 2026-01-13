# 🚀 Quick Start Guide - No More Interruptions!

## The Problem (and Solution)

### ❌ What Was Happening Before
- Vite server would stop randomly
- Closing terminal would kill the server
- Running other commands would interrupt it
- Exit code 130 (SIGINT - Ctrl+C signal)

### ✅ What Happens Now
- Server runs in **true background** with `nohup`
- Immune to terminal closure
- Immune to SIGHUP/SIGINT signals
- PID-based management for reliable start/stop

---

## Start All Services (Correct Way)

### 1. Start Backend Services (Docker)
```bash
cd /Users/lammaidangvu/saas-erp-accounting/saas-erp-accounting
docker-compose up -d
```

### 2. Start Frontend (Vite) - Interruption-Resistant
```bash
cd web-app
./start-bg.sh
```

**That's it!** The server will keep running even if you:
- Close the terminal
- Run other commands
- Disconnect SSH
- Switch to other projects

---

## Managing the Vite Server

### Check Status
```bash
cd web-app
./status.sh
```

Shows: Running status, PID, port usage, recent logs

### View Live Logs
```bash
cd web-app
tail -f vite.log
```

### Stop Server
```bash
cd web-app
./stop.sh
```

### Restart Server
```bash
cd web-app
./stop.sh && ./start-bg.sh
```

---

## Access URLs

Once started, access:
- **Frontend**: http://localhost:5173
- **Auth API**: http://localhost:3001/api/v1
- **Tenant API**: http://localhost:3002/api/v1
- **Core API**: http://localhost:3003/api

---

## Technical Details: Why This Works

### The Old Way (Vulnerable to Interruption)
```bash
pnpm dev                    # ❌ Foreground process
cd somewhere && pnpm dev    # ❌ Gets killed by new commands
./dev.sh                    # ❌ Dies when terminal closes
```

### The New Way (Interruption-Resistant)
```bash
nohup pnpm dev > vite.log 2>&1 &    # ✅ Background + nohup
echo $! > vite.pid                  # ✅ Save PID for management
```

**Key Features:**
1. **`nohup`**: Ignores SIGHUP (hangup signal when terminal closes)
2. **`&`**: Runs in background (doesn't block terminal)
3. **`> vite.log 2>&1`**: Redirects all output to log file
4. **PID file**: Saves process ID for reliable stop/restart

### Signal Handling

| Signal | Description | Old Behavior | New Behavior |
|--------|-------------|--------------|--------------|
| SIGHUP (1) | Hangup (terminal close) | ❌ Kills process | ✅ Ignored by nohup |
| SIGINT (2) | Interrupt (Ctrl+C) | ❌ Kills process | ✅ Ignored (running in background) |
| SIGTERM (15) | Terminate (./stop.sh) | ✅ Graceful exit | ✅ Graceful exit |
| SIGKILL (9) | Force kill | ✅ Immediate kill | ✅ Immediate kill |

---

## Troubleshooting

### "Port already in use"
```bash
cd web-app
./stop.sh
./start-bg.sh
```

### "Can't connect to localhost:5173"
```bash
# Check if actually running
./status.sh

# Check firewall
sudo lsof -i :5173

# Restart
./stop.sh && sleep 2 && ./start-bg.sh
```

### "Server stops after a while"
This should NOT happen anymore with `start-bg.sh`. If it does:

```bash
# Check logs for errors
cat vite.log

# Check if out of memory
free -h  # Linux
vm_stat  # macOS

# Restart with verbose logging
./stop.sh
nohup pnpm dev > vite-debug.log 2>&1 &
```

---

## For Future Development

### Add to .gitignore (already done)
```
vite.log
vite.pid
```

### Recommended Workflow
1. Start services once: `./start-bg.sh`
2. Work normally - server keeps running
3. View logs when needed: `tail -f vite.log`
4. Stop when done: `./stop.sh`

### For Production
Consider using:
- **PM2**: Process manager with auto-restart, monitoring
- **Systemd**: System service (Linux)
- **Docker**: Containerize frontend too
- **Nginx**: Reverse proxy for better performance

---

## Summary

**Before**: Vite server kept dying (exit code 130, SIGINT)
**Now**: Runs reliably in background with nohup
**Usage**: `./start-bg.sh` → keeps running forever
**Management**: `./status.sh` to check, `./stop.sh` to stop

✅ **No more interruptions!**
