import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/brands'
 */
const indexea366fd8c51b018f9efb26ed8d9bdf63 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexea366fd8c51b018f9efb26ed8d9bdf63.url(options),
    method: 'get',
})

indexea366fd8c51b018f9efb26ed8d9bdf63.definition = {
    methods: ["get","head"],
    url: '/api/brands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/brands'
 */
indexea366fd8c51b018f9efb26ed8d9bdf63.url = (options?: RouteQueryOptions) => {
    return indexea366fd8c51b018f9efb26ed8d9bdf63.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/brands'
 */
indexea366fd8c51b018f9efb26ed8d9bdf63.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexea366fd8c51b018f9efb26ed8d9bdf63.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/brands'
 */
indexea366fd8c51b018f9efb26ed8d9bdf63.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexea366fd8c51b018f9efb26ed8d9bdf63.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/brands'
 */
    const indexea366fd8c51b018f9efb26ed8d9bdf63Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexea366fd8c51b018f9efb26ed8d9bdf63.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/brands'
 */
        indexea366fd8c51b018f9efb26ed8d9bdf63Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexea366fd8c51b018f9efb26ed8d9bdf63.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/brands'
 */
        indexea366fd8c51b018f9efb26ed8d9bdf63Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexea366fd8c51b018f9efb26ed8d9bdf63.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexea366fd8c51b018f9efb26ed8d9bdf63.form = indexea366fd8c51b018f9efb26ed8d9bdf63Form
    /**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/hardware/brands'
 */
const index78df4055785a7abd56541bf5e466972f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index78df4055785a7abd56541bf5e466972f.url(options),
    method: 'get',
})

