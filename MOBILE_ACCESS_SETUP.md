# Mobile Access Setup Guide

This guide explains how to access your Host Monitor application from your phone or other devices on the same network.

## ⚠️ Important: `.test` Domains Don't Work on Phones

The `hostmonitorv6.test` domain only works on your computer. On your phone, you need to use your computer's **IP address** instead.

## Prerequisites

- Your computer and phone must be on the same Wi-Fi network
- Laravel Herd must be running
- Vite dev server must be running

## Step 1: Find Your Computer's IP Address

### Windows:
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100`

### Mac:
1. Open System Preferences → Network
2. Select your active connection (Wi-Fi or Ethernet)
3. Your IP address is displayed
4. Or run in Terminal: `ifconfig | grep "inet "`

### Linux:
```bash
ip addr show
# or
hostname -I
```

## Step 2: Start the Development Server

Make sure both Laravel Herd and Vite are running:

```bash
# In your project directory
npm run dev
```

The Vite server should now be accessible on your network.

## Step 3: Access from Your Phone

### Option A: Access Laravel Herd (Main Application)

Since `hostmonitorv6.test` doesn't work on phones, use your computer's IP address:

1. **Find your computer's IP address** (from Step 1)
2. **Open your phone's browser** (Chrome, Safari, etc.)
3. **Enter the URL**: `http://YOUR_IP_ADDRESS`

   Example: If your IP is `192.168.1.100`, use:
   ```
   http://192.168.1.100
   ```

   **Note**: Laravel Herd typically runs on port 80 (default), so you don't need to specify a port.

### ⚠️ Important: Don't Use Port 3000 for the Website

**Port 3000 is the Vite dev server** - it only shows a message about HMR. It's NOT your actual website!

- ❌ `http://YOUR_IP:3000` - This is just the Vite dev server (not your app)
- ✅ `http://YOUR_IP` - This is your actual Laravel application (Laravel Herd)

The Vite dev server (port 3000) is only used internally by Laravel to serve assets. You should access the Laravel Herd server directly.

### Quick Reference

| On Your Computer | On Your Phone (Same Network) |
|-----------------|------------------------------|
| `http://hostmonitorv6.test` | `http://YOUR_IP_ADDRESS` |
| `http://localhost` | `http://YOUR_IP_ADDRESS` |

**Note**: Port 3000 is only for Vite dev server (assets), not the actual website!

## Step 4: Configure Laravel Herd for Network Access

Laravel Herd needs to be configured to accept connections from your network:

### Method 1: Herd Settings (Recommended)

1. Open **Laravel Herd** application
2. Click on **Settings** (gear icon)
3. Go to **Sites** tab
4. Find `hostmonitorv6` in the list
5. Make sure it's enabled and running
6. Check if there's a **Network** or **Server** option to bind to `0.0.0.0`

### Method 2: Check Herd Port

Laravel Herd usually runs on port **80** (HTTP) or **443** (HTTPS). To verify:

1. On your computer, open: `http://hostmonitorv6.test` (should work)
2. Check what port it's using in Herd settings
3. On your phone, use: `http://YOUR_IP_ADDRESS` (port 80) or `http://YOUR_IP_ADDRESS:PORT`

### Method 3: Use PHP Built-in Server (Recommended if Herd doesn't work)

**This is the easiest solution!** Laravel Herd often only listens on localhost. Use PHP's built-in server instead:

```bash
# In your project directory
php artisan serve --host=0.0.0.0 --port=8000
```

Then access from phone: `http://YOUR_IP_ADDRESS:8000`

**Example**: If your IP is `10.8.24.172`, use:
```
http://10.8.24.172:8000
```

**Note**: Keep this command running in a terminal while you want to access from your phone.

## Troubleshooting

### Can't Access from Phone

1. **Check Firewall**: Windows Firewall might be blocking the connection
   - Go to Windows Defender Firewall
   - Allow Node.js and PHP through the firewall
   - Or temporarily disable firewall to test

2. **Check Network**: Make sure both devices are on the same network
   - Phone and computer must be on the same Wi-Fi

3. **Check Ports**: Make sure ports are not blocked
   - Vite: Port 3000 (or 5173)
   - Laravel Herd: Port 80 or 8000

4. **Try Different Browser**: Some browsers have security restrictions

### Black Screen or Assets Not Loading

**Problem**: You see a black/blank screen when accessing from your phone.

**Solution**: Build the production assets so they don't depend on the Vite dev server:

```bash
npm run build
```

Then refresh your phone browser. The built assets will be served from the same server.

**Why this works**:
- Development mode tries to load assets from `localhost:3000` (Vite dev server) ❌
- Production build serves assets from the same server (no external dependency) ✅

**Note**: After building, you don't need to run `npm run dev` for mobile access. The built assets work independently.

### Laravel Herd Not Accessible

**Common Issue**: Laravel Herd only listens on `127.0.0.1` (localhost), not on your network IP.

**Solution**: Use PHP's built-in server instead:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Then access: `http://YOUR_IP:8000`

**Why this works**: 
- Herd binds to `127.0.0.1:80` (localhost only) ❌
- PHP server binds to `0.0.0.0:8000` (all network interfaces) ✅

**Windows Firewall**: If it still doesn't work:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "PHP" and allow it for Private networks
4. Or temporarily disable firewall to test

## Quick Test

1. On your computer, open: `http://localhost:3000` (should work)
2. On your phone, open: `http://YOUR_IP:3000` (should also work)
3. If both work, you're all set!

## Security Note

⚠️ **Development Only**: This setup is for development. For production:
- Use a proper web server (Nginx/Apache)
- Set up HTTPS/SSL
- Configure proper firewall rules
- Use authentication

## Alternative: Use ngrok (for external access)

If you need to access from outside your network:

```bash
# Install ngrok
# Then run:
ngrok http 80
# or
ngrok http 3000
```

This will give you a public URL that tunnels to your local server.

