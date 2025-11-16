import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
export const show = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/devices/{device}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
show.url = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { device: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    device: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        device: args.device,
                }

    return show.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
show.get = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
show.head = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
    const showForm = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
        showForm.get = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
        showForm.head = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
export const update = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/devices/{device}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
update.url = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { device: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    device: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        device: args.device,
                }

    return update.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
update.put = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
update.patch = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
    const updateForm = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
        updateForm.put = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
        updateForm.patch = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
export const destroy = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/devices/{device}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
destroy.url = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { device: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    device: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        device: args.device,
                }

    return destroy.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
destroy.delete = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
    const destroyForm = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
        destroyForm.delete = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const devices = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default devices