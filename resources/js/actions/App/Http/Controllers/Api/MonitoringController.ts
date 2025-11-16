import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\MonitoringController::status
 * @see app/Http/Controllers/Api/MonitoringController.php:24
 * @route '/api/monitoring/status'
 */
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/api/monitoring/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::status
 * @see app/Http/Controllers/Api/MonitoringController.php:24
 * @route '/api/monitoring/status'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::status
 * @see app/Http/Controllers/Api/MonitoringController.php:24
 * @route '/api/monitoring/status'
 */
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MonitoringController::status
 * @see app/Http/Controllers/Api/MonitoringController.php:24
 * @route '/api/monitoring/status'
 */
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::status
 * @see app/Http/Controllers/Api/MonitoringController.php:24
 * @route '/api/monitoring/status'
 */
    const statusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: status.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::status
 * @see app/Http/Controllers/Api/MonitoringController.php:24
 * @route '/api/monitoring/status'
 */
        statusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MonitoringController::status
 * @see app/Http/Controllers/Api/MonitoringController.php:24
 * @route '/api/monitoring/status'
 */
        statusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    status.form = statusForm
/**
* @see \App\Http\Controllers\Api\MonitoringController::pingAllDevices
 * @see app/Http/Controllers/Api/MonitoringController.php:50
 * @route '/api/monitoring/ping-all'
 */
export const pingAllDevices = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingAllDevices.url(options),
    method: 'post',
})

pingAllDevices.definition = {
    methods: ["post"],
    url: '/api/monitoring/ping-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingAllDevices
 * @see app/Http/Controllers/Api/MonitoringController.php:50
 * @route '/api/monitoring/ping-all'
 */
pingAllDevices.url = (options?: RouteQueryOptions) => {
    return pingAllDevices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingAllDevices
 * @see app/Http/Controllers/Api/MonitoringController.php:50
 * @route '/api/monitoring/ping-all'
 */
pingAllDevices.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingAllDevices.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::pingAllDevices
 * @see app/Http/Controllers/Api/MonitoringController.php:50
 * @route '/api/monitoring/ping-all'
 */
    const pingAllDevicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pingAllDevices.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::pingAllDevices
 * @see app/Http/Controllers/Api/MonitoringController.php:50
 * @route '/api/monitoring/ping-all'
 */
        pingAllDevicesForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pingAllDevices.url(options),
            method: 'post',
        })
    
    pingAllDevices.form = pingAllDevicesForm
/**
* @see \App\Http\Controllers\Api\MonitoringController::getPingStatus
 * @see app/Http/Controllers/Api/MonitoringController.php:722
 * @route '/api/monitoring/ping-status'
 */
export const getPingStatus = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPingStatus.url(options),
    method: 'get',
})

