import MonitorLayout from '@/layouts/monitor-layout';
import { AlertTriangle, CheckCircle2, Clock, FileText, Printer, TrendingDown, TrendingUp, WifiOff, Download, Calendar, BarChart3, PieChart, Activity, Server, Shield, XCircle, Target, FileSpreadsheet, FileClock, Mail, CheckSquare, Square, User, Settings, History, Trash2, Edit, Plus, X } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useTranslation } from '@/contexts/i18n-context';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import type { CurrentBranch } from '@/types/branch';
import { getDeviceCategoryIcon } from '@/utils/device-icons';

// Helper function to format uptime duration from minutes
const formatUptimeDuration = (uptimeMinutes: number): string => {
    if (uptimeMinutes === 0) return '0m';
    
    const minutes = uptimeMinutes;
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    
    if (weeks > 0) {
        const remainingDays = days % 7;
        return remainingDays > 0 ? `${weeks}w ${remainingDays}d` : `${weeks}w`;
    } else if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
        return `${minutes}m`;
    }
};

// Format offline duration with rounding up and conversion to hours/days
const formatOfflineDuration = (minutes: number | undefined): string => {
    if (minutes === undefined || minutes <= 0) {
        return '0 minutes';
    }

    // Round up to the nearest minute
    const roundedMinutes = Math.ceil(minutes);

    // If less than 60 minutes, return in minutes
    if (roundedMinutes < 60) {
        return `${roundedMinutes} minute${roundedMinutes !== 1 ? 's' : ''}`;
    }

    // Convert to hours
    const hours = Math.floor(roundedMinutes / 60);
    const remainingMinutes = roundedMinutes % 60;

    // If less than 24 hours, return in hours (and minutes if any)
    if (hours < 24) {
        if (remainingMinutes > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        }
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    // Convert to days
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours > 0) {
        return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }

    return `${days} day${days !== 1 ? 's' : ''}`;
};

// Debounce hook for performance optimization
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

interface DeviceEvent {
    id: string;
    deviceName: string;
    deviceIp: string;
    eventType: 'up' | 'down';
    timestamp: Date;
    duration?: string;
    category: string;
}

interface UptimeStat {
    device: string;
    ip_address?: string;
    status?: string;
    uptime: number;
    downtime: string;
    incidents: number;
    category: string;
    lastIncident?: string;
}

interface SLADevice {
    device: string;
    ip_address: string;
    category: string;
    status: string;
    sla_target: number;
    actual_uptime: number;
    is_compliant: boolean;
    compliance_gap: number;
    allowed_downtime_hours: number;
    actual_downtime_hours: number;
    downtime_violation_hours: number;
    incidents: number;
    sla_violations: number;
    mttr_hours: number;
    mtbf_days: number;
    last_incident: string;
}

interface SLASummary {
    total_devices: number;
    compliant_devices: number;
    non_compliant_devices: number;
    compliance_rate: number;
    avg_uptime: number;
    avg_sla_target: number;
    total_incidents: number;
    total_violations: number;
    total_allowed_downtime_hours: number;
    total_actual_downtime_hours: number;
    total_downtime_violation_hours: number;
    avg_mttr_hours: number;
    avg_mtbf_days: number;
    date_range: {
        start: string;
        end: string;
        total_days: number;
    };
}

