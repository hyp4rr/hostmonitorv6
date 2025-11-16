import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
export const dashboardStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardStats.url(options),
    method: 'get',
})

dashboardStats.definition = {
    methods: ["get","head"],
    url: '/api/dashboard/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
dashboardStats.url = (options?: RouteQueryOptions) => {
    return dashboardStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
dashboardStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
dashboardStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboardStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
    const dashboardStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboardStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
        dashboardStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboardStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::dashboardStats
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/dashboard/stats'
 */
        dashboardStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboardStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboardStats.form = dashboardStatsForm
/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:46
 * @route '/api/devices'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/devices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:46
 * @route '/api/devices'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:46
 * @route '/api/devices'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:46
 * @route '/api/devices'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:46
 * @route '/api/devices'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:46
 * @route '/api/devices'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::index
 * @see app/Http/Controllers/Api/DeviceController.php:46
 * @route '/api/devices'
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
* @see \App\Http\Controllers\Api\DeviceController::store
 * @see app/Http/Controllers/Api/DeviceController.php:251
 * @route '/api/devices'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/devices',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::store
 * @see app/Http/Controllers/Api/DeviceController.php:251
 * @route '/api/devices'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::store
 * @see app/Http/Controllers/Api/DeviceController.php:251
 * @route '/api/devices'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::store
 * @see app/Http/Controllers/Api/DeviceController.php:251
 * @route '/api/devices'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::store
 * @see app/Http/Controllers/Api/DeviceController.php:251
 * @route '/api/devices'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
const showcebf6dac5f7ffcafc023908f9f1df1a5 = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showcebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'get',
})

showcebf6dac5f7ffcafc023908f9f1df1a5.definition = {
    methods: ["get","head"],
    url: '/api/devices/{device}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
showcebf6dac5f7ffcafc023908f9f1df1a5.url = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showcebf6dac5f7ffcafc023908f9f1df1a5.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
showcebf6dac5f7ffcafc023908f9f1df1a5.get = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showcebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
showcebf6dac5f7ffcafc023908f9f1df1a5.head = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showcebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
    const showcebf6dac5f7ffcafc023908f9f1df1a5Form = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showcebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
        showcebf6dac5f7ffcafc023908f9f1df1a5Form.get = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showcebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{device}'
 */
        showcebf6dac5f7ffcafc023908f9f1df1a5Form.head = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showcebf6dac5f7ffcafc023908f9f1df1a5.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showcebf6dac5f7ffcafc023908f9f1df1a5.form = showcebf6dac5f7ffcafc023908f9f1df1a5Form
    /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{id}'
 */
const show4ef9ce680b5acfc2da679ad5788196de = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show4ef9ce680b5acfc2da679ad5788196de.url(args, options),
    method: 'get',
})

show4ef9ce680b5acfc2da679ad5788196de.definition = {
    methods: ["get","head"],
    url: '/api/devices/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{id}'
 */
show4ef9ce680b5acfc2da679ad5788196de.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show4ef9ce680b5acfc2da679ad5788196de.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{id}'
 */
show4ef9ce680b5acfc2da679ad5788196de.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show4ef9ce680b5acfc2da679ad5788196de.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{id}'
 */
show4ef9ce680b5acfc2da679ad5788196de.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show4ef9ce680b5acfc2da679ad5788196de.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{id}'
 */
    const show4ef9ce680b5acfc2da679ad5788196deForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show4ef9ce680b5acfc2da679ad5788196de.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{id}'
 */
        show4ef9ce680b5acfc2da679ad5788196deForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show4ef9ce680b5acfc2da679ad5788196de.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::show
 * @see app/Http/Controllers/Api/DeviceController.php:0
 * @route '/api/devices/{id}'
 */
        show4ef9ce680b5acfc2da679ad5788196deForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show4ef9ce680b5acfc2da679ad5788196de.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show4ef9ce680b5acfc2da679ad5788196de.form = show4ef9ce680b5acfc2da679ad5788196deForm

export const show = {
    '/api/devices/{device}': showcebf6dac5f7ffcafc023908f9f1df1a5,
    '/api/devices/{id}': show4ef9ce680b5acfc2da679ad5788196de,
}

/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
const updatecebf6dac5f7ffcafc023908f9f1df1a5 = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatecebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'put',
})