getPingStatus.definition = {
    methods: ["get","head"],
    url: '/api/monitoring/ping-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::getPingStatus
 * @see app/Http/Controllers/Api/MonitoringController.php:722
 * @route '/api/monitoring/ping-status'
 */
getPingStatus.url = (options?: RouteQueryOptions) => {
    return getPingStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::getPingStatus
 * @see app/Http/Controllers/Api/MonitoringController.php:722
 * @route '/api/monitoring/ping-status'
 */
getPingStatus.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPingStatus.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MonitoringController::getPingStatus
 * @see app/Http/Controllers/Api/MonitoringController.php:722
 * @route '/api/monitoring/ping-status'
 */
getPingStatus.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPingStatus.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::getPingStatus
 * @see app/Http/Controllers/Api/MonitoringController.php:722
 * @route '/api/monitoring/ping-status'
 */
    const getPingStatusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getPingStatus.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::getPingStatus
 * @see app/Http/Controllers/Api/MonitoringController.php:722
 * @route '/api/monitoring/ping-status'
 */
        getPingStatusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getPingStatus.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MonitoringController::getPingStatus
 * @see app/Http/Controllers/Api/MonitoringController.php:722
 * @route '/api/monitoring/ping-status'
 */
        getPingStatusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getPingStatus.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getPingStatus.form = getPingStatusForm
/**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
const pingSingleDevice7b30002518fa73bd6290273c1a2a24ab = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
    method: 'post',
})

pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.definition = {
    methods: ["post"],
    url: '/api/monitoring/device/{id}/ping',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
    const pingSingleDevice7b30002518fa73bd6290273c1a2a24abForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
        pingSingleDevice7b30002518fa73bd6290273c1a2a24abForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
            method: 'post',
        })
    
    pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.form = pingSingleDevice7b30002518fa73bd6290273c1a2a24abForm
    /**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
const pingSingleDevice7b30002518fa73bd6290273c1a2a24ab = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
    method: 'get',
})

pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.definition = {
    methods: ["get","head"],
    url: '/api/monitoring/device/{id}/ping',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
    const pingSingleDevice7b30002518fa73bd6290273c1a2a24abForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
        pingSingleDevice7b30002518fa73bd6290273c1a2a24abForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MonitoringController::pingSingleDevice
 * @see app/Http/Controllers/Api/MonitoringController.php:626
 * @route '/api/monitoring/device/{id}/ping'
 */
        pingSingleDevice7b30002518fa73bd6290273c1a2a24abForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pingSingleDevice7b30002518fa73bd6290273c1a2a24ab.form = pingSingleDevice7b30002518fa73bd6290273c1a2a24abForm

export const pingSingleDevice = {
    '/api/monitoring/device/{id}/ping': pingSingleDevice7b30002518fa73bd6290273c1a2a24ab,
    '/api/monitoring/device/{id}/ping': pingSingleDevice7b30002518fa73bd6290273c1a2a24ab,
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::getDeviceHistory
 * @see app/Http/Controllers/Api/MonitoringController.php:822
 * @route '/api/monitoring/device/{id}/history'
 */
export const getDeviceHistory = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDeviceHistory.url(args, options),
    method: 'get',
})

getDeviceHistory.definition = {
    methods: ["get","head"],
    url: '/api/monitoring/device/{id}/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::getDeviceHistory
 * @see app/Http/Controllers/Api/MonitoringController.php:822
 * @route '/api/monitoring/device/{id}/history'
 */
getDeviceHistory.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return getDeviceHistory.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::getDeviceHistory
 * @see app/Http/Controllers/Api/MonitoringController.php:822
 * @route '/api/monitoring/device/{id}/history'
 */
getDeviceHistory.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDeviceHistory.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MonitoringController::getDeviceHistory
 * @see app/Http/Controllers/Api/MonitoringController.php:822
 * @route '/api/monitoring/device/{id}/history'
 */
getDeviceHistory.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getDeviceHistory.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::getDeviceHistory
 * @see app/Http/Controllers/Api/MonitoringController.php:822
 * @route '/api/monitoring/device/{id}/history'
 */
    const getDeviceHistoryForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getDeviceHistory.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::getDeviceHistory
 * @see app/Http/Controllers/Api/MonitoringController.php:822
 * @route '/api/monitoring/device/{id}/history'
 */
        getDeviceHistoryForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getDeviceHistory.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MonitoringController::getDeviceHistory
 * @see app/Http/Controllers/Api/MonitoringController.php:822
 * @route '/api/monitoring/device/{id}/history'
 */
        getDeviceHistoryForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getDeviceHistory.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getDeviceHistory.form = getDeviceHistoryForm
/**
* @see \App\Http\Controllers\Api\MonitoringController::pingByCategory
 * @see app/Http/Controllers/Api/MonitoringController.php:766
 * @route '/api/monitoring/category/{category}/ping'
 */
export const pingByCategory = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingByCategory.url(args, options),
    method: 'post',
})

pingByCategory.definition = {
    methods: ["post"],
    url: '/api/monitoring/category/{category}/ping',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingByCategory
 * @see app/Http/Controllers/Api/MonitoringController.php:766
 * @route '/api/monitoring/category/{category}/ping'
 */
pingByCategory.url = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        category: args.category,
                }

    return pingByCategory.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::pingByCategory
 * @see app/Http/Controllers/Api/MonitoringController.php:766
 * @route '/api/monitoring/category/{category}/ping'
 */
