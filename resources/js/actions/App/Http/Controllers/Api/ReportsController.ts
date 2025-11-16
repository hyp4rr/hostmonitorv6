import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ReportsController::summary
 * @see app/Http/Controllers/Api/ReportsController.php:244
 * @route '/api/reports/summary'
 */
export const summary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/api/reports/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ReportsController::summary
 * @see app/Http/Controllers/Api/ReportsController.php:244
 * @route '/api/reports/summary'
 */
summary.url = (options?: RouteQueryOptions) => {
    return summary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ReportsController::summary
 * @see app/Http/Controllers/Api/ReportsController.php:244
 * @route '/api/reports/summary'
 */
summary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ReportsController::summary
 * @see app/Http/Controllers/Api/ReportsController.php:244
 * @route '/api/reports/summary'
 */
summary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ReportsController::summary
 * @see app/Http/Controllers/Api/ReportsController.php:244
 * @route '/api/reports/summary'
 */
    const summaryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: summary.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ReportsController::summary
 * @see app/Http/Controllers/Api/ReportsController.php:244
 * @route '/api/reports/summary'
 */
        summaryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summary.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ReportsController::summary
 * @see app/Http/Controllers/Api/ReportsController.php:244
 * @route '/api/reports/summary'
 */
        summaryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summary.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    summary.form = summaryForm
/**
* @see \App\Http\Controllers\Api\ReportsController::uptimeStats
 * @see app/Http/Controllers/Api/ReportsController.php:19
 * @route '/api/reports/uptime-stats'
 */
export const uptimeStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: uptimeStats.url(options),
    method: 'get',
})

uptimeStats.definition = {
    methods: ["get","head"],
    url: '/api/reports/uptime-stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ReportsController::uptimeStats
 * @see app/Http/Controllers/Api/ReportsController.php:19
 * @route '/api/reports/uptime-stats'
 */
uptimeStats.url = (options?: RouteQueryOptions) => {
    return uptimeStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ReportsController::uptimeStats
 * @see app/Http/Controllers/Api/ReportsController.php:19
 * @route '/api/reports/uptime-stats'
 */
uptimeStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: uptimeStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ReportsController::uptimeStats
 * @see app/Http/Controllers/Api/ReportsController.php:19
 * @route '/api/reports/uptime-stats'
 */
uptimeStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: uptimeStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ReportsController::uptimeStats
 * @see app/Http/Controllers/Api/ReportsController.php:19
 * @route '/api/reports/uptime-stats'
 */
    const uptimeStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: uptimeStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ReportsController::uptimeStats
 * @see app/Http/Controllers/Api/ReportsController.php:19
 * @route '/api/reports/uptime-stats'
 */
        uptimeStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: uptimeStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ReportsController::uptimeStats
 * @see app/Http/Controllers/Api/ReportsController.php:19
 * @route '/api/reports/uptime-stats'
 */
        uptimeStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: uptimeStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    uptimeStats.form = uptimeStatsForm
/**
* @see \App\Http\Controllers\Api\ReportsController::deviceEvents
 * @see app/Http/Controllers/Api/ReportsController.php:107
 * @route '/api/reports/device-events'
 */
export const deviceEvents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deviceEvents.url(options),
    method: 'get',
})

