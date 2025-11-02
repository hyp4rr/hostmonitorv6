import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PingController::pingDevice
 * @see app/Http/Controllers/PingController.php:15
 * @route '/api/ping/device'
 */
export const pingDevice = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingDevice.url(options),
    method: 'post',
})

pingDevice.definition = {
    methods: ["post"],
    url: '/api/ping/device',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PingController::pingDevice
 * @see app/Http/Controllers/PingController.php:15
 * @route '/api/ping/device'
 */
pingDevice.url = (options?: RouteQueryOptions) => {
    return pingDevice.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PingController::pingDevice
 * @see app/Http/Controllers/PingController.php:15
 * @route '/api/ping/device'
 */
pingDevice.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingDevice.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PingController::pingDevice
 * @see app/Http/Controllers/PingController.php:15
 * @route '/api/ping/device'
 */
    const pingDeviceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pingDevice.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PingController::pingDevice
 * @see app/Http/Controllers/PingController.php:15
 * @route '/api/ping/device'
 */
        pingDeviceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pingDevice.url(options),
            method: 'post',
        })
    
    pingDevice.form = pingDeviceForm
/**
* @see \App\Http\Controllers\PingController::pingAll
 * @see app/Http/Controllers/PingController.php:37
 * @route '/api/ping/all'
 */
export const pingAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingAll.url(options),
    method: 'post',
})

pingAll.definition = {
    methods: ["post"],
    url: '/api/ping/all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PingController::pingAll
 * @see app/Http/Controllers/PingController.php:37
 * @route '/api/ping/all'
 */
pingAll.url = (options?: RouteQueryOptions) => {
    return pingAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PingController::pingAll
 * @see app/Http/Controllers/PingController.php:37
 * @route '/api/ping/all'
 */
pingAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pingAll.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PingController::pingAll
 * @see app/Http/Controllers/PingController.php:37
 * @route '/api/ping/all'
 */
    const pingAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pingAll.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PingController::pingAll
 * @see app/Http/Controllers/PingController.php:37
 * @route '/api/ping/all'
 */
        pingAllForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pingAll.url(options),
            method: 'post',
        })
    
    pingAll.form = pingAllForm
/**
* @see \App\Http\Controllers\PingController::getCachedResults
 * @see app/Http/Controllers/PingController.php:147
 * @route '/api/ping/cached'
 */
export const getCachedResults = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: getCachedResults.url(options),
    method: 'post',
})

getCachedResults.definition = {
    methods: ["post"],
    url: '/api/ping/cached',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PingController::getCachedResults
 * @see app/Http/Controllers/PingController.php:147
 * @route '/api/ping/cached'
 */
getCachedResults.url = (options?: RouteQueryOptions) => {
    return getCachedResults.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PingController::getCachedResults
 * @see app/Http/Controllers/PingController.php:147
 * @route '/api/ping/cached'
 */
getCachedResults.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: getCachedResults.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PingController::getCachedResults
 * @see app/Http/Controllers/PingController.php:147
 * @route '/api/ping/cached'
 */
    const getCachedResultsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: getCachedResults.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PingController::getCachedResults
 * @see app/Http/Controllers/PingController.php:147
 * @route '/api/ping/cached'
 */
        getCachedResultsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: getCachedResults.url(options),
            method: 'post',
        })
    
    getCachedResults.form = getCachedResultsForm
/**
* @see \App\Http\Controllers\PingController::streamPing
 * @see app/Http/Controllers/PingController.php:172
 * @route '/api/ping/stream'
 */
export const streamPing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: streamPing.url(options),
    method: 'get',
})

streamPing.definition = {
    methods: ["get","head"],
    url: '/api/ping/stream',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PingController::streamPing
 * @see app/Http/Controllers/PingController.php:172
 * @route '/api/ping/stream'
 */
streamPing.url = (options?: RouteQueryOptions) => {
    return streamPing.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PingController::streamPing
 * @see app/Http/Controllers/PingController.php:172
 * @route '/api/ping/stream'
 */
streamPing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: streamPing.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PingController::streamPing
 * @see app/Http/Controllers/PingController.php:172
 * @route '/api/ping/stream'
 */
streamPing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: streamPing.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PingController::streamPing
 * @see app/Http/Controllers/PingController.php:172
 * @route '/api/ping/stream'
 */
    const streamPingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: streamPing.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PingController::streamPing
 * @see app/Http/Controllers/PingController.php:172
 * @route '/api/ping/stream'
 */
        streamPingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: streamPing.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PingController::streamPing
 * @see app/Http/Controllers/PingController.php:172
 * @route '/api/ping/stream'
 */
        streamPingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: streamPing.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    streamPing.form = streamPingForm
const PingController = { pingDevice, pingAll, getCachedResults, streamPing }

export default PingController