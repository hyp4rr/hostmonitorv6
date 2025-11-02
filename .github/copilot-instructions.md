# Host Monitor v6 - AI Coding Agent Instructions

## Architecture Overview

This is a **Laravel 12 + React + Inertia.js** network monitoring application for tracking device status across branches. The backend uses **MySQL** with Laravel Eloquent ORM, while the frontend is a **TypeScript React SPA** using Inertia for server-side routing.

### Core Stack
- **Backend**: Laravel 12 (PHP 8.2+), Laravel Fortify (auth), Laravel Sanctum (API tokens)
- **Frontend**: React 18 with TypeScript, Inertia.js React adapter, Tailwind CSS v4
- **Build Tools**: Vite 7, Laravel Vite Plugin, React Compiler (Babel plugin)
- **Testing**: Pest PHP for backend tests
- **Dev Server**: Laravel Herd (implied by path structure)

## Key Architectural Patterns

### 1. Inertia.js Page Component Flow
- **Server-side routing** in `routes/web.php` returns Inertia responses via controllers
- Controllers return `Inertia::render('monitor/dashboard', [...props])` 
- React pages in `resources/js/pages/monitor/*.tsx` receive props via `usePage<PageProps>()`
- NO traditional API calls for page loads - data flows through Inertia props
- Example: `MonitorController::dashboard()` passes `currentBranch`, `stats`, `recentAlerts` as props

### 2. Dual API Pattern
- **Inertia routes** (`/monitor/*` in `routes/web.php`): Full page loads with MonitorController
- **REST API** (`/api/*` in `routes/api.php`): JSON endpoints for dynamic data fetching
- Configuration endpoints use **Sanctum auth middleware** (`auth:sanctum`)
- Device/alert endpoints are currently **unprotected** (public monitoring)

### 3. Database Schema Core Entities
Located in `database/migrations/2024_*`:
- **branches**: Multi-tenant structure (branch_id foreign keys everywhere)
- **devices**: Network devices with `ip_address`, `status` (online/offline/warning), `is_active`, `last_ping`
- **alerts**: Device alerts with `severity`, `acknowledged`, `resolved` tracking
- **locations**: Geographic location data for mapping
- **monitoring_history**: Historical device status logs

Key constraint: `devices.ip_address` and `devices.barcode` are UNIQUE

### 4. Context-Based State Management
Located in `resources/js/contexts/`:
- **SettingsContext**: Theme (light/dark/system), language, timezone - persists to localStorage as `hostmonitor_settings`
- **I18nContext**: Translation system (wraps components)
- **BranchContext**: Current branch data (deprecated - now passed via Inertia props)

Always wrap app in `<SettingsProvider><I18nProvider>` (see `resources/js/app.tsx`)

### 5. Component Library: Radix UI + Shadcn Pattern
- UI components in `resources/js/components/ui/` follow shadcn/ui conventions
- Uses Radix primitives: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.
- Styled with Tailwind utility classes
- Icons via `lucide-react`

## Critical Development Workflows

### Starting Development
```powershell
# Backend (in separate terminal)
php artisan serve

# Frontend (in workspace terminal)
npm run dev
```
Vite dev server runs on `localhost:3000` (configured in `vite.config.ts`)

### Database Operations
```powershell
# Fresh migration with seeders
php artisan migrate:fresh --seed

# Seeder includes AdminUserSeeder for config panel access
```

### Code Quality Commands
```powershell
npm run lint          # ESLint with auto-fix
npm run format        # Prettier (resources/ directory)
npm run types         # TypeScript type checking (no emit)
php artisan pint      # Laravel Pint (PHP formatting)
```

### Testing
```powershell
php artisan test      # Pest PHP tests in tests/
```

### Build for Production
```powershell
npm run build         # Vite production build
composer install --optimize-autoloader --no-dev
```

## Project-Specific Conventions

### TypeScript/React Patterns
1. **File naming**: `kebab-case.tsx` for components, `PascalCase` for component names
2. **Imports**: Use `@/` alias for `resources/js/` (configured in tsconfig paths)
3. **Page components**: Default export, wrapped in layout (e.g., `MonitorLayout`)
4. **Props typing**: Define interfaces above component, use `PageProps` extension for Inertia pages
5. **State**: Prefer React Context for global state, local useState for component state

### Laravel Backend Patterns
1. **Controllers**: Separate API controllers (`App\Http\Controllers\Api\*`) from Inertia controllers
2. **Models**: Located in `app/Models/`, use Eloquent relationships (BelongsTo, HasMany)
3. **Jobs**: `app/Jobs/PingSwitch.php` - queued job for device pinging (uses Windows `ping -n 1 -w 1000`)
4. **Error handling**: Controllers catch exceptions and log via `Log::error()`, return graceful JSON

### Styling Conventions
- **Dark mode**: Toggle via `dark` class on `<html>` (Tailwind `darkMode: 'class'`)
- **Responsive**: Mobile-first with Tailwind breakpoints (sm:, md:, lg:, xl:)
- **Forms**: Use `@tailwindcss/forms` plugin for base form styling
- **Typography**: `font-sans` uses `Inter var` (extended in tailwind.config.js)

