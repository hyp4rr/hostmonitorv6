import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SwitchController::index
 * @see app/Http/Controllers/Api/SwitchController.php:15
 * @route '/switches'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/switches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SwitchController::index
 * @see app/Http/Controllers/Api/SwitchController.php:15
 * @route '/switches'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SwitchController::index
 * @see app/Http/Controllers/Api/SwitchController.php:15
 * @route '/switches'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SwitchController::index
 * @see app/Http/Controllers/Api/SwitchController.php:15
 * @route '/switches'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\SwitchController::index
 * @see app/Http/Controllers/Api/SwitchController.php:15
 * @route '/switches'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\SwitchController::index
 * @see app/Http/Controllers/Api/SwitchController.php:15
 * @route '/switches'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\SwitchController::index
 * @see app/Http/Controllers/Api/SwitchController.php:15
 * @route '/switches'
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
* @see \App\Http\Controllers\Api\SwitchController::stats
 * @see app/Http/Controllers/Api/SwitchController.php:36
 * @route '/switches/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/switches/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SwitchController::stats
 * @see app/Http/Controllers/Api/SwitchController.php:36
 * @route '/switches/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SwitchController::stats
 * @see app/Http/Controllers/Api/SwitchController.php:36
 * @route '/switches/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SwitchController::stats
 * @see app/Http/Controllers/Api/SwitchController.php:36
 * @route '/switches/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\SwitchController::stats
 * @see app/Http/Controllers/Api/SwitchController.php:36
 * @route '/switches/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\SwitchController::stats
 * @see app/Http/Controllers/Api/SwitchController.php:36
 * @route '/switches/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\SwitchController::stats
 * @see app/Http/Controllers/Api/SwitchController.php:36
 * @route '/switches/stats'
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
* @see \App\Http\Controllers\Api\SwitchController::pingAll
 * @see app/Http/Controllers/Api/SwitchController.php:54
 * @route '/switches/ping-all'
 */
export const pingAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingAll.url(options),
    method: 'post',
})

pingAll.definition = {
    methods: ["post"],
    url: '/switches/ping-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SwitchController::pingAll
 * @see app/Http/Controllers/Api/SwitchController.php:54
 * @route '/switches/ping-all'
 */
pingAll.url = (options?: RouteQueryOptions) => {
    return pingAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SwitchController::pingAll
 * @see app/Http/Controllers/Api/SwitchController.php:54
 * @route '/switches/ping-all'
 */
pingAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingAll.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\SwitchController::pingAll
 * @see app/Http/Controllers/Api/SwitchController.php:54
 * @route '/switches/ping-all'
 */
    const pingAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pingAll.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\SwitchController::pingAll
 * @see app/Http/Controllers/Api/SwitchController.php:54
 * @route '/switches/ping-all'
 */
        pingAllForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pingAll.url(options),
            method: 'post',
        })
    
    pingAll.form = pingAllForm
/**
* @see \App\Http\Controllers\Api\SwitchController::pingSingle
 * @see app/Http/Controllers/Api/SwitchController.php:71
 * @route '/switches/{id}/ping'
 */
export const pingSingle = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingSingle.url(args, options),
    method: 'post',
})

pingSingle.definition = {
    methods: ["post"],
    url: '/switches/{id}/ping',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SwitchController::pingSingle
 * @see app/Http/Controllers/Api/SwitchController.php:71
 * @route '/switches/{id}/ping'
 */
pingSingle.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return pingSingle.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SwitchController::pingSingle
 * @see app/Http/Controllers/Api/SwitchController.php:71
 * @route '/switches/{id}/ping'
 */
pingSingle.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingSingle.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\SwitchController::pingSingle
 * @see app/Http/Controllers/Api/SwitchController.php:71
 * @route '/switches/{id}/ping'
 */
    const pingSingleForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pingSingle.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\SwitchController::pingSingle
 * @see app/Http/Controllers/Api/SwitchController.php:71
 * @route '/switches/{id}/ping'
 */
        pingSingleForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pingSingle.url(args, options),
            method: 'post',
        })
    
    pingSingle.form = pingSingleForm
const SwitchController = { index, stats, pingAll, pingSingle }

export default SwitchController