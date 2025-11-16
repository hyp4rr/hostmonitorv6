import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MonitorController::dashboard
 * @see app/Http/Controllers/MonitorController.php:114
 * @route '/monitor/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/monitor/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MonitorController::dashboard
 * @see app/Http/Controllers/MonitorController.php:114
 * @route '/monitor/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MonitorController::dashboard
 * @see app/Http/Controllers/MonitorController.php:114
 * @route '/monitor/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MonitorController::dashboard
 * @see app/Http/Controllers/MonitorController.php:114
 * @route '/monitor/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MonitorController::dashboard
 * @see app/Http/Controllers/MonitorController.php:114
 * @route '/monitor/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MonitorController::dashboard
 * @see app/Http/Controllers/MonitorController.php:114
 * @route '/monitor/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MonitorController::dashboard
 * @see app/Http/Controllers/MonitorController.php:114
 * @route '/monitor/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\MonitorController::devices
 * @see app/Http/Controllers/MonitorController.php:286
 * @route '/monitor/devices'
 */
export const devices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: devices.url(options),
    method: 'get',
})

devices.definition = {
    methods: ["get","head"],
    url: '/monitor/devices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MonitorController::devices
 * @see app/Http/Controllers/MonitorController.php:286
 * @route '/monitor/devices'
 */
devices.url = (options?: RouteQueryOptions) => {
    return devices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MonitorController::devices
 * @see app/Http/Controllers/MonitorController.php:286
 * @route '/monitor/devices'
 */
devices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: devices.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MonitorController::devices
 * @see app/Http/Controllers/MonitorController.php:286
 * @route '/monitor/devices'
 */
devices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: devices.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MonitorController::devices
 * @see app/Http/Controllers/MonitorController.php:286
 * @route '/monitor/devices'
 */
    const devicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: devices.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MonitorController::devices
 * @see app/Http/Controllers/MonitorController.php:286
 * @route '/monitor/devices'
 */
        devicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: devices.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MonitorController::devices
 * @see app/Http/Controllers/MonitorController.php:286
 * @route '/monitor/devices'
 */
        devicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: devices.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    devices.form = devicesForm
/**
* @see \App\Http\Controllers\MonitorController::alerts
 * @see app/Http/Controllers/MonitorController.php:296
 * @route '/monitor/alerts'
 */
export const alerts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alerts.url(options),
    method: 'get',
})

alerts.definition = {
    methods: ["get","head"],
    url: '/monitor/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MonitorController::alerts
 * @see app/Http/Controllers/MonitorController.php:296
 * @route '/monitor/alerts'
 */
alerts.url = (options?: RouteQueryOptions) => {
    return alerts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MonitorController::alerts
 * @see app/Http/Controllers/MonitorController.php:296
 * @route '/monitor/alerts'
 */
alerts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alerts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MonitorController::alerts
 * @see app/Http/Controllers/MonitorController.php:296
 * @route '/monitor/alerts'
 */
alerts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: alerts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MonitorController::alerts
 * @see app/Http/Controllers/MonitorController.php:296
 * @route '/monitor/alerts'
 */
    const alertsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: alerts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MonitorController::alerts
 * @see app/Http/Controllers/MonitorController.php:296
 * @route '/monitor/alerts'
 */
        alertsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alerts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MonitorController::alerts
 * @see app/Http/Controllers/MonitorController.php:296
 * @route '/monitor/alerts'
 */
        alertsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alerts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    alerts.form = alertsForm
/**
* @see \App\Http\Controllers\MonitorController::maps
 * @see app/Http/Controllers/MonitorController.php:305
 * @route '/monitor/maps'
 */
export const maps = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: maps.url(options),
    method: 'get',
})

maps.definition = {
    methods: ["get","head"],
    url: '/monitor/maps',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MonitorController::maps
 * @see app/Http/Controllers/MonitorController.php:305
 * @route '/monitor/maps'
 */
maps.url = (options?: RouteQueryOptions) => {
    return maps.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MonitorController::maps
 * @see app/Http/Controllers/MonitorController.php:305
 * @route '/monitor/maps'
 */
maps.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: maps.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MonitorController::maps
 * @see app/Http/Controllers/MonitorController.php:305
 * @route '/monitor/maps'
 */
maps.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: maps.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MonitorController::maps
 * @see app/Http/Controllers/MonitorController.php:305
 * @route '/monitor/maps'
 */
    const mapsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: maps.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MonitorController::maps
 * @see app/Http/Controllers/MonitorController.php:305
 * @route '/monitor/maps'
 */
        mapsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: maps.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MonitorController::maps
 * @see app/Http/Controllers/MonitorController.php:305
 * @route '/monitor/maps'
 */
        mapsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: maps.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    maps.form = mapsForm
/**
* @see \App\Http\Controllers\MonitorController::reports
 * @see app/Http/Controllers/MonitorController.php:314
 * @route '/monitor/reports'
 */
export const reports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})