export default function Reports() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const { props } = usePage<PageProps>();
    const { currentBranch } = props;
    
    const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'custom'>('generate');
    const [dateRange, setDateRange] = useState('7days');
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Multi-select categories for report generation
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
    const [selectedManagedBy, setSelectedManagedBy] = useState<string[]>([]);
    const [availableUsers, setAvailableUsers] = useState<Array<{id: number, name: string, email: string}>>([]);
    const [uptimeStats, setUptimeStats] = useState<UptimeStat[]>([]);
    const [deviceEvents, setDeviceEvents] = useState<DeviceEvent[]>([]);
    const [categoryStatsData, setCategoryStatsData] = useState<any[]>([]);
    const [alertSummary, setAlertSummary] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [slaData, setSlaData] = useState<SLADevice[]>([]);
    const [slaSummary, setSlaSummary] = useState<SLASummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSlaLoading, setIsSlaLoading] = useState(false);
    const [uptimePage, setUptimePage] = useState(1);
    const [slaPage, setSlaPage] = useState(1);
    const itemsPerPage = 50; // Limit rows per page for better performance
    
    // Report generation states
    const [reportType, setReportType] = useState<'uptime' | 'client_session' | 'device_summary' | 'rf_health' | string>('uptime');
    const [reportName, setReportName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportFormat, setReportFormat] = useState<'xlsx' | 'pdf'>('xlsx');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');
    
    // Report history and custom reports
    const [reportHistory, setReportHistory] = useState<any[]>([]);
    const [customReports, setCustomReports] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingCustom, setIsLoadingCustom] = useState(false);
    
    // Custom report builder state
    const [showCustomBuilder, setShowCustomBuilder] = useState(false);
    const [editingCustomReport, setEditingCustomReport] = useState<any>(null);
    const [customReportForm, setCustomReportForm] = useState({
        name: '',
        description: '',
        included_fields: [] as string[],
        included_metrics: [] as string[],
        filters: {
            categories: [] as string[],
            managed_by: [] as string[],
        },
        summary_config: {
            show_avg_uptime: true,
            show_avg_sla: true,
            show_total_devices: true,
            show_total_incidents: true,
        },
    });
    
    // Available fields and metrics for custom reports
    const availableFields = [
        { id: 'device_name', label: 'Device Name' },
        { id: 'ip_address', label: 'IP Address' },
        { id: 'category', label: 'Category' },
        { id: 'status', label: 'Status' },
        { id: 'location', label: 'Location' },
        { id: 'managed_by', label: 'Managed By' },
    ];
    
    const availableMetrics = [
        { id: 'uptime', label: 'Uptime %' },
        { id: 'sla_compliance', label: 'SLA Compliance' },
        { id: 'incidents', label: 'Incidents' },
        { id: 'downtime', label: 'Downtime' },
        { id: 'response_time', label: 'Response Time' },
    ];

    // Debounce category and date range changes to avoid excessive API calls
    const debouncedCategory = useDebounce(selectedCategory, 300);
    const debouncedDateRange = useDebounce(dateRange, 300);

    // Fetch real data from API - OPTIMIZED: Parallel requests
    useEffect(() => {
        if (!currentBranch?.id || activeTab !== 'uptime') return;
        
        setIsLoading(true);
        
        // Fetch all data in parallel for better performance
        const baseUrl = `/api/reports`;
        const params = `branch_id=${currentBranch.id}&date_range=${debouncedDateRange}&category=${debouncedCategory}`;
        
        Promise.all([
            fetch(`${baseUrl}/summary?${params}`).then(res => res.json()).catch(() => null),
            fetch(`${baseUrl}/uptime-stats?${params}`).then(res => res.json()).catch(() => null),
            fetch(`${baseUrl}/device-events?branch_id=${currentBranch.id}&date_range=${debouncedDateRange}&limit=50`).then(res => res.json()).catch(() => null),
            fetch(`${baseUrl}/category-stats?branch_id=${currentBranch.id}`).then(res => res.json()).catch(() => null),
            fetch(`${baseUrl}/alert-summary?branch_id=${currentBranch.id}&date_range=${debouncedDateRange}`).then(res => res.json()).catch(() => null),
        ]).then(([summaryData, uptimeData, eventsData, categoryData, alertData]) => {
            if (summaryData) setSummary(summaryData);
            if (uptimeData) setUptimeStats(uptimeData);
            if (eventsData) {
                const events = eventsData.map((event: any) => ({
                    ...event,
                    timestamp: new Date(event.timestamp)
                }));
                setDeviceEvents(events);
            }
            if (categoryData) setCategoryStatsData(categoryData);
            if (alertData) setAlertSummary(alertData);
        }).catch(err => {
            console.error('Error fetching reports:', err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [currentBranch?.id, debouncedDateRange, debouncedCategory, activeTab]);

    // Fetch report history when history tab is active
    useEffect(() => {
        if (activeTab === 'history' && currentBranch?.id) {
            setIsLoadingHistory(true);
            fetch(`/api/reports/history?branch_id=${currentBranch.id}&limit=100`)
                .then(res => res.json())
                .then(data => {
                    setReportHistory(data);
                })
                .catch(err => {
                    console.error('Error fetching report history:', err);
                    setReportHistory([]);
                })
                .finally(() => {
                    setIsLoadingHistory(false);
                });
        }
    }, [activeTab, currentBranch?.id]);

    // Fetch custom reports when custom tab is active
    useEffect(() => {
        if (activeTab === 'custom' && currentBranch?.id) {
            setIsLoadingCustom(true);
            fetch(`/api/reports/custom?branch_id=${currentBranch.id}`)
                .then(res => res.json())
                .then(data => {
                    setCustomReports(data);
                })
                .catch(err => {
                    console.error('Error fetching custom reports:', err);
                    setCustomReports([]);
                })
                .finally(() => {
                    setIsLoadingCustom(false);
                });
        }
    }, [activeTab, currentBranch?.id]);

    // Fetch users for email selection and custom report builder
    useEffect(() => {
        if (activeTab === 'generate' || showCustomBuilder) {
            fetch('/api/users', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setAvailableUsers(data))
            .catch(err => {
                console.error('Error loading users:', err);
                setAvailableUsers([]);
            });
        }
    }, [activeTab, showCustomBuilder]);

    // Fetch SLA report data - OPTIMIZED: Use debounced values
    useEffect(() => {
        if (!currentBranch?.id || activeTab !== 'sla') return;
        
        setIsSlaLoading(true);
        // SLA reports need longer periods for meaningful metrics, use 30 days minimum
        const slaDateRange = debouncedDateRange === '24hours' ? '30days' : debouncedDateRange;
        
        fetch(`/api/reports/sla-report?branch_id=${currentBranch.id}&date_range=${slaDateRange}&category=${debouncedCategory}`)
            .then(res => res.json())
            .then(data => {
                setSlaData(data.devices || []);
                setSlaSummary(data.summary || null);
            })
            .catch(err => console.error('Error fetching SLA report:', err))
            .finally(() => setIsSlaLoading(false));
    }, [currentBranch?.id, debouncedDateRange, debouncedCategory, activeTab]);

    // Memoize filtered stats to avoid recalculation on every render
    const filteredStats = useMemo(() => {
        return selectedCategory === 'all' 
            ? uptimeStats 
            : uptimeStats.filter(stat => stat.category === selectedCategory);
    }, [uptimeStats, selectedCategory]);

    const categories = ['all', 'switches', 'servers', 'wifi', 'tas', 'cctv'];

    // Memoize category statistics calculation
    const categoryStats = useMemo(() => ({
        switches: uptimeStats.filter(s => s.category?.toLowerCase() === 'switches' || s.category === 'Switches'),
        servers: uptimeStats.filter(s => s.category?.toLowerCase() === 'servers' || s.category === 'Servers'),
        wifi: uptimeStats.filter(s => s.category?.toLowerCase() === 'wifi' || s.category === 'WiFi'),
        tas: uptimeStats.filter(s => s.category?.toLowerCase() === 'tas' || s.category === 'TAS'),
        cctv: uptimeStats.filter(s => s.category?.toLowerCase() === 'cctv' || s.category === 'CCTV'),
    }), [uptimeStats]);

    // Memoize sorted stats for table
    const sortedStats = useMemo(() => {
        return [...filteredStats].sort((a, b) => b.uptime - a.uptime);
    }, [filteredStats]);

    // Memoize paginated uptime stats
    const paginatedUptimeStats = useMemo(() => {
        const start = (uptimePage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return sortedStats.slice(start, end);
    }, [sortedStats, uptimePage]);

    const totalUptimePages = useMemo(() => {
        return Math.ceil(sortedStats.length / itemsPerPage);
    }, [sortedStats.length]);

    // Memoize sorted SLA data
    const sortedSlaData = useMemo(() => {
        return [...slaData].sort((a, b) => (a.is_compliant === b.is_compliant ? 0 : a.is_compliant ? 1 : -1));
    }, [slaData]);

    // Memoize paginated SLA data
    const paginatedSlaData = useMemo(() => {
        const start = (slaPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return sortedSlaData.slice(start, end);
    }, [sortedSlaData, slaPage]);

    const totalSlaPages = useMemo(() => {
        return Math.ceil(sortedSlaData.length / itemsPerPage);
    }, [sortedSlaData.length]);

    const getUptimeClass = (uptime: number) => {
        if (uptime >= 99.9) return 'excellent';
        if (uptime >= 99.5) return 'good';
        if (uptime >= 99) return 'fair';
        return 'poor';
    };

    const getUptimeColors = (uptime: number) => {
        if (uptime >= 99.9) return { 
            bg: 'bg-emerald-50 dark:bg-emerald-950/20', 
            text: 'text-emerald-700 dark:text-emerald-400',
            bar: 'bg-emerald-500',
            badge: 'bg-emerald-100 dark:bg-emerald-900/30'
        };
        if (uptime >= 99.5) return { 
            bg: 'bg-green-50 dark:bg-green-950/20', 
            text: 'text-green-700 dark:text-green-400',
            bar: 'bg-green-500',
            badge: 'bg-green-100 dark:bg-green-900/30'
        };
        if (uptime >= 99) return { 
            bg: 'bg-amber-50 dark:bg-amber-950/20', 
            text: 'text-amber-700 dark:text-amber-400',
            bar: 'bg-amber-500',
            badge: 'bg-amber-100 dark:bg-amber-900/30'
        };
        return { 
            bg: 'bg-red-50 dark:bg-red-950/20', 
            text: 'text-red-700 dark:text-red-400',
            bar: 'bg-red-500',
            badge: 'bg-red-100 dark:bg-red-900/30'
        };
    };

    // Toggle category selection for multi-select
    const toggleCategory = (category: string) => {
        if (category === 'all') {
            // If "all" is selected, clear other selections
            setSelectedCategories([]);
        } else {
            setSelectedCategories(prev => {
                if (prev.includes(category)) {
                    // Remove category
                    return prev.filter(c => c !== category);
                } else {
                    // Add category
                    return [...prev, category];
                }
            });
        }
    };

    // Show modal helper
    const showModalMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setModalMessage(message);
        setModalType(type);
        setShowModal(true);
    };

    // Generate custom report based on selected parameters
    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            showModalMessage('Please select both start and end date/time', 'error');
            return;
        }

        if (selectedCategories.length === 0) {
            showModalMessage('Please select at least one category', 'error');
            return;
        }

        setIsGenerating(true);
        try {
            const params = new URLSearchParams({
                branch_id: currentBranch.id.toString(),
                start_date: startDate,
                end_date: endDate,
                report_type: reportType,
                format: reportFormat,
            });
            
            // Add custom report name if provided
            if (reportName) {
                params.append('report_name', reportName);
            }

            // Add multiple categories
            selectedCategories.forEach(category => {
                params.append('categories[]', category);
            });

            // Add managed_by filter if selected (multiple users)
            if (selectedManagedBy.length > 0) {
                selectedManagedBy.forEach(userId => {
                    params.append('managed_by[]', userId);
                });
            }

            // Add email recipients if selected (multiple)
            if (selectedUserEmails.length > 0) {
                selectedUserEmails.forEach(email => {
                    params.append('email[]', email);
                });
            }

            const response = await fetch(`/api/reports/generate?${params}`);
            
            // Check response status first
            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = `Failed to generate report (${response.status})`;
                try {
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.message || errorMessage;
                    } else {
                        const text = await response.text();
                        if (text) {
                            // Try to extract error from HTML or plain text
                            errorMessage = text.length > 200 ? text.substring(0, 200) + '...' : text;
                        }
                    }
                } catch (e) {
                    // If we can't parse the error, use default message
                    console.error('Error parsing error response:', e);
                }
                showModalMessage(errorMessage, 'error');
                return;
            }
            
            // Check if response is a file download (XLSX or PDF)
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || 
                contentType.includes('application/pdf') ||
                contentType.includes('application/octet-stream')) {
                // Handle file download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Get filename from Content-Disposition header or generate one
                const contentDisposition = response.headers.get('content-disposition');
                let filename = `report_${reportType}_${startDate}_to_${endDate}.${reportFormat}`;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }
                
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                showModalMessage('Report downloaded successfully!', 'success');
                
                // Refresh report history after generating
                fetch(`/api/reports/history?branch_id=${currentBranch.id}&limit=100`)
                    .then(res => res.ok ? res.json() : [])
                    .then(data => {
                        setReportHistory(data);
                    })
                    .catch(err => {
                        console.error('Error fetching report history:', err);
                    });
            } else {
                // Handle JSON response (email sent or error)
                try {
                    const text = await response.text();
                    if (!text || text.trim() === '') {
                        showModalMessage('Report generated successfully!', 'success');
                        // Refresh report history
                        fetch(`/api/reports/history?branch_id=${currentBranch.id}&limit=100`)
                            .then(res => res.ok ? res.json() : [])
                            .then(data => {
                                setReportHistory(data);
                            })
                            .catch(err => {
                                console.error('Error fetching report history:', err);
                            });
                        return;
                    }
                    
                    const data = JSON.parse(text);
                    
                    if (data.error) {
                        showModalMessage(data.error, 'error');
                } else if (selectedUserEmails.length > 0) {
                    // If email was sent, show success message
                    if (data.message) {
                        const emailList = selectedUserEmails.length === 1 
                            ? selectedUserEmails[0]
                            : `${selectedUserEmails.length} recipients`;
                        showModalMessage(`Report generated and sent to ${emailList}`, 'success');
                    } else if (data.error) {
                        showModalMessage(`Report generated but email failed: ${data.message || data.error}`, 'error');
                    }
                } else {
                    showModalMessage('Report generated successfully!', 'success');
                }
                    
                    // Refresh report history after generating
                    fetch(`/api/reports/history?branch_id=${currentBranch.id}&limit=100`)
                        .then(res => res.ok ? res.json() : [])
                        .then(data => {
                            setReportHistory(data);
                        })
                        .catch(err => {
                            console.error('Error fetching report history:', err);
                        });
                } catch (parseError) {
                    console.error('Error parsing JSON response:', parseError);
                    showModalMessage('Report generated but received invalid response from server', 'error');
                }
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            showModalMessage(error.message || 'Failed to generate report. Please try again.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadReport = (data: any, type: string) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const branchName = currentBranch.name.replace(/[^a-zA-Z0-9]/g, '_');
        const reportName = type.charAt(0).toUpperCase() + type.slice(1);
        
        const csvContent = generateCSVContent(data, type);
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `UTHM_${reportName}_Report_${branchName}_${startDate}_to_${endDate}_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const generateCSVContent = (data: any, type: string) => {
        const separator = '='.repeat(80);
        const header = [
            [separator],
            ['UTHM HOST MONITORING SYSTEM'],
            [`${type.toUpperCase()} REPORT`],
            [separator],
            [''],
            ['Report Information'],
            ['---'],
            ['Generated Date & Time:', new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })],
            ['Branch:', `${currentBranch.name} (${currentBranch.code})`],
            ['Report Period:', `${startDate} to ${endDate}`],
            ['Category Filter:', selectedCategory === 'all' ? 'All Devices' : selectedCategory],
            ['Report Type:', type.charAt(0).toUpperCase() + type.slice(1)],
            [''],
        ];

        // Add data based on report type
        let content: any[] = [];
        if (type === 'uptime' && data.devices) {
            content = [
                [separator],
                ['UPTIME STATISTICS'],
                [separator],
                ['Device Name', 'IP Address', 'Category', 'Uptime %', 'Downtime', 'Incidents', 'Last Incident'],
                ['---', '---', '---', '---', '---', '---', '---'],
                ...data.devices.map((d: any) => [
                    d.device, d.ip_address || 'N/A', d.category, `${d.uptime}%`, 
                    d.downtime, d.incidents, d.lastIncident || 'Never'
                ])
            ];
        } else if (type === 'sla' && data.devices) {
            content = [
                [separator],
                ['SLA COMPLIANCE REPORT'],
                [separator],
                ['Device Name', 'IP Address', 'SLA Target %', 'Actual Uptime %', 'Compliant', 'MTTR (hrs)', 'MTBF (days)', 'Violations'],
                ['---', '---', '---', '---', '---', '---', '---', '---'],
                ...data.devices.map((d: any) => [
                    d.device, d.ip_address || 'N/A', d.sla_target, d.actual_uptime, d.is_compliant ? 'Yes' : 'No',
                    d.mttr_hours, d.mtbf_days, d.sla_violations
                ])
            ];
        } else if (type === 'incidents' && data.events) {
            content = [
                [separator],
                ['INCIDENT REPORT'],
                [separator],
                ['Device Name', 'IP Address', 'Event Type', 'Timestamp', 'Category'],
                ['---', '---', '---', '---', '---'],
                ...data.events.map((e: any) => [
                    e.deviceName, e.deviceIp, e.eventType, new Date(e.timestamp).toLocaleString(), e.category
                ])
            ];
        } else if (type === 'comprehensive') {
            // Comprehensive report combines all sections
            content = [
                [separator],
                ['SECTION 1: UPTIME STATISTICS'],
                [separator],
                ['Device Name', 'IP Address', 'Category', 'Uptime %', 'Downtime', 'Incidents', 'Last Incident'],
                ['---', '---', '---', '---', '---', '---', '---'],
                ...(data.uptime?.devices || []).map((d: any) => [
                    d.device, d.ip_address || 'N/A', d.category, `${d.uptime}%`, 
                    d.downtime, d.incidents, d.lastIncident || 'Never'
                ]),
                [''],
                [separator],
                ['SECTION 2: SLA COMPLIANCE'],
                [separator],
                ['Device Name', 'IP Address', 'SLA Target %', 'Actual Uptime %', 'Compliant', 'MTTR (hrs)', 'MTBF (days)', 'Violations'],
                ['---', '---', '---', '---', '---', '---', '---', '---'],
                ...(data.sla?.devices || []).map((d: any) => [
                    d.device, d.ip_address || 'N/A', d.sla_target, d.actual_uptime, d.is_compliant ? 'Yes' : 'No',
                    d.mttr_hours, d.mtbf_days, d.sla_violations
                ]),
                [''],
                [separator],
                ['SECTION 3: INCIDENT LOG'],
                [separator],
                ['Device Name', 'IP Address', 'Event Type', 'Timestamp', 'Category'],
                ['---', '---', '---', '---', '---'],
                ...(data.incidents?.events || []).slice(0, 100).map((e: any) => [
                    e.deviceName, e.deviceIp, e.eventType, new Date(e.timestamp).toLocaleString(), e.category
                ])
            ];
        }

        const footer = [
            [''],
            [separator],
            ['END OF REPORT'],
            [separator],
        ];

        return [...header, ...content, ...footer].map(row => row.join(',')).join('\n');
    };

    const handleExport = () => {
        const dateRangeLabel = 
            dateRange === '24hours' ? 'Last 24 Hours' :
            dateRange === '7days' ? 'Last 7 Days' :
            dateRange === '30days' ? 'Last 30 Days' : 'Last 90 Days';
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const branchName = currentBranch.name.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Use real summary data from API (respects date range and category filters)
        const totalDevices = summary?.devicesMonitored || filteredStats.length;
        const avgUptime = summary?.avgUptime || (filteredStats.length > 0 
            ? (filteredStats.reduce((sum, stat) => sum + (stat.uptime || 0), 0) / filteredStats.length).toFixed(2)
            : '0.00');
        const totalIncidents = summary?.totalIncidents || filteredStats.reduce((sum, stat) => sum + stat.incidents, 0);
        const totalDowntime = summary?.totalDowntime?.formatted || '0m';
        
        // Use summary data for device counts (more efficient than loading all devices)
        const onlineDevices = summary?.onlineDevices || 0;
        const offlineDevices = summary?.offlineDevices || 0;
        const warningDevices = summary?.warningDevices || 0;
        const acknowledgedDevices = summary?.acknowledgedDevices || 0;

        // Category breakdown from API data (more efficient)
        const categoryBreakdown = {
            'Switches': (categoryStatsData as any)?.switches || 0,
            'Servers': (categoryStatsData as any)?.servers || 0,
            'WiFi': (categoryStatsData as any)?.wifi || 0,
            'TAS': (categoryStatsData as any)?.tas || 0,
            'CCTV': (categoryStatsData as any)?.cctv || 0,
        };

        // Build comprehensive CSV content with better formatting
        const separator = '='.repeat(80);
        const csvContent = [
            // Header section with styling
            [separator],
            ['UTHM HOST MONITORING SYSTEM'],
            ['DEVICE UPTIME & PERFORMANCE REPORT'],
            [separator],
            [''],
            ['Report Information'],
            ['---'],
            ['Generated Date & Time:', new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })],
            ['Branch:', `${currentBranch.name} (${currentBranch.code})`],
            ['Report Period:', dateRangeLabel],
            ['Category Filter:', selectedCategory === 'all' ? 'All Devices' : selectedCategory],
            ['Timezone:', 'Asia/Kuala_Lumpur (GMT+8)'],
            [''],
            
            // Executive Summary with borders
            [separator],
            ['EXECUTIVE SUMMARY'],
            [separator],
            ['Metric', 'Value', 'Percentage'],
            ['---', '---', '---'],
            ['Total Devices Monitored', totalDevices, '100%'],
            ['Online Devices', onlineDevices, `${((onlineDevices/totalDevices)*100).toFixed(1)}%`],
            ['Offline Devices', offlineDevices, `${((offlineDevices/totalDevices)*100).toFixed(1)}%`],
            ['Warning Devices', warningDevices, `${((warningDevices/totalDevices)*100).toFixed(1)}%`],
            ['Acknowledged Offline', acknowledgedDevices, `${((acknowledgedDevices/totalDevices)*100).toFixed(1)}%`],
            ['Average Uptime', `${avgUptime}%`, ''],
            ['Total Incidents', totalIncidents, ''],
            ['Total Downtime', totalDowntime, `${summary?.totalDowntime?.percentage || 0}%`],
            [''],

            // Category Distribution with borders
            [separator],
            ['DEVICE DISTRIBUTION BY CATEGORY'],
            [separator],
            ['Category', 'Device Count', 'Percentage', 'Status'],
            ['---', '---', '---', '---'],
            ...Object.entries(categoryBreakdown).map(([cat, count]) => 
                [cat, count, `${((count/totalDevices)*100).toFixed(1)}%`, count > 0 ? 'Active' : 'No Devices']
            ),
            [''],

            // Detailed Device Information
            [separator],
            ['DETAILED DEVICE STATISTICS'],
            [separator],
            ['Device Name', 'IP Address', 'Category', 'Uptime %', 'Downtime', 'Incidents', 'Last Incident', 'Health Status'],
            ['---', '---', '---', '---', '---', '---', '---', '---'],
            ...filteredStats.sort((a, b) => b.uptime - a.uptime).map(stat => {
                const healthStatus = 
                    stat.uptime >= 99.9 ? 'EXCELLENT ★★★★★' :
                    stat.uptime >= 99.5 ? 'GOOD ★★★★' :
                    stat.uptime >= 99 ? 'FAIR ★★★' : 'POOR ★';
                
                return [
                    stat.device,
                    stat.ip_address || 'N/A',
                    stat.category,
                    `${stat.uptime}%`,
                    stat.downtime,
                    stat.incidents,
                    stat.lastIncident || 'Never',
                    healthStatus
                ];
            }),
            [''],

            // Category Performance Summary with enhanced formatting
            [separator],
            ['CATEGORY PERFORMANCE ANALYSIS'],
            [separator],
            ['Category', 'Device Count', 'Avg Uptime %', 'Total Incidents', 'Health Rating', 'Status'],
            ['---', '---', '---', '---', '---', '---'],
            ...Object.entries(categoryBreakdown).map(([category, count]) => {
                const categoryKey = category.toLowerCase();
                const categoryDevices = filteredStats.filter(s => 
                    s.category.toLowerCase() === categoryKey || 
                    (categoryKey === 'wifi' && s.category.toLowerCase() === 'wifi')
                );
                const avgCatUptime = categoryDevices.length > 0
                    ? (categoryDevices.reduce((sum, d) => sum + d.uptime, 0) / categoryDevices.length).toFixed(2)
                    : '0.00';
                const catIncidents = categoryDevices.reduce((sum, d) => sum + d.incidents, 0);
                const healthRating = 
                    parseFloat(avgCatUptime) >= 99.9 ? 'EXCELLENT ★★★★★' :
                    parseFloat(avgCatUptime) >= 99.5 ? 'GOOD ★★★★' :
                    parseFloat(avgCatUptime) >= 99 ? 'FAIR ★★★' : 'POOR ★';
                const status = count > 0 ? 'Operational' : 'No Devices';
                
                return [category, count, `${avgCatUptime}%`, catIncidents, healthRating, status];
            }),
            [''],

            // Critical Devices
            [separator],
            ['DEVICES REQUIRING ATTENTION (Uptime < 99%)'],
            [separator],
            ['Device Name', 'IP Address', 'Category', 'Uptime %', 'Status', 'Priority', 'Action Required'],
            ['---', '---', '---', '---', '---', '---', '---'],
            ...filteredStats.filter(stat => stat.uptime < 99).map(stat => {
                const priority = stat.uptime < 95 ? '🔴 CRITICAL' : stat.uptime < 97 ? '🟡 HIGH' : '🟢 MEDIUM';
                const action = stat.uptime < 95 ? 'IMMEDIATE ACTION REQUIRED' : stat.uptime < 97 ? 'INVESTIGATE SOON' : 'MONITOR CLOSELY';
                return [
                    stat.device,
                    stat.ip_address || 'N/A',
                    stat.category,
                    `${stat.uptime}%`,
                    stat.status?.toUpperCase() || 'UNKNOWN',
                    priority,
                    action
                ];
            }),
            [''],

            // Report Footer
            [separator],
            ['REPORT METADATA'],
            [separator],
            ['Field', 'Value'],
            ['---', '---'],
            ['Report Generated By', 'UTHM Host Monitoring System v6.0'],
            ['Report Type', 'Device Uptime & Performance Analysis'],
            ['Data Source', `${currentBranch.name} Branch Database`],
            ['Total Records', filteredStats.length],
            ['Export Timestamp', timestamp],
            ['Report ID', `RPT-${timestamp}`],
            [''],
            [separator],
            ['END OF REPORT'],
            [separator],
        ].map(row => row.join(',')).join('\n');

        // Create and download CSV file with BOM for Excel compatibility
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `UTHM_Device_Report_${branchName}_${dateRange}_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <MonitorLayout title={t('reports.title')}>
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300">
                            {t('reports.title')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('reports.subtitle')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <Download className="size-4" />
                            {t('reports.export')}
                        </button>
                    </div>
                </div>

                {/* Report Type Tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            activeTab === 'generate'
                                ? 'border-b-2 border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                    >
                        <FileSpreadsheet className="size-4" />
                        Generate Report
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            activeTab === 'history'
                                ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                    >
                        <History className="size-4" />
                        Report History
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            activeTab === 'custom'
                                ? 'border-b-2 border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Settings className="size-4" />
                        Custom Reports
                    </button>
                </div>

                {/* Generate Report Section */}
                {activeTab === 'generate' && (
                    <div className="space-y-6">
                        {/* Report Generator Card */}
                        <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                            <div className="border-b border-slate-200/50 bg-gradient-to-r from-emerald-50 to-green-50 p-6 dark:border-slate-700/50 dark:from-emerald-950/30 dark:to-green-950/30">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-2 shadow-lg">
                                        <FileSpreadsheet className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Custom Report Generator
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Generate custom reports based on specific date ranges and report types
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Custom Report Name */}
                                <div>
                                    <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <FileText className="size-4" />
                                        Report Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={reportName}
                                        onChange={(e) => setReportName(e.target.value)}
                                        placeholder="Enter a custom name for this report"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                    />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Leave empty to use default naming
                                    </p>
                                </div>
                                
                                {/* Report Format Selection */}
                                <div>
                                    <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <FileSpreadsheet className="size-4" />
                                        Report Format
                                    </label>
                                    <div className="flex gap-3">
                            <button
                                            type="button"
                                            onClick={() => setReportFormat('xlsx')}
                                            className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                                                reportFormat === 'xlsx'
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                            Excel (XLSX)
                            </button>
                            <button
                                            type="button"
                                            onClick={() => setReportFormat('pdf')}
                                            className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                                                reportFormat === 'pdf'
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                            PDF
                            </button>
                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {reportFormat === 'pdf' ? 'PDF format for easy viewing and printing' : 'Excel format for data analysis'}
                                    </p>
                </div>

                                {/* Date Range Selection */}
                            <div>
                                    <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <Calendar className="size-4" />
                                        Date Range Presets
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                                        {[
                                            { label: '2 Hours Ago', hours: 2 },
                                            { label: '6 Hours Ago', hours: 6 },
                                            { label: '12 Hours Ago', hours: 12 },
                                            { label: '24 Hours Ago', hours: 24 },
                                            { label: '2 Days Ago', days: 2 },
                                            { label: '3 Days Ago', days: 3 },
                                            { label: '7 Days Ago', days: 7 },
                                            { label: '14 Days Ago', days: 14 },
                                            { label: '30 Days Ago', days: 30 },
                                            { label: '60 Days Ago', days: 60 },
                                            { label: '90 Days Ago', days: 90 },
                                        ].map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => {
                                                    const now = new Date();
                                                    const start = new Date(now);
                                                    if (preset.hours) {
                                                        start.setHours(start.getHours() - preset.hours);
                                                    } else if (preset.days) {
                                                        start.setDate(start.getDate() - preset.days);
                                                    }
                                                    setStartDate(start.toISOString().slice(0, 16));
                                                    setEndDate(now.toISOString().slice(0, 16));
                                                }}
                                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                            </div>
                            </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <Calendar className="size-4" />
                                            Start Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                        />
                        </div>
                            <div>
                                        <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <FileClock className="size-4" />
                                            End Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                        />
                        </div>
                    </div>

                                {/* Report Type Selection */}
                            <div>
                                    <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <FileText className="size-4" />
                                        Report Type
                                    </label>
                                    <div className="overflow-x-auto">
                                        <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                                            {/* Prebuilt Report Types */}
                                            {[
                                                { value: 'uptime', label: 'Uptime Report', icon: BarChart3, desc: 'Device uptime statistics and performance' },
                                                { value: 'client_session', label: 'Client Session Report', icon: WifiOff, desc: 'WiFi client session data by SSID, VLAN, role, and more' },
                                                { value: 'device_summary', label: 'Device Summary', icon: Activity, desc: 'Device utilization by clients and usage' },
                                                { value: 'rf_health', label: 'RF Health Report', icon: WifiOff, desc: 'Radio frequency health metrics and statistics' },
                                            ].map((type) => {
                                                const Icon = type.icon;
                                                const isSelected = reportType === type.value;
                                                return (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => setReportType(type.value as any)}
                                                        className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all flex-shrink-0 w-48 ${
                                                            isSelected
                                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                                                : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700'
                                                        }`}
                                                    >
                                                        <div className={`rounded-lg p-2 ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                            <Icon className="size-5" />
                            </div>
                                                        <div>
                                                            <div className={`text-sm font-bold ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                                {type.label}
                            </div>
                                                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                                {type.desc}
                        </div>
                    </div>
                                                    </button>
                                                );
                                            })}
                                            
                                            {/* Custom Reports */}
                                            {customReports.map((custom) => (
                                                <button
                                                    key={custom.id}
                                                    onClick={() => setReportType(custom.id.toString())}
                                                    className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all flex-shrink-0 w-48 ${
                                                        reportType === custom.id.toString()
                                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                                                            : 'border-slate-200 bg-white hover:border-purple-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-purple-700'
                                                    }`}
                                                >
                                                    <div className={`rounded-lg p-2 ${reportType === custom.id.toString() ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        <Settings className="size-5" />
                                                    </div>
                            <div>
                                                        <div className={`text-sm font-bold ${reportType === custom.id.toString() ? 'text-purple-700 dark:text-purple-400' : 'text-slate-900 dark:text-white'}`}>
                                                            {custom.name}
                            </div>
                                                        {custom.description && (
                                                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                                {custom.description}
                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                        </div>
                    </div>
                </div>

                                {/* Multi-Select Category Filter */}
                                    <div>
                                    <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <Server className="size-4" />
                                        Device Categories (Select Multiple)
                                    </label>
                                    <div className="grid gap-3 grid-cols-5">
                                        {categories.filter(cat => cat !== 'all').map((category) => {
                                            const isSelected = selectedCategories.includes(category);
                                            const Icon = getDeviceCategoryIcon(category);
                                            return (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => toggleCategory(category)}
                                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                                            : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700'
                                                    }`}
                                                >
                                                    <div className={`flex-shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                        {isSelected ? <CheckSquare className="size-5" /> : <Square className="size-5" />}
                                    </div>
                                                    <div className={`rounded-lg p-2 ${isSelected ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                        <Icon className={`size-4 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`text-sm font-bold ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                </div>
                                        </div>
                                                </button>
                                            );
                                        })}
                                        </div>
                                    {selectedCategories.length > 0 && (
                                        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                            Selected: {selectedCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
                                    </div>
                                    )}
                                    </div>

                                {/* Managed By Selection (Multiple) */}
                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <User className="size-4" />
                                        Devices Managed By (Optional - Select Multiple)
                                    </label>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 dark:border-slate-700">
                                        {availableUsers.map((user) => {
                                            const isSelected = selectedManagedBy.includes(user.id.toString());
                                            return (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedManagedBy(selectedManagedBy.filter(id => id !== user.id.toString()));
                                                        } else {
                                                            setSelectedManagedBy([...selectedManagedBy, user.id.toString()]);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                                            : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900'
                                                    }`}
                                                >
                                                    {isSelected ? <CheckSquare className="size-3 text-emerald-600" /> : <Square className="size-3 text-slate-400" />}
                                                    <User className="size-3" />
                                                    <span className="text-xs font-medium">{user.name}</span>
                                                </button>
                        );
                    })}
                </div>
                                    {selectedManagedBy.length > 0 && (
                                        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                            Report will include devices managed by: {selectedManagedBy.map(id => availableUsers.find(u => u.id.toString() === id)?.name).filter(Boolean).join(', ')}
                                        </p>
                                    )}
                            </div>

                                {/* Email Recipient Selection (Multiple) */}
                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <Mail className="size-4" />
                                        Email Report To (Optional - Select Multiple)
                                    </label>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 dark:border-slate-700">
                                        {availableUsers.map((user) => {
                                            const isSelected = selectedUserEmails.includes(user.email);
                                    return (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedUserEmails(prev => prev.filter(e => e !== user.email));
                                                        } else {
                                                            setSelectedUserEmails(prev => [...prev, user.email]);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                            : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900'
                                                    }`}
                                                >
                                                    {isSelected ? <CheckSquare className="size-3" /> : <Square className="size-3 text-slate-400" />}
                                                    <Mail className="size-3" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-medium truncate">{user.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                                    </div>
                                    {selectedUserEmails.length > 0 && (
                                        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                            Report will be emailed to {selectedUserEmails.length} recipient{selectedUserEmails.length !== 1 ? 's' : ''}: {selectedUserEmails.map(email => availableUsers.find(u => u.email === email)?.name || email).join(', ')}
                                        </p>
                                    )}
                                                </div>

                                {/* Generate Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {startDate && endDate && selectedCategories.length > 0 ? (
                                            <span>
                                                Report will cover <strong>{startDate}</strong> to <strong>{endDate}</strong>
                                                {selectedCategories.length > 0 && (
                                                    <> for {selectedCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}</>
                                                )}
                                                {selectedManagedBy.length > 0 && (
                                                    <> managed by {selectedManagedBy.map(id => availableUsers.find(u => u.id.toString() === id)?.name).filter(Boolean).join(', ')}</>
                                                )}
                                                {selectedUserEmails.length > 0 && (
                                                    <> and email to {selectedUserEmails.length} recipient{selectedUserEmails.length !== 1 ? 's' : ''}</>
                                                )}
                                                </span>
                                        ) : (
                                            <span>
                                                {!startDate || !endDate ? 'Please select both start and end date/time' : 'Please select at least one category'}
                                                </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={!startDate || !endDate || selectedCategories.length === 0 || isGenerating}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                                        <>
                                                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                {selectedUserEmails.length > 0 ? 'Sending...' : 'Generating...'}
                                                        </>
                                                    ) : (
                                                        <>
                                                {selectedUserEmails.length > 0 ? <Mail className="size-4" /> : <Download className="size-4" />}
                                                {selectedUserEmails.length > 0 ? `Generate & Email Report${selectedUserEmails.length > 1 ? ` (${selectedUserEmails.length})` : ''}` : 'Generate Report'}
                                                        </>
                                                    )}
                                    </button>
                                </div>
                            </div>
                        </div>

                </div>
                )}

                {/* Report History Section */}
                {activeTab === 'history' && (
                    <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                    <div className="border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-slate-700/50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                                        <History className="size-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Report History
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                            View and download previously generated reports
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                                {isLoadingHistory ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block size-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
                                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading report history...</p>
                                        </div>
                                ) : reportHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="mx-auto size-12 text-slate-400" />
                                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">No reports generated yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {reportHistory.map((report) => {
                                            const startDate = new Date(report.start_date);
                                            const endDate = new Date(report.end_date);
                                            const createdDate = new Date(report.created_at);
                                            
                                            // Calculate duration
                                            const durationMs = endDate.getTime() - startDate.getTime();
                                            const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                                            const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                            const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                                            
                                            const formatDateTime = (date: Date) => {
                                                return {
                                                    date: date.toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric',
                                                        weekday: 'short'
                                                    }),
                                                    time: date.toLocaleTimeString('en-US', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit', 
                                                        second: '2-digit',
                                                        hour12: true
                                                    }),
                                                    full: date.toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        weekday: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: true,
                                                        timeZoneName: 'short'
                                                    }),
                                                    timestamp: date.getTime()
                                                };
                                            };
                                            
                                            const start = formatDateTime(startDate);
                                            const end = formatDateTime(endDate);
                                            const created = formatDateTime(createdDate);
                                            
                                            return (
                                                <div
                                                    key={report.id}
                                                    className="rounded-lg border border-slate-200 bg-white p-5 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                                                >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                            <div className="flex items-start gap-3">
                                                                <FileSpreadsheet className="size-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">
                                                                        {report.report_name || report.report_type}
                                                                    </h3>
                                                                    
                                                                    {/* Detailed Timestamps */}
                                                                    <div className="space-y-2 text-xs">
                                                                        {/* Report Period */}
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Report Period:</span>
                                                                            <div className="flex flex-wrap items-center gap-1">
                                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                                    <span className="font-medium">{start.date}</span>
                                                                                    {' '}at{' '}
                                                                                    <span className="font-medium">{start.time}</span>
                                                                                </span>
                                                                                <span className="text-slate-400 dark:text-slate-500">→</span>
                                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                                    <span className="font-medium">{end.date}</span>
                                                                                    {' '}at{' '}
                                                                                    <span className="font-medium">{end.time}</span>
                                                                                </span>
                                                        </div>
                                                                            <span className="text-slate-500 dark:text-slate-500">
                                                                                ({durationDays > 0 ? `${durationDays}d ` : ''}{durationHours > 0 ? `${durationHours}h ` : ''}{durationMinutes > 0 ? `${durationMinutes}m` : ''})
                                                                            </span>
                                                        </div>
                                                                        
                                                                        {/* Created Timestamp */}
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Generated:</span>
                                                                            <span className="text-slate-600 dark:text-slate-400">
                                                                                {created.full}
                                                                            </span>
                                                                            <span className="text-slate-500 dark:text-slate-500">
                                                                                ({Math.floor((Date.now() - created.timestamp) / 1000 / 60)} minutes ago)
                                                                            </span>
                                                    </div>
                                                                        
                                                                        {/* Additional Info */}
                                                                        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                                                                            {report.file_size && (
                                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                                    <span className="font-semibold">Size:</span> {(report.file_size / 1024).toFixed(2)} KB
                                                        </span>
                                                                            )}
                                                                            {report.email_sent_to && (
                                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                                    <span className="font-semibold">Sent to:</span> {report.email_sent_to}
                                                                                </span>
                                                                            )}
                                                                            {report.user && (
                                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                                    <span className="font-semibold">Generated by:</span> {report.user.name || report.user.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <button
                                                                onClick={() => {
                                                                    window.location.href = `/api/reports/history/${report.id}/download`;
                                                                }}
                                                                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600 flex items-center gap-1"
                                                            >
                                                                <Download className="size-4" />
                                                                Download
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm('Are you sure you want to delete this report?')) {
                                                                        try {
                                                                            const res = await fetch(`/api/reports/history/${report.id}`, {
                                                                                method: 'DELETE',
                                                                            });
                                                                            if (res.ok) {
                                                                                setReportHistory(reportHistory.filter(r => r.id !== report.id));
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Error deleting report:', err);
                                                                        }
                                                                    }
                                                                }}
                                                                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                                )}
                                    </div>
                                </div>
                            </div>
                        )}

                {/* Custom Reports Builder Section */}
                {activeTab === 'custom' && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800">
                            <div className="border-b border-slate-200/50 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-slate-700/50 dark:from-purple-950/30 dark:to-pink-950/30">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2 shadow-lg">
                                            <Settings className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Custom Report Builder
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Create and manage custom report templates
                                        </p>
                                    </div>
                                </div>
                                    <button
                                        onClick={() => {
                                            setEditingCustomReport(null);
                                            setCustomReportForm({
                                                name: '',
                                                description: '',
                                                included_fields: [],
                                                included_metrics: [],
                                                filters: {
                                                    categories: [],
                                                    managed_by: [],
                                                },
                                                summary_config: {
                                                    show_avg_uptime: true,
                                                    show_avg_sla: true,
                                                    show_total_devices: true,
                                                    show_total_incidents: true,
                                                },
                                            });
                                            setShowCustomBuilder(true);
                                        }}
                                        className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700"
                                                        >
                                        <Plus className="size-4" />
                                        Create Custom Report
                                    </button>
                                                                    </div>
                                                                    </div>

                            <div className="p-6">
                                {isLoadingCustom ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block size-8 animate-spin rounded-full border-4 border-slate-300 border-t-purple-600"></div>
                                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading custom reports...</p>
                                                                </div>
                                ) : customReports.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Settings className="mx-auto size-12 text-slate-400" />
                                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">No custom reports created yet</p>
                                                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {customReports.map((custom) => (
                                            <div
                                                key={custom.id}
                                                className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                                            {custom.name}
                                                        </h3>
                                                        {custom.description && (
                                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                                {custom.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {custom.included_fields && custom.included_fields.length > 0 && (
                                                                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                                    {custom.included_fields.length} Fields
                                                                </span>
                                                            )}
                                                            {custom.included_metrics && custom.included_metrics.length > 0 && (
                                                                <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                                                                    {custom.included_metrics.length} Metrics
                                                                </span>
                                                            )}
                            </div>
                                        </div>
                                                </div>
                                                <div className="mt-4 flex items-center gap-2">
                                            <button
                                                        onClick={() => {
                                                            setEditingCustomReport(custom);
                                                            setCustomReportForm({
                                                                name: custom.name,
                                                                description: custom.description || '',
                                                                included_fields: custom.included_fields || [],
                                                                included_metrics: custom.included_metrics || [],
                                                                filters: {
                                                                    categories: custom.filters?.categories || custom.categories || [],
                                                                    managed_by: Array.isArray(custom.filters?.managed_by) 
                                                                        ? custom.filters.managed_by.map(String)
                                                                        : custom.filters?.managed_by 
                                                                            ? [String(custom.filters.managed_by)]
                                                                            : custom.managed_by 
                                                                                ? [String(custom.managed_by)]
                                                                                : [],
                                                                },
                                                                summary_config: custom.summary_config || {
                                                                    show_avg_uptime: true,
                                                                    show_avg_sla: true,
                                                                    show_total_devices: true,
                                                                    show_total_incidents: true,
                                                                },
                                                            });
                                                            setShowCustomBuilder(true);
                                                        }}
                                                        className="flex-1 rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-all hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-950/50"
                                            >
                                                        <Edit className="size-4 inline mr-1" />
                                                        Edit
                                            </button>
                                            <button
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to delete this custom report?')) {
                                                                try {
                                                                    const res = await fetch(`/api/reports/custom/${custom.id}`, {
                                                                        method: 'DELETE',
                                                                    });
                                                                    if (res.ok) {
                                                                        setCustomReports(customReports.filter(r => r.id !== custom.id));
                                                                    }
                                                                } catch (err) {
                                                                    console.error('Error deleting custom report:', err);
                                                                }
                                                            }
                                                        }}
                                                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                                            >
                                                        <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                        ))}
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                )}

                {/* Custom Report Builder Modal */}
                {showCustomBuilder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                            <div className="sticky top-0 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-slate-700 dark:from-purple-950/30 dark:to-pink-950/30">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2 shadow-lg">
                                            <Settings className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                {editingCustomReport ? 'Edit Custom Report' : 'Create Custom Report'}
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Configure fields, metrics, and filters for your custom report
                                        </p>
                                    </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowCustomBuilder(false);
                                            setEditingCustomReport(null);
                                        }}
                                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                                    >
                                        <XCircle className="size-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Basic Information */}
                                    <div>
                                    <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Report Name *
                                        </label>
                                        <input
                                        type="text"
                                        value={customReportForm.name}
                                        onChange={(e) => setCustomReportForm({ ...customReportForm, name: e.target.value })}
                                        placeholder="e.g., Monthly Network Health Report"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                    <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Description
                                        </label>
                                    <textarea
                                        value={customReportForm.description}
                                        onChange={(e) => setCustomReportForm({ ...customReportForm, description: e.target.value })}
                                        placeholder="Describe what this report includes..."
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                        />
                                </div>

                                {/* Included Fields */}
                                <div>
                                    <label className="block mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Included Fields *
                                    </label>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {availableFields.map((field) => {
                                            const isSelected = customReportForm.included_fields.includes(field.id);
                                            return (
                                                <button
                                                    key={field.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setCustomReportForm({
                                                                ...customReportForm,
                                                                included_fields: customReportForm.included_fields.filter(f => f !== field.id),
                                                            });
                                                        } else {
                                                            setCustomReportForm({
                                                                ...customReportForm,
                                                                included_fields: [...customReportForm.included_fields, field.id],
                                                            });
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                                                        isSelected
                                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                                                            : 'border-slate-200 bg-white hover:border-purple-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-purple-700'
                                                    }`}
                                                >
                                                    {isSelected ? <CheckSquare className="size-4 text-purple-600 dark:text-purple-400" /> : <Square className="size-4 text-slate-400" />}
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-purple-700 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {field.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                                    </div>
                                                        </div>

                                {/* Included Metrics */}
                                <div>
                                    <label className="block mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Included Metrics *
                                    </label>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {availableMetrics.map((metric) => {
                                            const isSelected = customReportForm.included_metrics.includes(metric.id);
                                            return (
                                                <button
                                                    key={metric.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setCustomReportForm({
                                                                ...customReportForm,
                                                                included_metrics: customReportForm.included_metrics.filter(m => m !== metric.id),
                                                            });
                                                        } else {
                                                            setCustomReportForm({
                                                                ...customReportForm,
                                                                included_metrics: [...customReportForm.included_metrics, metric.id],
                                                            });
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                                                        isSelected
                                                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30'
                                                            : 'border-slate-200 bg-white hover:border-pink-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-pink-700'
                                                    }`}
                                                >
                                                    {isSelected ? <CheckSquare className="size-4 text-pink-600 dark:text-pink-400" /> : <Square className="size-4 text-slate-400" />}
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-pink-700 dark:text-pink-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {metric.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Default Filters */}
                                <div>
                                    <label className="block mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Default Filters (Optional)
                                    </label>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Categories
                                            </label>
                                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                {categories.filter(cat => cat !== 'all').map((category) => {
                                                    const isSelected = customReportForm.filters.categories.includes(category);
                                                    const Icon = getDeviceCategoryIcon(category);
                                                    return (
                                            <button
                                                key={category}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setCustomReportForm({
                                                                        ...customReportForm,
                                                                        filters: {
                                                                            ...customReportForm.filters,
                                                                            categories: customReportForm.filters.categories.filter(c => c !== category),
                                                                        },
                                                                    });
                                                                } else {
                                                                    setCustomReportForm({
                                                                        ...customReportForm,
                                                                        filters: {
                                                                            ...customReportForm.filters,
                                                                            categories: [...customReportForm.filters.categories, category],
                                                                        },
                                                                    });
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-all ${
                                                                isSelected
                                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                                                                    : 'border-slate-200 bg-white hover:border-purple-300 dark:border-slate-700 dark:bg-slate-900'
                                                }`}
                                            >
                                                            {isSelected ? <CheckSquare className="size-3 text-purple-600" /> : <Square className="size-3 text-slate-400" />}
                                                            <Icon className="size-3" />
                                                            <span className="text-xs font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                            </button>
                                                    );
                                                })}
                                    </div>
                                </div>

                                        <div>
                                            <label className="block mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Managed By (Select Multiple)
                                            </label>
                                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 dark:border-slate-700">
                                                {availableUsers.map((user) => {
                                                    const isSelected = customReportForm.filters.managed_by.includes(user.id.toString());
                                                    return (
                                    <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setCustomReportForm({
                                                                        ...customReportForm,
                                                                        filters: {
                                                                            ...customReportForm.filters,
                                                                            managed_by: customReportForm.filters.managed_by.filter(id => id !== user.id.toString()),
                                                                        },
                                                                    });
                                                                } else {
                                                                    setCustomReportForm({
                                                                        ...customReportForm,
                                                                        filters: {
                                                                            ...customReportForm.filters,
                                                                            managed_by: [...customReportForm.filters.managed_by, user.id.toString()],
                                                                        },
                                                                    });
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-all ${
                                                                isSelected
                                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                                                                    : 'border-slate-200 bg-white hover:border-purple-300 dark:border-slate-700 dark:bg-slate-900'
                                                            }`}
                                    >
                                                            {isSelected ? <CheckSquare className="size-3 text-purple-600" /> : <Square className="size-3 text-slate-400" />}
                                                            <User className="size-3" />
                                                            <span className="text-xs font-medium">{user.name}</span>
                                    </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Select one or more users to filter devices managed by them. Leave empty to include all devices.
                                            </p>
                                </div>
                            </div>
                        </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                                    <button
                                        onClick={() => {
                                            setShowCustomBuilder(false);
                                            setEditingCustomReport(null);
                                        }}
                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!customReportForm.name || customReportForm.included_fields.length === 0 || customReportForm.included_metrics.length === 0) {
                                                alert('Please fill in all required fields');
                                                return;
                                            }

                                            try {
                                                const url = editingCustomReport 
                                                    ? `/api/reports/custom/${editingCustomReport.id}`
                                                    : '/api/reports/custom';
                                                const method = editingCustomReport ? 'PUT' : 'POST';

                                                const res = await fetch(url, {
                                                    method,
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Accept': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        branch_id: currentBranch.id,
                                                        name: customReportForm.name,
                                                        description: customReportForm.description,
                                                        included_fields: customReportForm.included_fields,
                                                        included_metrics: customReportForm.included_metrics,
                                                        filters: customReportForm.filters,
                                                        summary_config: customReportForm.summary_config,
                                                    }),
                                                });

                                                if (res.ok) {
                                                    const data = await res.json();
                                                    if (editingCustomReport) {
                                                        setCustomReports(customReports.map(r => r.id === editingCustomReport.id ? data : r));
                                                    } else {
                                                        setCustomReports([...customReports, data]);
                                                    }
                                                    setShowCustomBuilder(false);
                                                    setEditingCustomReport(null);
                                                    alert(editingCustomReport ? 'Custom report updated successfully!' : 'Custom report created successfully!');
                                                } else {
                                                    const error = await res.json();
                                                    alert('Error: ' + (error.error || 'Failed to save custom report'));
                                                }
                                            } catch (err) {
                                                console.error('Error saving custom report:', err);
                                                alert('Failed to save custom report. Please try again.');
                                            }
                                        }}
                                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700"
                                    >
                                        {editingCustomReport ? 'Update Report' : 'Create Report'}
                                    </button>
                                    </div>
                                </div>
                                </div>
                            </div>
                )}
                        </div>
            {/* Modal for messages */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className={`rounded-2xl border-2 shadow-2xl max-w-md w-full mx-4 ${
                        modalType === 'error' 
                            ? 'border-red-500 bg-white dark:bg-slate-800' 
                            : modalType === 'success'
                            ? 'border-emerald-500 bg-white dark:bg-slate-800'
                            : 'border-blue-500 bg-white dark:bg-slate-800'
                    }`} onClick={(e) => e.stopPropagation()}>
                        <div className={`p-6 border-b-2 ${
                            modalType === 'error'
                                ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                                : modalType === 'success'
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {modalType === 'error' ? (
                                        <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
                                    ) : modalType === 'success' ? (
                                        <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <FileText className="size-6 text-blue-600 dark:text-blue-400" />
                )}
                                    <h3 className={`text-lg font-bold ${
                                        modalType === 'error'
                                            ? 'text-red-700 dark:text-red-400'
                                            : modalType === 'success'
                                            ? 'text-emerald-700 dark:text-emerald-400'
                                            : 'text-blue-700 dark:text-blue-400'
                                    }`}>
                                        {modalType === 'error' ? 'Error' : modalType === 'success' ? 'Success' : 'Information'}
                                    </h3>
            </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X className="size-5 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-700 dark:text-slate-300">{modalMessage}</p>
                        </div>
                        <div className="p-6 pt-0 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
                                    modalType === 'error'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : modalType === 'success'
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MonitorLayout>
    );
}