deviceEvents.definition = {
    methods: ["get","head"],
    url: '/api/reports/device-events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ReportsController::deviceEvents
 * @see app/Http/Controllers/Api/ReportsController.php:107
 * @route '/api/reports/device-events'
 */
deviceEvents.url = (options?: RouteQueryOptions) => {
    return deviceEvents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ReportsController::deviceEvents
 * @see app/Http/Controllers/Api/ReportsController.php:107
 * @route '/api/reports/device-events'
 */
deviceEvents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deviceEvents.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ReportsController::deviceEvents
 * @see app/Http/Controllers/Api/ReportsController.php:107
 * @route '/api/reports/device-events'
 */
deviceEvents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deviceEvents.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ReportsController::deviceEvents
 * @see app/Http/Controllers/Api/ReportsController.php:107
 * @route '/api/reports/device-events'
 */
    const deviceEventsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: deviceEvents.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ReportsController::deviceEvents
 * @see app/Http/Controllers/Api/ReportsController.php:107
 * @route '/api/reports/device-events'
 */
        deviceEventsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deviceEvents.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ReportsController::deviceEvents
 * @see app/Http/Controllers/Api/ReportsController.php:107
 * @route '/api/reports/device-events'
 */
        deviceEventsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deviceEvents.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    deviceEvents.form = deviceEventsForm
/**
* @see \App\Http\Controllers\Api\ReportsController::categoryStats
 * @see app/Http/Controllers/Api/ReportsController.php:176
 * @route '/api/reports/category-stats'
 */
export const categoryStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categoryStats.url(options),
    method: 'get',
})

categoryStats.definition = {
    methods: ["get","head"],
    url: '/api/reports/category-stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ReportsController::categoryStats
 * @see app/Http/Controllers/Api/ReportsController.php:176
 * @route '/api/reports/category-stats'
 */
categoryStats.url = (options?: RouteQueryOptions) => {
    return categoryStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ReportsController::categoryStats
 * @see app/Http/Controllers/Api/ReportsController.php:176
 * @route '/api/reports/category-stats'
 */
categoryStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categoryStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ReportsController::categoryStats
 * @see app/Http/Controllers/Api/ReportsController.php:176
 * @route '/api/reports/category-stats'
 */
categoryStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: categoryStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ReportsController::categoryStats
 * @see app/Http/Controllers/Api/ReportsController.php:176
 * @route '/api/reports/category-stats'
 */
    const categoryStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: categoryStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ReportsController::categoryStats
 * @see app/Http/Controllers/Api/ReportsController.php:176
 * @route '/api/reports/category-stats'
 */
        categoryStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categoryStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ReportsController::categoryStats
 * @see app/Http/Controllers/Api/ReportsController.php:176
 * @route '/api/reports/category-stats'
 */
        categoryStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categoryStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    categoryStats.form = categoryStatsForm
/**
* @see \App\Http\Controllers\Api\ReportsController::alertSummary
 * @see app/Http/Controllers/Api/ReportsController.php:211
 * @route '/api/reports/alert-summary'
 */
export const alertSummary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alertSummary.url(options),
    method: 'get',
})

alertSummary.definition = {
    methods: ["get","head"],
    url: '/api/reports/alert-summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ReportsController::alertSummary
 * @see app/Http/Controllers/Api/ReportsController.php:211
 * @route '/api/reports/alert-summary'
 */
alertSummary.url = (options?: RouteQueryOptions) => {
    return alertSummary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ReportsController::alertSummary
 * @see app/Http/Controllers/Api/ReportsController.php:211
 * @route '/api/reports/alert-summary'
 */
alertSummary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alertSummary.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ReportsController::alertSummary
 * @see app/Http/Controllers/Api/ReportsController.php:211
 * @route '/api/reports/alert-summary'
 */
alertSummary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: alertSummary.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ReportsController::alertSummary
 * @see app/Http/Controllers/Api/ReportsController.php:211
 * @route '/api/reports/alert-summary'
 */
    const alertSummaryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: alertSummary.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ReportsController::alertSummary
 * @see app/Http/Controllers/Api/ReportsController.php:211
 * @route '/api/reports/alert-summary'
 */
        alertSummaryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alertSummary.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ReportsController::alertSummary
 * @see app/Http/Controllers/Api/ReportsController.php:211
 * @route '/api/reports/alert-summary'
 */
        alertSummaryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: alertSummary.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    alertSummary.form = alertSummaryForm
const ReportsController = { summary, uptimeStats, deviceEvents, categoryStats, alertSummary }

export default ReportsController