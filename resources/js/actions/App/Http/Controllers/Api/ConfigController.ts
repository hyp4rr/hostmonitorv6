import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ConfigController::verify
 * @see app/Http/Controllers/Api/ConfigController.php:143
 * @route '/api/config/verify'
 */
export const verify = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/api/config/verify',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ConfigController::verify
 * @see app/Http/Controllers/Api/ConfigController.php:143
 * @route '/api/config/verify'
 */
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ConfigController::verify
 * @see app/Http/Controllers/Api/ConfigController.php:143
 * @route '/api/config/verify'
 */
verify.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ConfigController::verify
 * @see app/Http/Controllers/Api/ConfigController.php:143
 * @route '/api/config/verify'
 */
verify.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ConfigController::verify
 * @see app/Http/Controllers/Api/ConfigController.php:143
 * @route '/api/config/verify'
 */
    const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verify.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ConfigController::verify
 * @see app/Http/Controllers/Api/ConfigController.php:143
 * @route '/api/config/verify'
 */
        verifyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ConfigController::verify
 * @see app/Http/Controllers/Api/ConfigController.php:143
 * @route '/api/config/verify'
 */
        verifyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verify.form = verifyForm
const ConfigController = { verify }

export default ConfigController