updatecebf6dac5f7ffcafc023908f9f1df1a5.definition = {
    methods: ["put","patch"],
    url: '/api/devices/{device}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
updatecebf6dac5f7ffcafc023908f9f1df1a5.url = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updatecebf6dac5f7ffcafc023908f9f1df1a5.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
updatecebf6dac5f7ffcafc023908f9f1df1a5.put = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatecebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
updatecebf6dac5f7ffcafc023908f9f1df1a5.patch = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updatecebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{device}'
 */
    const updatecebf6dac5f7ffcafc023908f9f1df1a5Form = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatecebf6dac5f7ffcafc023908f9f1df1a5.url(args, {
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
        updatecebf6dac5f7ffcafc023908f9f1df1a5Form.put = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatecebf6dac5f7ffcafc023908f9f1df1a5.url(args, {
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
        updatecebf6dac5f7ffcafc023908f9f1df1a5Form.patch = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatecebf6dac5f7ffcafc023908f9f1df1a5.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatecebf6dac5f7ffcafc023908f9f1df1a5.form = updatecebf6dac5f7ffcafc023908f9f1df1a5Form
    /**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{id}'
 */
const update4ef9ce680b5acfc2da679ad5788196de = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update4ef9ce680b5acfc2da679ad5788196de.url(args, options),
    method: 'put',
})

update4ef9ce680b5acfc2da679ad5788196de.definition = {
    methods: ["put"],
    url: '/api/devices/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{id}'
 */
update4ef9ce680b5acfc2da679ad5788196de.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update4ef9ce680b5acfc2da679ad5788196de.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{id}'
 */
update4ef9ce680b5acfc2da679ad5788196de.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update4ef9ce680b5acfc2da679ad5788196de.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::update
 * @see app/Http/Controllers/Api/DeviceController.php:319
 * @route '/api/devices/{id}'
 */
    const update4ef9ce680b5acfc2da679ad5788196deForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update4ef9ce680b5acfc2da679ad5788196de.url(args, {
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
 * @route '/api/devices/{id}'
 */
        update4ef9ce680b5acfc2da679ad5788196deForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update4ef9ce680b5acfc2da679ad5788196de.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update4ef9ce680b5acfc2da679ad5788196de.form = update4ef9ce680b5acfc2da679ad5788196deForm

export const update = {
    '/api/devices/{device}': updatecebf6dac5f7ffcafc023908f9f1df1a5,
    '/api/devices/{id}': update4ef9ce680b5acfc2da679ad5788196de,
}

/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
const destroycebf6dac5f7ffcafc023908f9f1df1a5 = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroycebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'delete',
})

destroycebf6dac5f7ffcafc023908f9f1df1a5.definition = {
    methods: ["delete"],
    url: '/api/devices/{device}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
destroycebf6dac5f7ffcafc023908f9f1df1a5.url = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroycebf6dac5f7ffcafc023908f9f1df1a5.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
destroycebf6dac5f7ffcafc023908f9f1df1a5.delete = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroycebf6dac5f7ffcafc023908f9f1df1a5.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{device}'
 */
    const destroycebf6dac5f7ffcafc023908f9f1df1a5Form = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroycebf6dac5f7ffcafc023908f9f1df1a5.url(args, {
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
        destroycebf6dac5f7ffcafc023908f9f1df1a5Form.delete = (args: { device: string | number } | [device: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroycebf6dac5f7ffcafc023908f9f1df1a5.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroycebf6dac5f7ffcafc023908f9f1df1a5.form = destroycebf6dac5f7ffcafc023908f9f1df1a5Form
    /**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{id}'
 */
const destroy4ef9ce680b5acfc2da679ad5788196de = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy4ef9ce680b5acfc2da679ad5788196de.url(args, options),
    method: 'delete',
})

destroy4ef9ce680b5acfc2da679ad5788196de.definition = {
    methods: ["delete"],
    url: '/api/devices/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{id}'
 */
destroy4ef9ce680b5acfc2da679ad5788196de.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy4ef9ce680b5acfc2da679ad5788196de.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{id}'
 */
destroy4ef9ce680b5acfc2da679ad5788196de.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy4ef9ce680b5acfc2da679ad5788196de.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::destroy
 * @see app/Http/Controllers/Api/DeviceController.php:402
 * @route '/api/devices/{id}'
 */
    const destroy4ef9ce680b5acfc2da679ad5788196deForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy4ef9ce680b5acfc2da679ad5788196de.url(args, {
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
 * @route '/api/devices/{id}'
 */
        destroy4ef9ce680b5acfc2da679ad5788196deForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy4ef9ce680b5acfc2da679ad5788196de.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy4ef9ce680b5acfc2da679ad5788196de.form = destroy4ef9ce680b5acfc2da679ad5788196deForm

export const destroy = {
    '/api/devices/{device}': destroycebf6dac5f7ffcafc023908f9f1df1a5,
    '/api/devices/{id}': destroy4ef9ce680b5acfc2da679ad5788196de,
}

/**
* @see \App\Http\Controllers\Api\DeviceController::acknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:430
 * @route '/api/devices/{id}/acknowledge-offline'
 */
export const acknowledgeOffline = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledgeOffline.url(args, options),
    method: 'post',
})

acknowledgeOffline.definition = {
    methods: ["post"],
    url: '/api/devices/{id}/acknowledge-offline',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::acknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:430
 * @route '/api/devices/{id}/acknowledge-offline'
 */
acknowledgeOffline.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return acknowledgeOffline.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::acknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:430
 * @route '/api/devices/{id}/acknowledge-offline'
 */
acknowledgeOffline.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledgeOffline.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::acknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:430
 * @route '/api/devices/{id}/acknowledge-offline'
 */
    const acknowledgeOfflineForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: acknowledgeOffline.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::acknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:430
 * @route '/api/devices/{id}/acknowledge-offline'
 */
        acknowledgeOfflineForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: acknowledgeOffline.url(args, options),
            method: 'post',
        })
    
    acknowledgeOffline.form = acknowledgeOfflineForm
/**
* @see \App\Http\Controllers\Api\DeviceController::bulkAcknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:491
 * @route '/api/devices/bulk-acknowledge-offline'
 */
export const bulkAcknowledgeOffline = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkAcknowledgeOffline.url(options),
    method: 'post',
})

bulkAcknowledgeOffline.definition = {
    methods: ["post"],
    url: '/api/devices/bulk-acknowledge-offline',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::bulkAcknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:491
 * @route '/api/devices/bulk-acknowledge-offline'
 */
bulkAcknowledgeOffline.url = (options?: RouteQueryOptions) => {
    return bulkAcknowledgeOffline.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::bulkAcknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:491
 * @route '/api/devices/bulk-acknowledge-offline'
 */
bulkAcknowledgeOffline.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkAcknowledgeOffline.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::bulkAcknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:491
 * @route '/api/devices/bulk-acknowledge-offline'
 */
    const bulkAcknowledgeOfflineForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkAcknowledgeOffline.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::bulkAcknowledgeOffline
 * @see app/Http/Controllers/Api/DeviceController.php:491
 * @route '/api/devices/bulk-acknowledge-offline'
 */
        bulkAcknowledgeOfflineForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkAcknowledgeOffline.url(options),
            method: 'post',
        })
    
    bulkAcknowledgeOffline.form = bulkAcknowledgeOfflineForm
/**
* @see \App\Http\Controllers\Api\DeviceController::bulkUpdate
 * @see app/Http/Controllers/Api/DeviceController.php:578
 * @route '/api/devices/bulk-update'
 */
export const bulkUpdate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkUpdate.url(options),
    method: 'post',
})

bulkUpdate.definition = {
    methods: ["post"],
    url: '/api/devices/bulk-update',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::bulkUpdate
 * @see app/Http/Controllers/Api/DeviceController.php:578
 * @route '/api/devices/bulk-update'
 */
bulkUpdate.url = (options?: RouteQueryOptions) => {
    return bulkUpdate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::bulkUpdate
 * @see app/Http/Controllers/Api/DeviceController.php:578
 * @route '/api/devices/bulk-update'
 */
bulkUpdate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkUpdate.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::bulkUpdate
 * @see app/Http/Controllers/Api/DeviceController.php:578
 * @route '/api/devices/bulk-update'
 */
    const bulkUpdateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkUpdate.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::bulkUpdate
 * @see app/Http/Controllers/Api/DeviceController.php:578
 * @route '/api/devices/bulk-update'
 */
        bulkUpdateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkUpdate.url(options),
            method: 'post',
        })
    
    bulkUpdate.form = bulkUpdateForm
/**
* @see \App\Http\Controllers\Api\DeviceController::resetUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:709
 * @route '/api/devices/reset-uptimes'
 */
export const resetUptimes = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetUptimes.url(options),
    method: 'post',
})

resetUptimes.definition = {
    methods: ["post"],
    url: '/api/devices/reset-uptimes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::resetUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:709
 * @route '/api/devices/reset-uptimes'
 */
resetUptimes.url = (options?: RouteQueryOptions) => {
    return resetUptimes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::resetUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:709
 * @route '/api/devices/reset-uptimes'
 */
resetUptimes.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetUptimes.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::resetUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:709
 * @route '/api/devices/reset-uptimes'
 */
    const resetUptimesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resetUptimes.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::resetUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:709
 * @route '/api/devices/reset-uptimes'
 */
        resetUptimesForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resetUptimes.url(options),
            method: 'post',
        })
    
    resetUptimes.form = resetUptimesForm
/**
* @see \App\Http\Controllers\Api\DeviceController::refreshUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:687
 * @route '/api/devices/refresh-uptimes'
 */
export const refreshUptimes = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshUptimes.url(options),
    method: 'post',
})

