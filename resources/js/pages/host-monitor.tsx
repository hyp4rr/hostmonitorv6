import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Cpu,
    HardDrive,
    MemoryStick,
    Network,
    Server,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useState } from 'react';

type HostStatus = 'online' | 'offline' | 'warning';

interface NetworkDevice {
    id: string;
    name: string;
    ip: string;
    type: 'server' | 'router' | 'switch' | 'firewall';
    status: HostStatus;
    uptime: string;
    cpu: number;
    memory: number;
    disk: number;
    latency: number;
    lastChecked: Date;
}

const getStatusColor = (status: HostStatus) => {
    switch (status) {
        case 'online':
            return 'text-green-500';
        case 'offline':
            return 'text-red-500';
        case 'warning':
            return 'text-yellow-500';
    }
};

const getStatusBg = (status: HostStatus) => {
    switch (status) {
        case 'online':
            return 'bg-green-500/10 border-green-500/20';
        case 'offline':
            return 'bg-red-500/10 border-red-500/20';
        case 'warning':
            return 'bg-yellow-500/10 border-yellow-500/20';
    }
};

const getStatusIcon = (status: HostStatus) => {
    switch (status) {
        case 'online':
            return <CheckCircle2 className="size-5" />;
        case 'offline':
            return <WifiOff className="size-5" />;
        case 'warning':
            return <AlertCircle className="size-5" />;
    }
};

const getTypeIcon = (type: NetworkDevice['type']) => {
    switch (type) {
        case 'server':
            return <Server className="size-5" />;
        case 'router':
            return <Wifi className="size-5" />;
        case 'switch':
            return <Network className="size-5" />;
        case 'firewall':
            return <Activity className="size-5" />;
    }
};

export default function HostMonitor() {
    const [devices] = useState<NetworkDevice[]>([]);
    const [lastUpdate] = useState(new Date());

    const onlineCount = 0;
    const warningCount = 0;
    const offlineCount = 0;

    const avgCpu = 0;
    const avgMemory = 0;
    const avgLatency = 0;

    return (
        <>
            <Head title="Host Monitor" />
            <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Network Device Monitor
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Real-time monitoring of network infrastructure
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Devices */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Devices
                                </p>
                                <p className="text-3xl font-bold">
                                    {devices.length}
                                </p>
                            </div>
                            <Server className="size-8 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Online */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Online
                                </p>
                                <p className="text-3xl font-bold text-green-500">
                                    {onlineCount}
                                </p>
                            </div>
                            <CheckCircle2 className="size-8 text-green-500" />
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Warning
                                </p>
                                <p className="text-3xl font-bold text-yellow-500">
                                    {warningCount}
                                </p>
                            </div>
                            <AlertCircle className="size-8 text-yellow-500" />
                        </div>
                    </div>

                    {/* Offline */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Offline
                                </p>
                                <p className="text-3xl font-bold text-red-500">
                                    {offlineCount}
                                </p>
                            </div>
                            <WifiOff className="size-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Average Metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/10 p-3">
                                <Cpu className="size-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Avg CPU Usage
                                </p>
                                <p className="text-2xl font-bold">
                                    {avgCpu.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-3">
                                <MemoryStick className="size-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Avg Memory Usage
                                </p>
                                <p className="text-2xl font-bold">
                                    {avgMemory.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-500/10 p-3">
                                <Activity className="size-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Avg Latency
                                </p>
                                <p className="text-2xl font-bold">
                                    {avgLatency.toFixed(1)}ms
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Device List */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-6">
                        <h2 className="text-xl font-semibold">
                            Network Devices
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Monitor all devices in real-time
                        </p>
                    </div>
                    <div className="divide-y">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className="p-6 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    {/* Device Info */}
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`rounded-lg border p-3 ${getStatusBg(device.status)}`}
                                        >
                                            <div
                                                className={getStatusColor(
                                                    device.status,
                                                )}
                                            >
                                                {getTypeIcon(device.type)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">
                                                    {device.name}
                                                </h3>
                                                <span
                                                    className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(device.status)}`}
                                                >
                                                    {getStatusIcon(
                                                        device.status,
                                                    )}
                                                    {device.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {device.ip} •{' '}
                                                {device.type
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    device.type.slice(1)}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Uptime: {device.uptime} •
                                                Latency: {device.latency}ms
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    {device.status !== 'offline' && (
                                        <div className="grid grid-cols-3 gap-4 lg:min-w-[400px]">
                                            {/* CPU */}
                                            <div>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <Cpu className="size-3" />
                                                        CPU
                                                    </span>
                                                    <span className="font-medium">
                                                        {device.cpu}%
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full transition-all ${
                                                            device.cpu > 85
                                                                ? 'bg-red-500'
                                                                : device.cpu >
                                                                    70
                                                                  ? 'bg-yellow-500'
                                                                  : 'bg-blue-500'
                                                        }`}
                                                        style={{
                                                            width: `${device.cpu}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Memory */}
                                            <div>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <MemoryStick className="size-3" />
                                                        RAM
                                                    </span>
                                                    <span className="font-medium">
                                                        {device.memory}%
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full transition-all ${
                                                            device.memory > 90
                                                                ? 'bg-red-500'
                                                                : device.memory >
                                                                    75
                                                                  ? 'bg-yellow-500'
                                                                  : 'bg-purple-500'
                                                        }`}
                                                        style={{
                                                            width: `${device.memory}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Disk */}
                                            <div>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <HardDrive className="size-3" />
                                                        Disk
                                                    </span>
                                                    <span className="font-medium">
                                                        {device.disk}%
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full transition-all ${
                                                            device.disk > 90
                                                                ? 'bg-red-500'
                                                                : device.disk >
                                                                    75
                                                                  ? 'bg-yellow-500'
                                                                  : 'bg-green-500'
                                                        }`}
                                                        style={{
                                                            width: `${device.disk}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {device.status === 'offline' && (
                                        <div className="text-sm text-muted-foreground lg:min-w-[400px]">
                                            Device is currently offline
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}
