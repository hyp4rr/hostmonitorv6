import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BrandController::show
 * @see app/Http/Controllers/Api/BrandController.php:0
 * @route '/api/brands/{brand}'
 */
export const show = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/brands/{brand}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BrandController::show
 * @see app/Http/Controllers/Api/BrandController.php:0
 * @route '/api/brands/{brand}'
 */
show.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { brand: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    brand: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        brand: args.brand,
                }

    return show.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::show
 * @see app/Http/Controllers/Api/BrandController.php:0
 * @route '/api/brands/{brand}'
 */
show.get = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BrandController::show
 * @see app/Http/Controllers/Api/BrandController.php:0
 * @route '/api/brands/{brand}'
 */
show.head = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::show
 * @see app/Http/Controllers/Api/BrandController.php:0
 * @route '/api/brands/{brand}'
 */
    const showForm = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BrandController::show
 * @see app/Http/Controllers/Api/BrandController.php:0
 * @route '/api/brands/{brand}'
 */
        showForm.get = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BrandController::show
 * @see app/Http/Controllers/Api/BrandController.php:0
 * @route '/api/brands/{brand}'
 */
        showForm.head = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
export const update = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/brands/{brand}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
update.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { brand: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    brand: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        brand: args.brand,
                }

    return update.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
update.put = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
update.patch = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
    const updateForm = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
        updateForm.put = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
        updateForm.patch = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
export const destroy = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/brands/{brand}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
destroy.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { brand: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    brand: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        brand: args.brand,
                }

    return destroy.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
destroy.delete = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
    const destroyForm = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
        destroyForm.delete = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const brands = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default brands