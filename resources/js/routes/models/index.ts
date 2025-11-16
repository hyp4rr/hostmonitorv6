import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ModelController::show
 * @see app/Http/Controllers/Api/ModelController.php:0
 * @route '/api/models/{model}'
 */
export const show = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/models/{model}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ModelController::show
 * @see app/Http/Controllers/Api/ModelController.php:0
 * @route '/api/models/{model}'
 */
show.url = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { model: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    model: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        model: args.model,
                }

    return show.definition.url
            .replace('{model}', parsedArgs.model.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::show
 * @see app/Http/Controllers/Api/ModelController.php:0
 * @route '/api/models/{model}'
 */
show.get = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ModelController::show
 * @see app/Http/Controllers/Api/ModelController.php:0
 * @route '/api/models/{model}'
 */
show.head = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::show
 * @see app/Http/Controllers/Api/ModelController.php:0
 * @route '/api/models/{model}'
 */
    const showForm = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::show
 * @see app/Http/Controllers/Api/ModelController.php:0
 * @route '/api/models/{model}'
 */
        showForm.get = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ModelController::show
 * @see app/Http/Controllers/Api/ModelController.php:0
 * @route '/api/models/{model}'
 */
        showForm.head = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\ModelController::update
 * @see app/Http/Controllers/Api/ModelController.php:55
 * @route '/api/models/{model}'
 */
export const update = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/models/{model}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\ModelController::update
 * @see app/Http/Controllers/Api/ModelController.php:55
 * @route '/api/models/{model}'
 */
update.url = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { model: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    model: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        model: args.model,
                }

    return update.definition.url
            .replace('{model}', parsedArgs.model.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::update
 * @see app/Http/Controllers/Api/ModelController.php:55
 * @route '/api/models/{model}'
 */
update.put = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\ModelController::update
 * @see app/Http/Controllers/Api/ModelController.php:55
 * @route '/api/models/{model}'
 */
update.patch = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::update
 * @see app/Http/Controllers/Api/ModelController.php:55
 * @route '/api/models/{model}'
 */
    const updateForm = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::update
 * @see app/Http/Controllers/Api/ModelController.php:55
 * @route '/api/models/{model}'
 */
        updateForm.put = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\ModelController::update
 * @see app/Http/Controllers/Api/ModelController.php:55
 * @route '/api/models/{model}'
 */
        updateForm.patch = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\ModelController::destroy
 * @see app/Http/Controllers/Api/ModelController.php:87
 * @route '/api/models/{model}'
 */
export const destroy = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/models/{model}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ModelController::destroy
 * @see app/Http/Controllers/Api/ModelController.php:87
 * @route '/api/models/{model}'
 */
destroy.url = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { model: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    model: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        model: args.model,
                }

    return destroy.definition.url
            .replace('{model}', parsedArgs.model.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::destroy
 * @see app/Http/Controllers/Api/ModelController.php:87
 * @route '/api/models/{model}'
 */
destroy.delete = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::destroy
 * @see app/Http/Controllers/Api/ModelController.php:87
 * @route '/api/models/{model}'
 */
    const destroyForm = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::destroy
 * @see app/Http/Controllers/Api/ModelController.php:87
 * @route '/api/models/{model}'
 */
        destroyForm.delete = (args: { model: string | number } | [model: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const models = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default models