### Configuration File Pattern
The `/monitor/configuration` page provides **public CRUD access** for system configuration:
- No authentication required
- Direct access to manage branches, devices, alerts, locations, and users
- Uses standard REST API endpoints (`/api/branches`, `/api/devices`, etc.)
- All CRUD operations are performed via fetch requests with JSON payloads

## Integration Points

### Device Monitoring System
1. **Ping Job Queue**: `PingSwitch` job dispatched for device health checks
2. **Status Flow**: Job updates `device.status` → triggers alert creation → displayed in UI
3. **Windows-specific**: Ping command uses Windows flags (`-n 1 -w 1000`)

### Real-time Updates Pattern (Current Implementation)

**Current State**: No WebSocket/broadcasting - uses **Inertia page refresh pattern**

```typescript
// Current approach in components (e.g., devices.tsx)
const handlePingAll = async () => {
    setIsPinging(true);
    // Simulates ping delay with setTimeout
    setTimeout(() => {
        setIsPinging(false);
        setLastPingTime(new Date());
    }, 1000);
};
```

**Data Update Flow**:
1. Backend `PingSwitch` job runs on queue (cron/dispatch)
2. Job updates database (`devices.status`, `devices.last_ping`)
3. Frontend gets updates via:
   - **Inertia page visits**: `router.visit()` re-renders with fresh props
   - **Manual refresh**: User triggers ping action (cosmetic UI update only)
   - **No automatic polling**: Currently relies on user navigation

**Future Enhancement Path - Laravel Reverb Integration**:
```powershell
# Installation steps (when implementing)
composer require laravel/reverb
php artisan reverb:install
npm install --save-dev laravel-echo pusher-js

# Configuration
php artisan reverb:start  # Dev server on ws://127.0.0.1:8080
```

**Recommended Broadcasting Pattern**:
```php
// In PingSwitch job after status update
use Illuminate\Support\Facades\Broadcast;

if ($this->switch->status !== $newStatus) {
    $this->switch->status = $newStatus;
    $this->switch->save();
    
    // Broadcast to branch channel
    broadcast(new DeviceStatusChanged($this->switch))->toOthers();
}
```

```typescript
// Frontend hook for real-time updates
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// In resources/js/bootstrap.ts
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
});

// In page component
useEffect(() => {
    const channel = Echo.channel(`branch.${branchId}`)
        .listen('DeviceStatusChanged', (e) => {
            // Update local state or re-fetch via Inertia
            router.reload({ only: ['devices', 'stats'] });
        });
    
    return () => channel.stopListening('DeviceStatusChanged');
}, [branchId]);
```

**Key Decision Points**:
- Current setup works for low-frequency updates (user-driven navigation)
- Reverb recommended for: live dashboards, instant alert notifications, multi-user config changes
- Alternative: polling with `setInterval` + `/api/devices/stats` endpoint (simpler, higher server load)

### Map Integration
- Uses `leaflet` library (`@types/leaflet` in devDependencies)
- Device coordinates in `devices.latitude`/`devices.longitude`
- Location grouping via `locations` table

### Alert System
- Severity levels: info, warning, error, critical
- Workflow: triggered → acknowledged → resolved
- Acknowledgment tracks `acknowledged_by` and `acknowledged_at`
- Frontend displays in sidebar bell icon (count badge)

## Common Gotchas

1. **TypeScript paths**: Always use `@/` imports, not relative `../../` paths
2. **Inertia navigation**: Use `router.visit()` or `<Link>` component, NOT `window.location`
3. **CSRF tokens**: Included automatically via `resources/js/bootstrap.ts` (Axios config)
4. **Environment**: Laravel Herd provides PHP/MySQL - don't run `php artisan serve` if Herd is active
5. **Vite HMR**: Configured for `localhost` - may need adjustment for network access
6. **Database checks**: API controllers check `hasTable()` before queries (defensive for fresh installs)
7. **React Compiler**: Uses `babel-plugin-react-compiler` - avoid manual memoization patterns

## File Path Conventions

- **React pages**: `resources/js/pages/{section}/{page}.tsx`
- **Components**: `resources/js/components/{component-name}.tsx`
- **Layouts**: `resources/js/layouts/{layout-name}.tsx`
- **API Controllers**: `app/Http/Controllers/Api/{Entity}Controller.php`
- **Inertia Controllers**: `app/Http/Controllers/{Feature}Controller.php`
- **Models**: `app/Models/{Entity}.php`
- **Migrations**: `database/migrations/{YYYY_MM_DD_HHMMSS}_create_{table}_table.php`

## When Adding New Features

### New Monitored Entity Type
1. Create migration with `branch_id` foreign key and `is_active` boolean
2. Add model with `belongsTo(Branch::class)` relationship
3. Create API controller in `Api/` namespace
4. Add Inertia controller method for page rendering
5. Create TypeScript interface matching database columns
6. Add page component in `resources/js/pages/monitor/`

### New UI Component
1. If Radix primitive exists, install from `@radix-ui/react-*`
2. Create wrapper in `resources/js/components/ui/` with Tailwind styling
3. Export named component (not default) for tree-shaking
4. Use `cn()` utility for className merging (likely in `lib/utils.ts`)

### Database Schema Changes
Always create NEW migration (never edit existing in version control):
```powershell
php artisan make:migration add_column_to_table
```
