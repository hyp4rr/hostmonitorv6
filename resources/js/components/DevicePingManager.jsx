import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  Server,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const DevicePingManager = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pingingAll, setPingingAll] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    warning: 0
  });
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load initial device status
  useEffect(() => {
    loadDeviceStatus();
    const interval = setInterval(loadDeviceStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDeviceStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitoring/ping-status');
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
        setStats(data.stats);
        setLastUpdate(new Date(data.timestamp));
      }
    } catch (error) {
      console.error('Failed to load device status:', error);
    } finally {
      setLoading(false);
    }
  };

  const pingAllDevices = async () => {
    try {
      setPingingAll(true);
      const response = await fetch('/api/monitoring/ping-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh device status after ping
        await loadDeviceStatus();
        
        // Show success message
        const percentage = ((data.stats.online_devices / data.stats.total_devices) * 100).toFixed(1);
        alert(`✅ Ping Complete!\n\nTotal Devices: ${data.stats.total_devices}\nOnline: ${data.stats.online_devices}\nOffline: ${data.stats.offline_devices}\nUptime: ${percentage}%\nDuration: ${data.duration}ms`);
      } else {
        alert('❌ Failed to ping all devices: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to ping all devices:', error);
      alert('❌ Network error while pinging devices');
    } finally {
      setPingingAll(false);
    }
  };

  const pingSingleDevice = async (deviceId) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;

      // Update device status to "pinging"
      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, status: 'pinging' } : d
      ));

      const response = await fetch(`/api/monitoring/device/${deviceId}/ping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Update device with new status
        setDevices(prev => prev.map(d => 
          d.id === deviceId ? {
            ...d,
            status: data.stats.current_status,
            response_time: data.stats.response_time,
            last_ping: data.timestamp,
            performance: data.stats.performance
          } : d
        ));

        // Show detailed result
        const statusIcon = data.stats.is_online ? '🟢' : '🔴';
        const performance = data.stats.performance.toUpperCase();
        alert(`${statusIcon} ${device.name}\n\nStatus: ${data.stats.current_status}\nResponse Time: ${data.stats.response_time || 'N/A'}ms\nPerformance: ${performance}\nPing Duration: ${data.stats.ping_duration}ms`);
      } else {
        alert('❌ Failed to ping device: ' + data.error);
        // Revert status on error
        await loadDeviceStatus();
      }
    } catch (error) {
      console.error('Failed to ping device:', error);
      alert('❌ Network error while pinging device');
      await loadDeviceStatus();
    }
  };

  const pingCategory = async (category) => {
    try {
      const response = await fetch(`/api/monitoring/category/${category}/ping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        await loadDeviceStatus();
        const percentage = ((data.stats.online_devices / data.stats.total_devices) * 100).toFixed(1);
        alert(`✅ Category '${category}' Ping Complete!\n\nTotal Devices: ${data.stats.total_devices}\nOnline: ${data.stats.online_devices}\nOffline: ${data.stats.offline_devices}\nUptime: ${percentage}%\nDuration: ${data.duration}ms`);
      } else {
        alert('❌ Failed to ping category: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to ping category:', error);
      alert('❌ Network error while pinging category');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pinging':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      online: 'default',
      offline: 'destructive',
      warning: 'secondary',
      pinging: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      case 'offline':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const uptimePercentage = stats.total > 0 ? ((stats.online / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptimePercentage}%</div>
            <Progress value={parseFloat(uptimePercentage)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Network Control Center</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={pingAllDevices}
              disabled={pingingAll || loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${pingingAll ? 'animate-spin' : ''}`} />
              <span>{pingingAll ? 'Pinging All...' : 'Ping All Devices'}</span>
            </Button>
            
            <Button 
              onClick={loadDeviceStatus}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Refresh Status</span>
            </Button>

            <Button 
              onClick={() => pingCategory('tas')}
              disabled={loading}
              variant="secondary"
            >
              Ping TAS Devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading device status...
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div 
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(device.status)}
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.ip_address} • {device.category} • {device.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm">
                        Response: <span className={getPerformanceColor(device.performance)}>
                          {device.response_time ? `${device.response_time}ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {device.performance}
                      </div>
                    </div>
                    
                    {getStatusBadge(device.status)}
                    
                    <Button 
                      size="sm"
                      onClick={() => pingSingleDevice(device.id)}
                      disabled={device.status === 'pinging'}
                      variant="outline"
                    >
                      {device.status === 'pinging' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        'Ping'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevicePingManager;
