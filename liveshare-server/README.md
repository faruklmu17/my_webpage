# Sandbox Live Share Server for Raspberry Pi

Realtime Yjs WebSocket relay for interactive pair programming in the Python / HTML Sandbox.

## Deployment on Raspberry Pi

### Option 1: PM2 (Quickest if Node.js is on your Pi)

1. Copy or git pull this repository on your Raspberry Pi:
   ```bash
   cd ~/raspberry-pi-server # or wherever you keep homelab services
   # navigate to portfolio-website/liveshare-server
   cd portfolio-website/liveshare-server
   npm install --production
   ```

2. Start with PM2:
   ```bash
   pm2 start server.js --name "sandbox-liveshare" --env production
   pm2 save
   ```

### Option 2: Docker / Portainer

A lightweight Dockerfile is included:
```bash
docker build -t sandbox-liveshare .
docker run -d \
  --name sandbox-liveshare \
  --restart unless-stopped \
  -p 1234:1234 \
  -e PORT=1234 \
  -e ALLOWED_ORIGINS="https://faruk-hasan.com,https://www.faruk-hasan.com,http://localhost:8765" \
  sandbox-liveshare
```

---

## Exposing Publicly via Tailscale Funnel (HTTPS / WSS)

Because your portfolio site runs on HTTPS (`https://faruk-hasan.com`), browsers require secure WebSocket (`wss://`) connections. Tailscale Funnel gives your Pi an encrypted public URL without changing domain registrars or opening home router ports.

1. Install Tailscale on your Raspberry Pi (if not already installed):
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```

2. Enable Funnel on port 1234:
   ```bash
   sudo tailscale funnel 1234
   ```
   Tailscale will output your public funnel address, e.g.:
   `https://<your-pi-name>.<your-tailnet>.ts.net`

3. The sandbox connects to:
   `wss://<your-pi-name>.<your-tailnet>.ts.net`