refreshUptimes.definition = {
    methods: ["post"],
    url: '/api/devices/refresh-uptimes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::refreshUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:687
 * @route '/api/devices/refresh-uptimes'
 */
refreshUptimes.url = (options?: RouteQueryOptions) => {
    return refreshUptimes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::refreshUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:687
 * @route '/api/devices/refresh-uptimes'
 */
refreshUptimes.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshUptimes.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::refreshUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:687
 * @route '/api/devices/refresh-uptimes'
 */
    const refreshUptimesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refreshUptimes.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::refreshUptimes
 * @see app/Http/Controllers/Api/DeviceController.php:687
 * @route '/api/devices/refresh-uptimes'
 */
        refreshUptimesForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refreshUptimes.url(options),
            method: 'post',
        })
    
    refreshUptimes.form = refreshUptimesForm
/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:197
 * @route '/api/devices/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/api/devices/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:197
 * @route '/api/devices/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:197
 * @route '/api/devices/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:197
 * @route '/api/devices/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:197
 * @route '/api/devices/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:197
 * @route '/api/devices/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeviceController::stats
 * @see app/Http/Controllers/Api/DeviceController.php:197
 * @route '/api/devices/stats'
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
const DeviceController = { dashboardStats, index, store, show, update, destroy, acknowledgeOffline, bulkAcknowledgeOffline, bulkUpdate, resetUptimes, refreshUptimes, stats }

export default DeviceController