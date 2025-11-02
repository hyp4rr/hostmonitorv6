import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:11
 * @route '/api/alerts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:11
 * @route '/api/alerts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:11
 * @route '/api/alerts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:11
 * @route '/api/alerts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:11
 * @route '/api/alerts'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:11
 * @route '/api/alerts'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:11
 * @route '/api/alerts'
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
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:63
 * @route '/api/alerts/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/api/alerts/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:63
 * @route '/api/alerts/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:63
 * @route '/api/alerts/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:63
 * @route '/api/alerts/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:63
 * @route '/api/alerts/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:63
 * @route '/api/alerts/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:63
 * @route '/api/alerts/stats'
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
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:44
 * @route '/api/alerts/{id}/read'
 */
export const markAsRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.definition = {
    methods: ["post"],
    url: '/api/alerts/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:44
 * @route '/api/alerts/{id}/read'
 */
markAsRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markAsRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:44
 * @route '/api/alerts/{id}/read'
 */
markAsRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:44
 * @route '/api/alerts/{id}/read'
 */
    const markAsReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAsRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:44
 * @route '/api/alerts/{id}/read'
 */
        markAsReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAsRead.url(args, options),
            method: 'post',
        })
    
    markAsRead.form = markAsReadForm
/**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:53
 * @route '/api/alerts/{id}/resolve'
 */
export const resolve = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

resolve.definition = {
    methods: ["post"],
    url: '/api/alerts/{id}/resolve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:53
 * @route '/api/alerts/{id}/resolve'
 */
resolve.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return resolve.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:53
 * @route '/api/alerts/{id}/resolve'
 */
resolve.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:53
 * @route '/api/alerts/{id}/resolve'
 */
    const resolveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resolve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:53
 * @route '/api/alerts/{id}/resolve'
 */
        resolveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resolve.url(args, options),
            method: 'post',
        })
    
    resolve.form = resolveForm
const AlertController = { index, stats, markAsRead, resolve }

export default AlertController