pingByCategory.post = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingByCategory.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::pingByCategory
 * @see app/Http/Controllers/Api/MonitoringController.php:766
 * @route '/api/monitoring/category/{category}/ping'
 */
    const pingByCategoryForm = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pingByCategory.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::pingByCategory
 * @see app/Http/Controllers/Api/MonitoringController.php:766
 * @route '/api/monitoring/category/{category}/ping'
 */
        pingByCategoryForm.post = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pingByCategory.url(args, options),
            method: 'post',
        })
    
    pingByCategory.form = pingByCategoryForm
/**
* @see \App\Http\Controllers\Api\MonitoringController::analytics
 * @see app/Http/Controllers/Api/MonitoringController.php:864
 * @route '/api/monitoring/analytics'
 */
export const analytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/api/monitoring/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::analytics
 * @see app/Http/Controllers/Api/MonitoringController.php:864
 * @route '/api/monitoring/analytics'
 */
analytics.url = (options?: RouteQueryOptions) => {
    return analytics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::analytics
 * @see app/Http/Controllers/Api/MonitoringController.php:864
 * @route '/api/monitoring/analytics'
 */
analytics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MonitoringController::analytics
 * @see app/Http/Controllers/Api/MonitoringController.php:864
 * @route '/api/monitoring/analytics'
 */
analytics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::analytics
 * @see app/Http/Controllers/Api/MonitoringController.php:864
 * @route '/api/monitoring/analytics'
 */
    const analyticsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: analytics.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::analytics
 * @see app/Http/Controllers/Api/MonitoringController.php:864
 * @route '/api/monitoring/analytics'
 */
        analyticsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: analytics.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MonitoringController::analytics
 * @see app/Http/Controllers/Api/MonitoringController.php:864
 * @route '/api/monitoring/analytics'
 */
        analyticsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: analytics.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    analytics.form = analyticsForm
/**
* @see \App\Http\Controllers\Api\MonitoringController::toggleMonitoring
 * @see app/Http/Controllers/Api/MonitoringController.php:938
 * @route '/api/monitoring/toggle'
 */
export const toggleMonitoring = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleMonitoring.url(options),
    method: 'post',
})

toggleMonitoring.definition = {
    methods: ["post"],
    url: '/api/monitoring/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::toggleMonitoring
 * @see app/Http/Controllers/Api/MonitoringController.php:938
 * @route '/api/monitoring/toggle'
 */
toggleMonitoring.url = (options?: RouteQueryOptions) => {
    return toggleMonitoring.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::toggleMonitoring
 * @see app/Http/Controllers/Api/MonitoringController.php:938
 * @route '/api/monitoring/toggle'
 */
toggleMonitoring.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleMonitoring.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::toggleMonitoring
 * @see app/Http/Controllers/Api/MonitoringController.php:938
 * @route '/api/monitoring/toggle'
 */
    const toggleMonitoringForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleMonitoring.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::toggleMonitoring
 * @see app/Http/Controllers/Api/MonitoringController.php:938
 * @route '/api/monitoring/toggle'
 */
        toggleMonitoringForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleMonitoring.url(options),
            method: 'post',
        })
    
    toggleMonitoring.form = toggleMonitoringForm
/**
* @see \App\Http\Controllers\Api\MonitoringController::dashboard
 * @see app/Http/Controllers/Api/MonitoringController.php:975
 * @route '/api/monitoring/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/api/monitoring/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MonitoringController::dashboard
 * @see app/Http/Controllers/Api/MonitoringController.php:975
 * @route '/api/monitoring/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MonitoringController::dashboard
 * @see app/Http/Controllers/Api/MonitoringController.php:975
 * @route '/api/monitoring/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MonitoringController::dashboard
 * @see app/Http/Controllers/Api/MonitoringController.php:975
 * @route '/api/monitoring/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MonitoringController::dashboard
 * @see app/Http/Controllers/Api/MonitoringController.php:975
 * @route '/api/monitoring/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MonitoringController::dashboard
 * @see app/Http/Controllers/Api/MonitoringController.php:975
 * @route '/api/monitoring/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MonitoringController::dashboard
 * @see app/Http/Controllers/Api/MonitoringController.php:975
 * @route '/api/monitoring/dashboard'
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
const MonitoringController = { status, pingAllDevices, getPingStatus, pingSingleDevice, getDeviceHistory, pingByCategory, analytics, toggleMonitoring, dashboard }

export default MonitoringController