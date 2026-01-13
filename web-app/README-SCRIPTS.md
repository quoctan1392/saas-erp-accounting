# Web App Development Scripts

## Quick Start

```bash
# Start server in background (recommended)
./start-bg.sh

# Check if server is running
./status.sh

# Stop server
./stop.sh

# View logs
tail -f vite.log
```

## Scripts Overview

### `start-bg.sh` - Background Server (Interruption-Resistant) ⭐
**Use this for development!**
- Starts Vite in background with `nohup`
- Survives terminal closure and interruptions
- Saves PID for easy management
- Logs to `vite.log`

```bash
./start-bg.sh
# Server runs in background, you can close terminal
```

### `dev.sh` - Foreground Development
- Runs in foreground (interactive)
- Use when you want to see live logs
- Will stop if terminal closes

```bash
./dev.sh
# Keep terminal open, Ctrl+C to stop
```

### `status.sh` - Check Server Status
Shows:
- Running status
- Process ID
- Port usage
- Recent logs

```bash
./status.sh
```

### `stop.sh` - Stop Server
Safely stops the background server

```bash
./stop.sh
```

## Why Servers Get Interrupted

**Problem**: Foreground processes get killed when:
- Terminal closes
- Ctrl+C is pressed
- Another command is run in same terminal
- SSH connection drops

**Solution**: Use `start-bg.sh` which:
1. Uses `nohup` (no hangup) to ignore SIGHUP signals
2. Redirects output to log file
3. Runs in background (`&`)
4. Saves PID for management
5. Survives terminal closure

## Troubleshooting

### Server won't start
```bash
# Check what's on port 5173
lsof -i :5173

# Force clean and restart
./stop.sh
./start-bg.sh
```

### Server keeps stopping
```bash
# Make sure you're using start-bg.sh, not dev.sh
./start-bg.sh

# Check logs for errors
tail -f vite.log
```

### Can't access http://localhost:5173
```bash
# Verify server is running
./status.sh

# Check if port is blocked by firewall
curl -I http://localhost:5173
```

## All Available Scripts

| Script | Purpose | Foreground/Background | Survives Terminal Close |
|--------|---------|----------------------|------------------------|
| `start-bg.sh` | **Production dev** | Background | ✅ Yes |
| `dev.sh` | Interactive dev | Foreground | ❌ No |
| `start.sh` | Simple start | Foreground | ❌ No |
| `stop.sh` | Stop server | - | - |
| `status.sh` | Check status | - | - |
