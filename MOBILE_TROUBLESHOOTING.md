# Mobile Access Troubleshooting

## Blank Screen Issues

If you see a blank/black screen when accessing from your phone:

### 1. Check Browser Console (Most Important!)

**On your phone:**
1. Open the website
2. Use remote debugging or check browser console
3. Look for JavaScript errors (red text)

**Common errors:**
- `Failed to load resource` - Asset loading issue
- `Cannot read property` - JavaScript runtime error
- `Network request failed` - CORS or network issue

### 2. Verify Assets Are Built

```bash
npm run build
```

Make sure `public/build/manifest.json` exists and has recent timestamp.

### 3. Clear All Caches

```bash
php artisan optimize:clear
php artisan config:clear
php artisan view:clear
```

### 4. Disable SSR (Server-Side Rendering)

SSR can cause blank screens if the SSR server isn't running. Edit `config/inertia.php`:

```php
'ssr' => [
    'enabled' => false, // Disable for mobile access
],
```

Then clear config cache:
```bash
php artisan config:clear
```

### 5. Check Server is Running

```bash
# Check if PHP server is running
netstat -an | findstr ":8000"
```

Should show: `TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING`

### 6. Test on Computer First

Before testing on phone, verify it works on your computer:
- `http://localhost:8000` - Should work
- `http://10.8.24.172:8000` - Should also work (from computer)

### 7. Check Network Tab

**On your phone browser:**
1. Open Developer Tools (if available)
2. Go to Network tab
3. Refresh page
4. Look for:
   - Failed requests (red)
   - 404 errors (missing files)
   - CORS errors

### 8. Verify Asset URLs

The built assets should be served from:
- `http://YOUR_IP:8000/build/assets/...`

NOT from:
- `http://localhost:3000/...` (Vite dev server)

### 9. Hard Refresh

On your phone:
- **Chrome**: Menu → Settings → Clear browsing data → Cached images and files
- **Safari**: Settings → Safari → Clear History and Website Data
- Or try incognito/private mode

### 10. Check Laravel Logs

```bash
Get-Content storage\logs\laravel.log -Tail 50
```

Look for PHP errors or exceptions.

## Quick Diagnostic Steps

1. ✅ **Build assets**: `npm run build`
2. ✅ **Clear caches**: `php artisan optimize:clear`
3. ✅ **Disable SSR**: Set `'enabled' => false` in `config/inertia.php`
4. ✅ **Restart server**: Stop and restart `php artisan serve --host=0.0.0.0 --port=8000`
5. ✅ **Test locally**: `http://localhost:8000` should work
6. ✅ **Test from phone**: `http://YOUR_IP:8000`

## Still Not Working?

Please provide:
1. **Browser console errors** (screenshot or text)
2. **Network tab errors** (failed requests)
3. **Laravel log errors** (last 20 lines)
4. **What you see**: Blank screen, error message, loading spinner?

