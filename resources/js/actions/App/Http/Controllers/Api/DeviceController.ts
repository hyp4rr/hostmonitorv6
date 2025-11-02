import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:10
 * @route '/api/devices'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/devices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:10
 * @route '/api/devices'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:10
 * @route '/api/devices'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:10
 * @route '/api/devices'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:10
 * @route '/api/devices'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:10
 * @route '/api/devices'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:10
 * @route '/api/devices'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:49
 * @route '/api/devices/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/api/devices/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:49
 * @route '/api/devices/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:49
 * @route '/api/devices/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:49
 * @route '/api/devices/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:49
 * @route '/api/devices/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:49
 * @route '/api/devices/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:49
 * @route '/api/devices/stats'
 */
        statsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    stats.form = statsForm
/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
export const dashboardStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardStats.url(options),
    method: 'get',
})

dashboardStats.definition = {
    methods: ["get","head"],
    url: '/api/dashboard/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
dashboardStats.url = (options?: RouteQueryOptions) => {
    return dashboardStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
dashboardStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
dashboardStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboardStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
    const dashboardStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboardStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
        dashboardStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboardStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
        dashboardStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboardStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboardStats.form = dashboardStatsForm
/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:29
 * @route '/api/devices/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/devices/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:29
 * @route '/api/devices/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:29
 * @route '/api/devices/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:29
 * @route '/api/devices/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:29
 * @route '/api/devices/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:29
 * @route '/api/devices/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:29
 * @route '/api/devices/{id}'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const DeviceController = { index, stats, dashboardStats, show }

export default DeviceController