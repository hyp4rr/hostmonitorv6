# Quick Start Guide - Host Monitor v6

## 🚀 Getting Started

### **Installation Complete!**
All features are now live and ready to use. No additional setup required.

---

## 👤 User Guide

### **Changing Theme**
1. Click your **avatar** in the top-right corner
2. Look for the **Theme** section
3. Choose one:
   - ☀️ **Light** - Bright theme
   - 🌙 **Dark** - Dark theme
   - 💻 **System** - Follows your OS setting
4. Your choice is **saved automatically**

### **Changing Language**
1. Click your **avatar** in the top-right corner
2. Find the **Language** dropdown
3. Select your language:
   - 🇬🇧 **English**
   - 🇲🇾 **Bahasa Melayu**
   - 🇨🇳 **中文**
4. The entire site updates **instantly**

### **Viewing Device Information**
1. Go to **Devices** page
2. Click any device card
3. See detailed information:
   - Response Time (ping latency)
   - Last Ping (when last checked)
   - Last Updated (last modification)
   - Status and uptime
   - Location and hardware details

### **Monitoring Alerts**
1. Go to **Alerts** page
2. Devices offline for **more than 2 minutes** appear automatically
3. Filter by severity: Critical, High, Medium, Low
4. View alert details and timestamps

---

## 👨‍💼 Administrator Guide

### **Acknowledging Offline Devices**
When a device needs to be offline for maintenance:

1. Go to **Configuration** page
2. Click **Devices** tab
3. Find the offline device (red status)
4. Click the **orange checkmark button** (🟠 ✓)
5. Fill in the form:
   - **Acknowledged By**: Your name
   - **Reason**: Why it's offline (e.g., "Scheduled maintenance")
6. Click **"Acknowledge Offline"**

**What happens:**
- Device status changes to `offline_ack` (blue badge)
- Device is **hidden** from:
  - Dashboard
  - Devices page
  - Maps
  - Reports
- System **stops pinging** the device (saves resources)
- Device still visible in **Configuration** for management

### **Viewing All Devices (Including Acknowledged)**
- Only the **Configuration** page shows ALL devices
- This includes devices with `offline_ack` status
- Use this to manage the full device lifecycle

### **When Device Comes Back Online**
- Acknowledgement is **automatically cleared**
- Device reappears in all views
- Pinging resumes automatically
- Status returns to `online`

---

## 🔔 Alert System

### **Automatic Monitoring**
- System checks all devices every **30 seconds** (default)
- Tracks how long each device has been offline
- Creates alert if offline **≥ 2 minutes**
- Only one alert per offline period (no duplicates)

### **Alert Workflow**
```
Device goes offline
    ↓
After 2 minutes
    ↓
Alert created automatically
    ↓
Appears in Alerts page
    ↓
Admin acknowledges device (optional)
    ↓
Device hidden from main views
    ↓
Device comes back online
    ↓
Alert resolved, device visible again
```

---

## 🎨 Theme System

### **Three Modes Available**

**Light Mode (☀️)**
- Bright, clean interface
- Best for daytime use
- Easy on the eyes in well-lit environments

**Dark Mode (🌙)**
- Dark background, light text
- Reduces eye strain at night
- Saves battery on OLED screens

**System Mode (💻)**
- Automatically follows your OS theme
- Changes with your system settings
- Best of both worlds

### **Persistence**
- Your choice is saved to browser storage
- Applies automatically on next visit
- Works across all pages
- No need to set it again

---

## 🌐 Language System

### **Supported Languages**

**English (🇬🇧)**
- Default language
- Full coverage of all features

**Bahasa Melayu (🇲🇾)**
- Complete Malay translation
- All UI elements translated

**中文 (🇨🇳)**
- Full Chinese translation
- Simplified Chinese characters

### **What Gets Translated**
- ✅ Navigation menu
- ✅ Page titles
- ✅ Button labels
- ✅ Device status
- ✅ Alert messages
- ✅ Settings panel
- ✅ Error messages
- ✅ Success notifications

### **Adding More Languages**
To add a new language, create a file:
```
resources/js/lib/locales/[code].json
```
Copy the structure from `en.json` and translate all values.

---

## 📊 Reports & Data

### **Real-Time Data**
All statistics and reports pull from the database in real-time:
- Device counts
- Status distribution
- Uptime percentages
- Alert summaries
- Response times

### **Auto-Refresh**
- Default: **30 seconds**
- Can be adjusted in settings
- Manual refresh button available
- Last update timestamp shown

---

## 🔧 Troubleshooting

### **Theme Not Saving**
- Check browser allows localStorage
- Try clearing browser cache
- Ensure JavaScript is enabled

### **Language Not Changing**
- Refresh the page
- Check browser console for errors
- Verify i18n files are loaded

### **Device Not Appearing**
- Check if status is `offline_ack`
- Go to Configuration to see all devices
- Verify device is active in database

### **Alerts Not Showing**
- Ensure device has been offline ≥ 2 minutes
- Check Alerts page filters
- Verify alert system is running

---

## 💡 Tips & Best Practices

### **For Users**
1. Use **System theme** to match your OS
2. Set language once, it remembers forever
3. Check **Last Ping** to see data freshness
4. Use **Response Time** to identify slow devices

### **For Administrators**
1. **Acknowledge devices** during planned maintenance
2. This prevents false alerts
3. Always add a clear **reason** when acknowledging
4. Check **Configuration** page for full device list
5. Monitor **offline duration** to spot patterns

### **For Monitoring**
1. Set up **auto-refresh** for real-time updates
2. Watch for devices with high **response times**
3. Address alerts within **2 minutes** when possible
4. Use **device details** to troubleshoot issues

---

## 📱 Mobile Usage

All features work on mobile devices:
- ✅ Responsive design
- ✅ Touch-friendly buttons
- ✅ Optimized layouts
- ✅ Theme switching
- ✅ Language selection
- ✅ Full functionality

---

## 🎯 Quick Actions

| Action | Steps |
|--------|-------|
| Change theme | Avatar → Select theme |
| Change language | Avatar → Select language |
| View device details | Devices → Click device |
| Acknowledge offline | Configuration → Devices → Click ✓ |
| View all devices | Configuration → Devices |
| Check alerts | Alerts page |
| Refresh data | Click refresh button |

---

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review the **IMPLEMENTATION_SUMMARY.md**
3. Check browser console for errors
4. Verify database connection
5. Ensure all migrations are run

---

## 🎉 Enjoy!

Your Host Monitor v6 is now fully equipped with:
- 🎨 Theme persistence
- 🌐 Multi-language support
- 📊 Real-time monitoring
- 🔔 Automatic alerts
- 🧹 Clean device management
- ⚡ Optimized performance

Happy monitoring! 🚀
