import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\TopologyController::index
 * @see app/Http/Controllers/Api/TopologyController.php:18
 * @route '/api/topologies'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/topologies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\TopologyController::index
 * @see app/Http/Controllers/Api/TopologyController.php:18
 * @route '/api/topologies'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TopologyController::index
 * @see app/Http/Controllers/Api/TopologyController.php:18
 * @route '/api/topologies'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\TopologyController::index
 * @see app/Http/Controllers/Api/TopologyController.php:18
 * @route '/api/topologies'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\TopologyController::index
 * @see app/Http/Controllers/Api/TopologyController.php:18
 * @route '/api/topologies'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\TopologyController::index
 * @see app/Http/Controllers/Api/TopologyController.php:18
 * @route '/api/topologies'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\TopologyController::index
 * @see app/Http/Controllers/Api/TopologyController.php:18
 * @route '/api/topologies'
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
* @see \App\Http\Controllers\Api\TopologyController::store
 * @see app/Http/Controllers/Api/TopologyController.php:60
 * @route '/api/topologies'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/topologies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TopologyController::store
 * @see app/Http/Controllers/Api/TopologyController.php:60
 * @route '/api/topologies'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TopologyController::store
 * @see app/Http/Controllers/Api/TopologyController.php:60
 * @route '/api/topologies'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\TopologyController::store
 * @see app/Http/Controllers/Api/TopologyController.php:60
 * @route '/api/topologies'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TopologyController::store
 * @see app/Http/Controllers/Api/TopologyController.php:60
 * @route '/api/topologies'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\TopologyController::show
 * @see app/Http/Controllers/Api/TopologyController.php:152
 * @route '/api/topologies/{topology}'
 */
export const show = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/topologies/{topology}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\TopologyController::show
 * @see app/Http/Controllers/Api/TopologyController.php:152
 * @route '/api/topologies/{topology}'
 */
show.url = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topology: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    topology: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        topology: args.topology,
                }

    return show.definition.url
            .replace('{topology}', parsedArgs.topology.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TopologyController::show
 * @see app/Http/Controllers/Api/TopologyController.php:152
 * @route '/api/topologies/{topology}'
 */
show.get = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\TopologyController::show
 * @see app/Http/Controllers/Api/TopologyController.php:152
 * @route '/api/topologies/{topology}'
 */
show.head = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\TopologyController::show
 * @see app/Http/Controllers/Api/TopologyController.php:152
 * @route '/api/topologies/{topology}'
 */
    const showForm = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\TopologyController::show
 * @see app/Http/Controllers/Api/TopologyController.php:152
 * @route '/api/topologies/{topology}'
 */
        showForm.get = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\TopologyController::show
 * @see app/Http/Controllers/Api/TopologyController.php:152
 * @route '/api/topologies/{topology}'
 */
        showForm.head = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\TopologyController::update
 * @see app/Http/Controllers/Api/TopologyController.php:201
 * @route '/api/topologies/{topology}'
 */
export const update = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/topologies/{topology}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\TopologyController::update
 * @see app/Http/Controllers/Api/TopologyController.php:201
 * @route '/api/topologies/{topology}'
 */
update.url = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topology: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    topology: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        topology: args.topology,
                }

    return update.definition.url
            .replace('{topology}', parsedArgs.topology.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TopologyController::update
 * @see app/Http/Controllers/Api/TopologyController.php:201
 * @route '/api/topologies/{topology}'
 */
update.put = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\TopologyController::update
 * @see app/Http/Controllers/Api/TopologyController.php:201
 * @route '/api/topologies/{topology}'
 */
update.patch = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\TopologyController::update
 * @see app/Http/Controllers/Api/TopologyController.php:201
 * @route '/api/topologies/{topology}'
 */
    const updateForm = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TopologyController::update
 * @see app/Http/Controllers/Api/TopologyController.php:201
 * @route '/api/topologies/{topology}'
 */
        updateForm.put = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\TopologyController::update
 * @see app/Http/Controllers/Api/TopologyController.php:201
 * @route '/api/topologies/{topology}'
 */
        updateForm.patch = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\TopologyController::destroy
 * @see app/Http/Controllers/Api/TopologyController.php:314
 * @route '/api/topologies/{topology}'
 */
export const destroy = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/topologies/{topology}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\TopologyController::destroy
 * @see app/Http/Controllers/Api/TopologyController.php:314
 * @route '/api/topologies/{topology}'
 */
destroy.url = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topology: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    topology: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        topology: args.topology,
                }

    return destroy.definition.url
            .replace('{topology}', parsedArgs.topology.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TopologyController::destroy
 * @see app/Http/Controllers/Api/TopologyController.php:314
 * @route '/api/topologies/{topology}'
 */
destroy.delete = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\TopologyController::destroy
 * @see app/Http/Controllers/Api/TopologyController.php:314
 * @route '/api/topologies/{topology}'
 */
    const destroyForm = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TopologyController::destroy
 * @see app/Http/Controllers/Api/TopologyController.php:314
 * @route '/api/topologies/{topology}'
 */
        destroyForm.delete = (args: { topology: string | number } | [topology: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const topologies = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default topologies