reports.definition = {
    methods: ["get","head"],
    url: '/monitor/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MonitorController::reports
 * @see app/Http/Controllers/MonitorController.php:314
 * @route '/monitor/reports'
 */
reports.url = (options?: RouteQueryOptions) => {
    return reports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MonitorController::reports
 * @see app/Http/Controllers/MonitorController.php:314
 * @route '/monitor/reports'
 */
reports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MonitorController::reports
 * @see app/Http/Controllers/MonitorController.php:314
 * @route '/monitor/reports'
 */
reports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MonitorController::reports
 * @see app/Http/Controllers/MonitorController.php:314
 * @route '/monitor/reports'
 */
    const reportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MonitorController::reports
 * @see app/Http/Controllers/MonitorController.php:314
 * @route '/monitor/reports'
 */
        reportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MonitorController::reports
 * @see app/Http/Controllers/MonitorController.php:314
 * @route '/monitor/reports'
 */
        reportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    reports.form = reportsForm
/**
* @see \App\Http\Controllers\MonitorController::settings
 * @see app/Http/Controllers/MonitorController.php:323
 * @route '/monitor/settings'
 */
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/monitor/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MonitorController::settings
 * @see app/Http/Controllers/MonitorController.php:323
 * @route '/monitor/settings'
 */
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MonitorController::settings
 * @see app/Http/Controllers/MonitorController.php:323
 * @route '/monitor/settings'
 */
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MonitorController::settings
 * @see app/Http/Controllers/MonitorController.php:323
 * @route '/monitor/settings'
 */
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MonitorController::settings
 * @see app/Http/Controllers/MonitorController.php:323
 * @route '/monitor/settings'
 */
    const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: settings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MonitorController::settings
 * @see app/Http/Controllers/MonitorController.php:323
 * @route '/monitor/settings'
 */
        settingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MonitorController::settings
 * @see app/Http/Controllers/MonitorController.php:323
 * @route '/monitor/settings'
 */
        settingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    settings.form = settingsForm
/**
* @see \App\Http\Controllers\MonitorController::configuration
 * @see app/Http/Controllers/MonitorController.php:332
 * @route '/monitor/configuration'
 */
export const configuration = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: configuration.url(options),
    method: 'get',
})

configuration.definition = {
    methods: ["get","head"],
    url: '/monitor/configuration',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MonitorController::configuration
 * @see app/Http/Controllers/MonitorController.php:332
 * @route '/monitor/configuration'
 */
configuration.url = (options?: RouteQueryOptions) => {
    return configuration.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MonitorController::configuration
 * @see app/Http/Controllers/MonitorController.php:332
 * @route '/monitor/configuration'
 */
configuration.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: configuration.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MonitorController::configuration
 * @see app/Http/Controllers/MonitorController.php:332
 * @route '/monitor/configuration'
 */
configuration.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: configuration.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MonitorController::configuration
 * @see app/Http/Controllers/MonitorController.php:332
 * @route '/monitor/configuration'
 */
    const configurationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: configuration.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MonitorController::configuration
 * @see app/Http/Controllers/MonitorController.php:332
 * @route '/monitor/configuration'
 */
        configurationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: configuration.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MonitorController::configuration
 * @see app/Http/Controllers/MonitorController.php:332
 * @route '/monitor/configuration'
 */
        configurationForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: configuration.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    configuration.form = configurationForm
/**
* @see \App\Http\Controllers\TopologyController::topology
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
export const topology = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: topology.url(options),
    method: 'get',
})

topology.definition = {
    methods: ["get","head"],
    url: '/monitor/topology',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TopologyController::topology
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
topology.url = (options?: RouteQueryOptions) => {
    return topology.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TopologyController::topology
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
topology.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: topology.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TopologyController::topology
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
topology.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: topology.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TopologyController::topology
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
    const topologyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: topology.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TopologyController::topology
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
        topologyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: topology.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TopologyController::topology
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
        topologyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: topology.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    topology.form = topologyForm
const monitor = {
    dashboard: Object.assign(dashboard, dashboard),
devices: Object.assign(devices, devices),
alerts: Object.assign(alerts, alerts),
maps: Object.assign(maps, maps),
reports: Object.assign(reports, reports),
settings: Object.assign(settings, settings),
configuration: Object.assign(configuration, configuration),
topology: Object.assign(topology, topology),
}

export default monitor