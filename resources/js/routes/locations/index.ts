import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\LocationController::index
 * @see app/Http/Controllers/Api/LocationController.php:14
 * @route '/api/locations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/locations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\LocationController::index
 * @see app/Http/Controllers/Api/LocationController.php:14
 * @route '/api/locations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\LocationController::index
 * @see app/Http/Controllers/Api/LocationController.php:14
 * @route '/api/locations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\LocationController::index
 * @see app/Http/Controllers/Api/LocationController.php:14
 * @route '/api/locations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\LocationController::index
 * @see app/Http/Controllers/Api/LocationController.php:14
 * @route '/api/locations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\LocationController::index
 * @see app/Http/Controllers/Api/LocationController.php:14
 * @route '/api/locations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\LocationController::index
 * @see app/Http/Controllers/Api/LocationController.php:14
 * @route '/api/locations'
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
* @see \App\Http\Controllers\Api\LocationController::store
 * @see app/Http/Controllers/Api/LocationController.php:32
 * @route '/api/locations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\LocationController::store
 * @see app/Http/Controllers/Api/LocationController.php:32
 * @route '/api/locations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\LocationController::store
 * @see app/Http/Controllers/Api/LocationController.php:32
 * @route '/api/locations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\LocationController::store
 * @see app/Http/Controllers/Api/LocationController.php:32
 * @route '/api/locations'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\LocationController::store
 * @see app/Http/Controllers/Api/LocationController.php:32
 * @route '/api/locations'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\LocationController::show
 * @see app/Http/Controllers/Api/LocationController.php:69
 * @route '/api/locations/{location}'
 */
export const show = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/locations/{location}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\LocationController::show
 * @see app/Http/Controllers/Api/LocationController.php:69
 * @route '/api/locations/{location}'
 */
show.url = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { location: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    location: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        location: args.location,
                }

    return show.definition.url
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\LocationController::show
 * @see app/Http/Controllers/Api/LocationController.php:69
 * @route '/api/locations/{location}'
 */
show.get = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\LocationController::show
 * @see app/Http/Controllers/Api/LocationController.php:69
 * @route '/api/locations/{location}'
 */
show.head = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\LocationController::show
 * @see app/Http/Controllers/Api/LocationController.php:69
 * @route '/api/locations/{location}'
 */
    const showForm = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\LocationController::show
 * @see app/Http/Controllers/Api/LocationController.php:69
 * @route '/api/locations/{location}'
 */
        showForm.get = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\LocationController::show
 * @see app/Http/Controllers/Api/LocationController.php:69
 * @route '/api/locations/{location}'
 */
        showForm.head = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\LocationController::update
 * @see app/Http/Controllers/Api/LocationController.php:80
 * @route '/api/locations/{location}'
 */
export const update = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/locations/{location}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\LocationController::update
 * @see app/Http/Controllers/Api/LocationController.php:80
 * @route '/api/locations/{location}'
 */
update.url = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { location: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    location: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        location: args.location,
                }

    return update.definition.url
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\LocationController::update
 * @see app/Http/Controllers/Api/LocationController.php:80
 * @route '/api/locations/{location}'
 */
update.put = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\LocationController::update
 * @see app/Http/Controllers/Api/LocationController.php:80
 * @route '/api/locations/{location}'
 */
update.patch = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\LocationController::update
 * @see app/Http/Controllers/Api/LocationController.php:80
 * @route '/api/locations/{location}'
 */
    const updateForm = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\LocationController::update
 * @see app/Http/Controllers/Api/LocationController.php:80
 * @route '/api/locations/{location}'
 */
        updateForm.put = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\LocationController::update
 * @see app/Http/Controllers/Api/LocationController.php:80
 * @route '/api/locations/{location}'
 */
        updateForm.patch = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\LocationController::destroy
 * @see app/Http/Controllers/Api/LocationController.php:130
 * @route '/api/locations/{location}'
 */
export const destroy = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/locations/{location}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\LocationController::destroy
 * @see app/Http/Controllers/Api/LocationController.php:130
 * @route '/api/locations/{location}'
 */
destroy.url = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { location: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    location: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        location: args.location,
                }

    return destroy.definition.url
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\LocationController::destroy
 * @see app/Http/Controllers/Api/LocationController.php:130
 * @route '/api/locations/{location}'
 */
destroy.delete = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\LocationController::destroy
 * @see app/Http/Controllers/Api/LocationController.php:130
 * @route '/api/locations/{location}'
 */
    const destroyForm = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\LocationController::destroy
 * @see app/Http/Controllers/Api/LocationController.php:130
 * @route '/api/locations/{location}'
 */
        destroyForm.delete = (args: { location: string | number } | [location: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const locations = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default locations