index78df4055785a7abd56541bf5e466972f.definition = {
    methods: ["get","head"],
    url: '/api/hardware/brands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/hardware/brands'
 */
index78df4055785a7abd56541bf5e466972f.url = (options?: RouteQueryOptions) => {
    return index78df4055785a7abd56541bf5e466972f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/hardware/brands'
 */
index78df4055785a7abd56541bf5e466972f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index78df4055785a7abd56541bf5e466972f.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/hardware/brands'
 */
index78df4055785a7abd56541bf5e466972f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index78df4055785a7abd56541bf5e466972f.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/hardware/brands'
 */
    const index78df4055785a7abd56541bf5e466972fForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index78df4055785a7abd56541bf5e466972f.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/hardware/brands'
 */
        index78df4055785a7abd56541bf5e466972fForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index78df4055785a7abd56541bf5e466972f.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BrandController::index
 * @see app/Http/Controllers/Api/BrandController.php:14
 * @route '/api/hardware/brands'
 */
        index78df4055785a7abd56541bf5e466972fForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index78df4055785a7abd56541bf5e466972f.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index78df4055785a7abd56541bf5e466972f.form = index78df4055785a7abd56541bf5e466972fForm

export const index = {
    '/api/brands': indexea366fd8c51b018f9efb26ed8d9bdf63,
    '/api/hardware/brands': index78df4055785a7abd56541bf5e466972f,
}

/**
* @see \App\Http\Controllers\Api\BrandController::store
 * @see app/Http/Controllers/Api/BrandController.php:25
 * @route '/api/brands'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/brands',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BrandController::store
 * @see app/Http/Controllers/Api/BrandController.php:25
 * @route '/api/brands'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::store
 * @see app/Http/Controllers/Api/BrandController.php:25
 * @route '/api/brands'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::store
 * @see app/Http/Controllers/Api/BrandController.php:25
 * @route '/api/brands'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BrandController::store
 * @see app/Http/Controllers/Api/BrandController.php:25
 * @route '/api/brands'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
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
const update9fdf6a2310b86e2e011584569d270bef = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update9fdf6a2310b86e2e011584569d270bef.url(args, options),
    method: 'put',
})

update9fdf6a2310b86e2e011584569d270bef.definition = {
    methods: ["put","patch"],
    url: '/api/brands/{brand}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
update9fdf6a2310b86e2e011584569d270bef.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update9fdf6a2310b86e2e011584569d270bef.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
update9fdf6a2310b86e2e011584569d270bef.put = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update9fdf6a2310b86e2e011584569d270bef.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
update9fdf6a2310b86e2e011584569d270bef.patch = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update9fdf6a2310b86e2e011584569d270bef.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{brand}'
 */
    const update9fdf6a2310b86e2e011584569d270befForm = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update9fdf6a2310b86e2e011584569d270bef.url(args, {
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
        update9fdf6a2310b86e2e011584569d270befForm.put = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update9fdf6a2310b86e2e011584569d270bef.url(args, {
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
        update9fdf6a2310b86e2e011584569d270befForm.patch = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update9fdf6a2310b86e2e011584569d270bef.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update9fdf6a2310b86e2e011584569d270bef.form = update9fdf6a2310b86e2e011584569d270befForm
    /**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{id}'
 */
const update08e1edaaf35a87cc98000c9010465de2 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update08e1edaaf35a87cc98000c9010465de2.url(args, options),
    method: 'put',
})

update08e1edaaf35a87cc98000c9010465de2.definition = {
    methods: ["put"],
    url: '/api/brands/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{id}'
 */
update08e1edaaf35a87cc98000c9010465de2.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update08e1edaaf35a87cc98000c9010465de2.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{id}'
 */
update08e1edaaf35a87cc98000c9010465de2.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update08e1edaaf35a87cc98000c9010465de2.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::update
 * @see app/Http/Controllers/Api/BrandController.php:56
 * @route '/api/brands/{id}'
 */
    const update08e1edaaf35a87cc98000c9010465de2Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update08e1edaaf35a87cc98000c9010465de2.url(args, {
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
 * @route '/api/brands/{id}'
 */
        update08e1edaaf35a87cc98000c9010465de2Form.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update08e1edaaf35a87cc98000c9010465de2.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update08e1edaaf35a87cc98000c9010465de2.form = update08e1edaaf35a87cc98000c9010465de2Form

export const update = {
    '/api/brands/{brand}': update9fdf6a2310b86e2e011584569d270bef,
    '/api/brands/{id}': update08e1edaaf35a87cc98000c9010465de2,
}

/**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
const destroy9fdf6a2310b86e2e011584569d270bef = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy9fdf6a2310b86e2e011584569d270bef.url(args, options),
    method: 'delete',
})

destroy9fdf6a2310b86e2e011584569d270bef.definition = {
    methods: ["delete"],
    url: '/api/brands/{brand}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
destroy9fdf6a2310b86e2e011584569d270bef.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy9fdf6a2310b86e2e011584569d270bef.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
destroy9fdf6a2310b86e2e011584569d270bef.delete = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy9fdf6a2310b86e2e011584569d270bef.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{brand}'
 */
    const destroy9fdf6a2310b86e2e011584569d270befForm = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy9fdf6a2310b86e2e011584569d270bef.url(args, {
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
        destroy9fdf6a2310b86e2e011584569d270befForm.delete = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy9fdf6a2310b86e2e011584569d270bef.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy9fdf6a2310b86e2e011584569d270bef.form = destroy9fdf6a2310b86e2e011584569d270befForm
    /**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{id}'
 */
const destroy08e1edaaf35a87cc98000c9010465de2 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy08e1edaaf35a87cc98000c9010465de2.url(args, options),
    method: 'delete',
})

destroy08e1edaaf35a87cc98000c9010465de2.definition = {
    methods: ["delete"],
    url: '/api/brands/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{id}'
 */
destroy08e1edaaf35a87cc98000c9010465de2.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy08e1edaaf35a87cc98000c9010465de2.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{id}'
 */
destroy08e1edaaf35a87cc98000c9010465de2.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy08e1edaaf35a87cc98000c9010465de2.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BrandController::destroy
 * @see app/Http/Controllers/Api/BrandController.php:100
 * @route '/api/brands/{id}'
 */
    const destroy08e1edaaf35a87cc98000c9010465de2Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy08e1edaaf35a87cc98000c9010465de2.url(args, {
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
 * @route '/api/brands/{id}'
 */
        destroy08e1edaaf35a87cc98000c9010465de2Form.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy08e1edaaf35a87cc98000c9010465de2.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy08e1edaaf35a87cc98000c9010465de2.form = destroy08e1edaaf35a87cc98000c9010465de2Form

export const destroy = {
    '/api/brands/{brand}': destroy9fdf6a2310b86e2e011584569d270bef,
    '/api/brands/{id}': destroy08e1edaaf35a87cc98000c9010465de2,
}

const BrandController = { index, store, show, update, destroy }

export default BrandController