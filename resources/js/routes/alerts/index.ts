import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AlertController::store
 * @see app/Http/Controllers/Api/AlertController.php:34
 * @route '/api/alerts'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/alerts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AlertController::store
 * @see app/Http/Controllers/Api/AlertController.php:34
 * @route '/api/alerts'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::store
 * @see app/Http/Controllers/Api/AlertController.php:34
 * @route '/api/alerts'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::store
 * @see app/Http/Controllers/Api/AlertController.php:34
 * @route '/api/alerts'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::store
 * @see app/Http/Controllers/Api/AlertController.php:34
 * @route '/api/alerts'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\AlertController::show
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/api/alerts/{alert}'
 */
export const show = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/alerts/{alert}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AlertController::show
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/api/alerts/{alert}'
 */
show.url = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alert: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    alert: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        alert: args.alert,
                }

    return show.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::show
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/api/alerts/{alert}'
 */
show.get = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AlertController::show
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/api/alerts/{alert}'
 */
show.head = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::show
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/api/alerts/{alert}'
 */
    const showForm = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::show
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/api/alerts/{alert}'
 */
        showForm.get = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AlertController::show
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/api/alerts/{alert}'
 */
        showForm.head = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
export const update = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/alerts/{alert}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update.url = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alert: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    alert: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        alert: args.alert,
                }

    return update.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update.put = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update.patch = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
    const updateForm = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
        updateForm.put = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
        updateForm.patch = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const alerts = {
    store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
}

export default alerts