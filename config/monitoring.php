<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Enterprise Monitoring Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for large-scale device monitoring (3000+ devices)
    |
    */

    'timeout' => env('MONITORING_TIMEOUT', 5), // Ping timeout in seconds (increased for slow devices)
    
    'max_concurrent' => env('MONITORING_MAX_CONCURRENT', 30), // Max concurrent pings (reduced for reliability)
    
    'batch_size' => env('MONITORING_BATCH_SIZE', 500), // Devices per batch
    
    'cache_duration' => env('MONITORING_CACHE_DURATION', 60), // Cache duration in seconds
    
    'strategies' => [
        'small_scale' => [
            'max_devices' => 100,
            'batch_size' => 20,
            'concurrent' => 10,
        ],
        'medium_scale' => [
            'max_devices' => 1000,
            'batch_size' => 50,
            'concurrent' => 15,
        ],
        'large_scale' => [
            'max_devices' => 3000,
            'batch_size' => 100,
            'concurrent' => 20,
        ],
        'enterprise_scale' => [
            'max_devices' => 10000,
            'batch_size' => 200,
            'concurrent' => 25,
        ],
    ],

    'performance' => [
        'memory_limit' => env('MONITORING_MEMORY_LIMIT', '512M'),
        'max_execution_time' => env('MONITORING_MAX_EXECUTION_TIME', 300),
        'gc_frequency' => env('MONITORING_GC_FREQUENCY', 100), // Garbage collect every N devices
    ],

    'redis' => [
        'connection' => env('MONITORING_REDIS_CONNECTION', 'default'),
        'key_prefix' => env('MONITORING_REDIS_PREFIX', 'monitoring:'),
        'ttl' => env('MONITORING_REDIS_TTL', 300), // 5 minutes
    ],

    'queues' => [
        'monitoring' => env('MONITORING_QUEUE', 'monitoring'),
        'notifications' => env('MONITORING_NOTIFICATIONS_QUEUE', 'notifications'),
        'analytics' => env('MONITORING_ANALYTICS_QUEUE', 'analytics'),
    ],

    'alerts' => [
        'offline_threshold' => env('MONITORING_OFFLINE_THRESHOLD', 2), // Minutes
        'response_time_threshold' => env('MONITORING_RESPONSE_TIME_THRESHOLD', 1000), // Milliseconds
        'consecutive_failures' => env('MONITORING_CONSECUTIVE_FAILURES', 3),
    ],

    'scheduling' => [
        'high_frequency' => env('MONITORING_HIGH_FREQUENCY', 30), // Seconds
        'normal_frequency' => env('MONITORING_NORMAL_FREQUENCY', 120), // Seconds
        'low_frequency' => env('MONITORING_LOW_FREQUENCY', 300), // Seconds
    ],

    'analytics' => [
        'retention_days' => env('MONITORING_RETENTION_DAYS', 30),
        'aggregation_interval' => env('MONITORING_AGGREGATION_INTERVAL', 5), // Minutes
        'cleanup_frequency' => env('MONITORING_CLEANUP_FREQUENCY', 24), // Hours
    ],
];
