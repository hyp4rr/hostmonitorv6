import { createContext, useContext, type ReactNode } from 'react';
import { useSettings } from './settings-context';

interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}

const translations: Translations = {
    // Navigation
    'nav.dashboard': {
        'English': 'Dashboard',
        'Bahasa Melayu': 'Papan Pemuka',
        '中文': '仪表板'
    },
    'nav.devices': {
        'English': 'Devices',
        'Bahasa Melayu': 'Peranti',
        '中文': '设备'
    },
    'nav.alerts': {
        'English': 'Alerts',
        'Bahasa Melayu': 'Amaran',
        '中文': '警报'
    },
    'nav.reports': {
        'English': 'Reports',
        'Bahasa Melayu': 'Laporan',
        '中文': '报告'
    },
    'nav.maps': {
        'English': 'Maps',
        'Bahasa Melayu': 'Peta',
        '中文': '地图'
    },
    'nav.settings': {
        'English': 'Settings',
        'Bahasa Melayu': 'Tetapan',
        '中文': '设置'
    },
    'nav.configuration': {
        'English': 'Configuration',
        'Bahasa Melayu': 'Konfigurasi',
        '中文': '配置'
    },

    // Dashboard
    'dashboard.title': {
        'English': 'System Overview',
        'Bahasa Melayu': 'Gambaran Sistem',
        '中文': '系统概览'
    },
    'dashboard.subtitle': {
        'English': 'Real-time monitoring of your network infrastructure',
        'Bahasa Melayu': 'Pemantauan masa nyata infrastruktur rangkaian anda',
        '中文': '网络基础设施的实时监控'
    },
    'dashboard.totalDevices': {
        'English': 'Total Devices',
        'Bahasa Melayu': 'Jumlah Peranti',
        '中文': '总设备数'
    },
    'dashboard.online': {
        'English': 'Online',
        'Bahasa Melayu': 'Dalam Talian',
        '中文': '在线'
    },
    'dashboard.offline': {
        'English': 'Offline',
        'Bahasa Melayu': 'Luar Talian',
        '中文': '离线'
    },
    'dashboard.warning': {
        'English': 'Warning',
        'Bahasa Melayu': 'Amaran',
        '中文': '警告'
    },
    'dashboard.deviceTypes': {
        'English': 'Device Types',
        'Bahasa Melayu': 'Jenis Peranti',
        '中文': '设备类型'
    },
    'dashboard.locationStatus': {
        'English': 'Location Status',
        'Bahasa Melayu': 'Status Lokasi',
        '中文': '位置状态'
    },
    'dashboard.recentAlerts': {
        'English': 'Recent Alerts',
        'Bahasa Melayu': 'Amaran Terkini',
        '中文': '最近警报'
    },
    'dashboard.recentActivity': {
        'English': 'Recent Activity',
        'Bahasa Melayu': 'Aktiviti Terkini',
        '中文': '最近活动'
    },

    // Devices
    'devices.title': {
        'English': 'Device Management',
        'Bahasa Melayu': 'Pengurusan Peranti',
        '中文': '设备管理'
    },
    'devices.subtitle': {
        'English': 'Monitor and manage all network devices by category',
        'Bahasa Melayu': 'Pantau dan urus semua peranti rangkaian mengikut kategori',
        '中文': '按类别监控和管理所有网络设备'
    },
    'devices.search': {
        'English': 'Search by name or IP...',
        'Bahasa Melayu': 'Cari mengikut nama atau IP...',
        '中文': '按名称或IP搜索...'
    },
    'devices.pingAll': {
        'English': 'Ping All',
        'Bahasa Melayu': 'Ping Semua',
        '中文': '全部Ping'
    },
    'devices.pinging': {
        'English': 'Pinging...',
        'Bahasa Melayu': 'Ping Semua...',
        '中文': 'Ping中...'
    },
    'devices.lastPing': {
        'English': 'Last ping',
        'Bahasa Melayu': 'Ping terakhir',
        '中文': '最后Ping'
    },
    'devices.all': {
        'English': 'All',
        'Bahasa Melayu': 'Semua',
        '中文': '全部'
    },
    'devices.noDevices': {
        'English': 'No devices found',
        'Bahasa Melayu': 'Tiada peranti dijumpai',
        '中文': '未找到设备'
    },
    'devices.tryAdjustingFilters': {
        'English': 'Try adjusting your filters',
        'Bahasa Melayu': 'Cuba laraskan penapis anda',
        '中文': '尝试调整过滤器'
    },
    'devices.noDevicesConfigured': {
        'English': 'No devices configured yet',
        'Bahasa Melayu': 'Belum ada peranti dikonfigurasikan',
        '中文': '尚未配置设备'
    },

    // Devices - Additional keys
    'devices.offlineAck': {
        'English': 'Offline (Acknowledged)',
        'Bahasa Melayu': 'Luar Talian (Diakui)',
        '中文': '离线（已确认）'
    },
    'devices.offlineReason': {
        'English': 'Offline Reason',
        'Bahasa Melayu': 'Sebab Luar Talian',
        '中文': '离线原因'
    },
    'devices.acknowledgedBy': {
        'English': 'Acknowledged by',
        'Bahasa Melayu': 'Diakui oleh',
        '中文': '确认人'
    },

    // Alerts - Updated workflow
    'alerts.title': {
        'English': 'Device Alerts',
        'Bahasa Melayu': 'Amaran Peranti',
        '中文': '设备警报'
    },
    'alerts.subtitle': {
        'English': 'Monitor, manage and acknowledge device alerts in real-time',
        'Bahasa Melayu': 'Pantau, urus dan akui amaran peranti dalam masa nyata',
        '中文': '实时监控、管理和确认设备警报'
    },
    'alerts.pending': {
        'English': 'Pending Alert',
        'Bahasa Melayu': 'Amaran Tertunda',
        '中文': '待处理警报'
    },
    'alerts.critical': {
        'English': 'Critical Alerts',
        'Bahasa Melayu': 'Amaran Kritikal',
        '中文': '关键警报'
    },
    'alerts.high': {
        'English': 'High Priority',
        'Bahasa Melayu': 'Keutamaan Tinggi',
        '中文': '高优先级'
    },
    'alerts.acknowledged': {
        'English': 'Acknowledged',
        'Bahasa Melayu': 'Diakui',
        '中文': '已确认'
    },
    'alerts.total': {
        'English': 'Total Alerts',
        'Bahasa Melayu': 'Jumlah Amaran',
        '中文': '总警报'
    },
    'alerts.acknowledge': {
        'English': 'Acknowledge Alert',
        'Bahasa Melayu': 'Akui Amaran',
        '中文': '确认警报'
    },
    'alerts.criticalNote': {
        'English': 'Requires immediate action',
        'Bahasa Melayu': 'Memerlukan tindakan segera',
        '中文': '需要立即采取行动'
    },
    'alerts.highNote': {
        'English': 'Needs attention soon',
        'Bahasa Melayu': 'Memerlukan perhatian segera',
        '中文': '需要尽快关注'
    },
    'alerts.acknowledgedNote': {
        'English': 'Resolved or handled',
        'Bahasa Melayu': 'Diselesaikan atau dikendalikan',
        '中文': '已解决或已处理'
    },
    'alerts.totalNote': {
        'English': 'Last 30 days',
        'Bahasa Melayu': '30 hari terakhir',
        '中文': '最近30天'
    },
    'alerts.filterBySeverity': {
        'English': 'Filter by Severity',
        'Bahasa Melayu': 'Tapis mengikut Keterukan',
        '中文': '按严重程度过滤'
    },
    'alerts.pendingAlerts': {
        'English': 'Pending Alerts',
        'Bahasa Melayu': 'Amaran Tertunda',
        '中文': '待处理警报'
    },
    'alerts.requiringAcknowledgment': {
        'English': 'requiring acknowledgment',
        'Bahasa Melayu': 'memerlukan pengakuan',
        '中文': '需要确认'
    },
    'alerts.acknowledgedAlerts': {
        'English': 'Acknowledged Alerts',
        'Bahasa Melayu': 'Amaran Diakui',
        '中文': '已确认警报'
    },
    'alerts.acknowledgedDescription': {
        'English': 'Previously handled alerts with resolution notes',
        'Bahasa Melayu': 'Amaran yang telah dikendalikan dengan nota penyelesaian',
        '中文': '先前处理的警报及解决说明'
    },
    'alerts.resolved': {
        'English': 'RESOLVED',
        'Bahasa Melayu': 'DISELESAIKAN',
        '中文': '已解决'
    },
    'alerts.ipAddress': {
        'English': 'IP Address',
        'Bahasa Melayu': 'Alamat IP',
        '中文': 'IP地址'
    },
    'alerts.category': {
        'English': 'Category',
        'Bahasa Melayu': 'Kategori',
        '中文': '类别'
    },
    'alerts.downtimeDuration': {
        'English': 'Downtime Duration',
        'Bahasa Melayu': 'Tempoh Masa Tidak Aktif',
        '中文': '停机时间'
    },
    'alerts.triggered': {
        'English': 'Triggered',
        'Bahasa Melayu': 'Dicetuskan',
        '中文': '触发时间'
    },
    'alerts.resolutionNotes': {
        'English': 'Resolution Notes',
        'Bahasa Melayu': 'Nota Penyelesaian',
        '中文': '解决说明'
    },
    'alerts.resolutionNotesDescription': {
        'English': 'Provide detailed information about the cause and resolution',
        'Bahasa Melayu': 'Berikan maklumat terperinci tentang punca dan penyelesaian',
        '中文': '提供有关原因和解决方案的详细信息'
    },
    'alerts.resolutionNotesPlaceholder': {
        'English': 'e.g., Scheduled maintenance for firmware update. System was brought back online after successful update...',
        'Bahasa Melayu': 'cth., Penyelenggaraan berjadual untuk kemas kini perisian tegar. Sistem dibawa semula dalam talian selepas kemas kini berjaya...',
        '中文': '例如：固件更新的计划维护。更新成功后系统恢复在线...'
    },
    'alerts.acknowledgeAlert': {
        'English': 'Acknowledge Alert',
        'Bahasa Melayu': 'Akui Amaran',
        '中文': '确认警报'
    },
    'alerts.cancel': {
        'English': 'Cancel',
        'Bahasa Melayu': 'Batal',
        '中文': '取消'
    },
    'alerts.acknowledgeResolve': {
        'English': 'Acknowledge & Resolve',
        'Bahasa Melayu': 'Akui & Selesaikan',
        '中文': '确认并解决'
    },
    'alerts.acknowledgeOnly': {
        'English': 'Acknowledge',
        'Bahasa Melayu': 'Akui',
        '中文': '确认'
    },
    'alerts.acknowledgeInfo': {
        'English': 'Acknowledge this alert to mark it as seen. To resolve or manage alerts, visit the Configuration panel.',
        'Bahasa Melayu': 'Akui amaran ini untuk menandakannya sebagai dilihat. Untuk menyelesaikan atau mengurus amaran, lawati panel Konfigurasi.',
        '中文': '确认此警报以将其标记为已查看。要解决或管理警报，请访问配置面板。'
    },
    'alerts.viewInConfig': {
        'English': 'Manage in Configuration',
        'Bahasa Melayu': 'Urus dalam Konfigurasi',
        '中文': '在配置中管理'
    },
    'alerts.acknowledgeNote': {
        'English': 'Acknowledgment Note',
        'Bahasa Melayu': 'Nota Pengakuan',
        '中文': '确认备注'
    },
    'alerts.acknowledgeNotePlaceholder': {
        'English': 'Add a note about this acknowledgment (optional)...',
        'Bahasa Melayu': 'Tambah nota tentang pengakuan ini (pilihan)...',
        '中文': '添加有关此确认的备注（可选）...'
    },
    'alerts.acknowledgedBy': {
        'English': 'Acknowledged by',
        'Bahasa Melayu': 'Diakui oleh',
        '中文': '确认人'
    },

    // Reports
    'reports.title': {
        'English': 'Device Reports & Analytics',
        'Bahasa Melayu': 'Laporan & Analitik Peranti',
        '中文': '设备报告与分析'
    },
    'reports.subtitle': {
        'English': 'Comprehensive uptime statistics, performance metrics, and incident reports',
        'Bahasa Melayu': 'Statistik masa aktif, metrik prestasi, dan laporan insiden yang komprehensif',
        '中文': '全面的正常运行时间统计、性能指标和事件报告'
    },
    'reports.export': {
        'English': 'Export CSV',
        'Bahasa Melayu': 'Eksport CSV',
        '中文': '导出CSV'
    },
    'reports.print': {
        'English': 'Print Report',
        'Bahasa Melayu': 'Cetak Laporan',
        '中文': '打印报告'
    },
    'reports.avgUptime': {
        'English': 'Average Uptime',
        'Bahasa Melayu': 'Purata Masa Aktif',
        '中文': '平均正常运行时间'
    },
    'reports.totalIncidents': {
        'English': 'Total Incidents',
        'Bahasa Melayu': 'Jumlah Insiden',
        '中文': '总事件数'
    },
    'reports.totalDowntime': {
        'English': 'Total Downtime',
        'Bahasa Melayu': 'Jumlah Masa Tidak Aktif',
        '中文': '总停机时间'
    },
    'reports.devicesMonitored': {
        'English': 'Devices Monitored',
        'Bahasa Melayu': 'Peranti Dipantau',
        '中文': '监控设备'
    },

    // Maps
    'maps.title': {
        'English': 'Interactive Device Map',
        'Bahasa Melayu': 'Peta Peranti Interaktif',
        '中文': '互动设备地图'
    },
    'maps.subtitle': {
        'English': 'Real-time visualization of network infrastructure locations',
        'Bahasa Melayu': 'Visualisasi masa nyata lokasi infrastruktur rangkaian',
        '中文': '网络基础设施位置的实时可视化'
    },
    'maps.search': {
        'English': 'Search locations or devices...',
        'Bahasa Melayu': 'Cari lokasi atau peranti...',
        '中文': '搜索位置或设备...'
    },
    'maps.filter': {
        'English': 'Filter',
        'Bahasa Melayu': 'Tapis',
        '中文': '过滤器'
    },
    'maps.style': {
        'English': 'Style',
        'Bahasa Melayu': 'Gaya',
        '中文': '样式'
    },
    'maps.street': {
        'English': 'Street',
        'Bahasa Melayu': 'Jalan',
        '中文': '街道'
    },
    'maps.satellite': {
        'English': 'Satellite',
        'Bahasa Melayu': 'Satelit',
        '中文': '卫星'
    },
    'maps.dark': {
        'English': 'Dark',
        'Bahasa Melayu': 'Gelap',
        '中文': '暗色'
    },

    // Settings
    'settings.title': {
        'English': 'System Settings',
        'Bahasa Melayu': 'Tetapan Sistem',
        '中文': '系统设置'
    },
    'settings.subtitle': {
        'English': 'Configure monitoring preferences, notifications, and system behavior',
        'Bahasa Melayu': 'Konfigurasikan keutamaan pemantauan, pemberitahuan, dan tingkah laku sistem',
        '中文': '配置监控首选项、通知和系统行为'
    },
    'settings.general': {
        'English': 'General Settings',
        'Bahasa Melayu': 'Tetapan Am',
        '中文': '常规设置'
    },
    'settings.theme': {
        'English': 'Theme Preference',
        'Bahasa Melayu': 'Keutamaan Tema',
        '中文': '主题偏好'
    },
    'settings.light': {
        'English': 'Light',
        'Bahasa Melayu': 'Cerah',
        '中文': '浅色'
    },
    'settings.dark': {
        'English': 'Dark',
        'Bahasa Melayu': 'Gelap',
        '中文': '暗色'
    },
    'settings.system': {
        'English': 'System',
        'Bahasa Melayu': 'Sistem',
        '中文': '系统'
    },
    'settings.language': {
        'English': 'Language',
        'Bahasa Melayu': 'Bahasa',
        '中文': '语言'
    },
    'settings.timezone': {
        'English': 'Timezone',
        'Bahasa Melayu': 'Zon Masa',
        '中文': '时区'
    },
    'settings.save': {
        'English': 'Save Changes',
        'Bahasa Melayu': 'Simpan Perubahan',
        '中文': '保存更改'
    },
    'settings.reset': {
        'English': 'Reset to Defaults',
        'Bahasa Melayu': 'Set Semula ke Lalai',
        '中文': '重置为默认值'
    },
    'settings.saved': {
        'English': 'Settings saved successfully!',
        'Bahasa Melayu': 'Tetapan berjaya disimpan!',
        '中文': '设置保存成功！'
    },

    // Configuration
    'config.title': {
        'English': 'Configuration Panel',
        'Bahasa Melayu': 'Panel Konfigurasi',
        '中文': '配置面板'
    },
    'config.subtitle': {
        'English': 'Manage devices, alerts, users, and system settings',
        'Bahasa Melayu': 'Urus peranti, amaran, pengguna, dan tetapan sistem',
        '中文': '管理设备、警报、用户和系统设置'
    },
    'config.login': {
        'English': 'Login',
        'Bahasa Melayu': 'Log Masuk',
        '中文': '登录'
    },
    'config.logout': {
        'English': 'Logout',
        'Bahasa Melayu': 'Log Keluar',
        '中文': '登出'
    },
    'config.username': {
        'English': 'Username',
        'Bahasa Melayu': 'Nama Pengguna',
        '中文': '用户名'
    },
    'config.password': {
        'English': 'Password',
        'Bahasa Melayu': 'Kata Laluan',
        '中文': '密码'
    },

    // Common
    'common.status': {
        'English': 'Status',
        'Bahasa Melayu': 'Status',
        '中文': '状态'
    },
    'common.location': {
        'English': 'Location',
        'Bahasa Melayu': 'Lokasi',
        '中文': '位置'
    },
    'common.category': {
        'English': 'Category',
        'Bahasa Melayu': 'Kategori',
        '中文': '类别'
    },
    'common.uptime': {
        'English': 'Uptime',
        'Bahasa Melayu': 'Masa Aktif',
        '中文': '正常运行时间'
    },
    'common.downtime': {
        'English': 'Downtime',
        'Bahasa Melayu': 'Masa Tidak Aktif',
        '中文': '停机时间'
    },
    'common.devices': {
        'English': 'devices',
        'Bahasa Melayu': 'peranti',
        '中文': '设备'
    },
    'common.cancel': {
        'English': 'Cancel',
        'Bahasa Melayu': 'Batal',
        '中文': '取消'
    },
    'common.save': {
        'English': 'Save',
        'Bahasa Melayu': 'Simpan',
        '中文': '保存'
    },
    'common.delete': {
        'English': 'Delete',
        'Bahasa Melayu': 'Padam',
        '中文': '删除'
    },
    'common.edit': {
        'English': 'Edit',
        'Bahasa Melayu': 'Edit',
        '中文': '编辑'
    },

    // Devices - Category descriptions
    'devices.switchDesc': {
        'English': 'Core network backbone equipment of UTHM',
        'Bahasa Melayu': 'Peralatan nadi utama rangkaian UTHM',
        '中文': 'UTHM核心网络设备'
    },
    'devices.serverDesc': {
        'English': 'Application and Web systems for UTHM users',
        'Bahasa Melayu': 'Sistem aplikasi dan Web untuk kegunaan pengguna UTHM',
        '中文': '供UTHM用户使用的应用程序和Web系统'
    },
    'devices.wifiDesc': {
        'English': 'WiFi facilities provided throughout UTHM campus',
        'Bahasa Melayu': 'Kemudahan wifi yang disediakan untuk seluruh kawasan UTHM',
        '中文': '整个UTHM校园提供的WiFi设施'
    },
    'devices.tasDesc': {
        'English': 'UTHM attendance system equipment',
        'Bahasa Melayu': 'Peralatan sistem kehadiran UTHM',
        '中文': 'UTHM考勤系统设备'
    },
    'devices.pagohDesc': {
        'English': 'SF Pagoh Campus',
        'Bahasa Melayu': 'Kampus SF Pagoh',
        '中文': 'SF Pagoh校区'
    },
    'devices.cctvDesc': {
        'English': 'CCTV monitoring system',
        'Bahasa Melayu': 'Pemantauan CCTV',
        '中文': 'CCTV监控系统'
    },

    // Branch selector
    'branch.select': {
        'English': 'Select Branch',
        'Bahasa Melayu': 'Pilih Cawangan',
        '中文': '选择分支'
    },
    'branch.current': {
        'English': 'Current Branch',
        'Bahasa Melayu': 'Cawangan Semasa',
        '中文': '当前分支'
    },
    'branch.locations': {
        'English': 'locations',
        'Bahasa Melayu': 'lokasi',
        '中文': '位置'
    },

};

interface I18nContextType {
    t: (key: string) => string;
    language: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const { settings } = useSettings();

    const t = (key: string): string => {
        const translation = translations[key];
        if (!translation) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }
        return translation[settings.language] || translation['English'] || key;
    };

    return (
        <I18nContext.Provider value={{ t, language: settings.language }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}
