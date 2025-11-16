import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/api/alerts'
 */
const indexbf030dfa03534c15ae37c06015b8f716 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexbf030dfa03534c15ae37c06015b8f716.url(options),
    method: 'get',
})

indexbf030dfa03534c15ae37c06015b8f716.definition = {
    methods: ["get","head"],
    url: '/api/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/api/alerts'
 */
indexbf030dfa03534c15ae37c06015b8f716.url = (options?: RouteQueryOptions) => {
    return indexbf030dfa03534c15ae37c06015b8f716.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/api/alerts'
 */
indexbf030dfa03534c15ae37c06015b8f716.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexbf030dfa03534c15ae37c06015b8f716.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/api/alerts'
 */
indexbf030dfa03534c15ae37c06015b8f716.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexbf030dfa03534c15ae37c06015b8f716.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/api/alerts'
 */
    const indexbf030dfa03534c15ae37c06015b8f716Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexbf030dfa03534c15ae37c06015b8f716.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/api/alerts'
 */
        indexbf030dfa03534c15ae37c06015b8f716Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexbf030dfa03534c15ae37c06015b8f716.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/api/alerts'
 */
        indexbf030dfa03534c15ae37c06015b8f716Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexbf030dfa03534c15ae37c06015b8f716.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexbf030dfa03534c15ae37c06015b8f716.form = indexbf030dfa03534c15ae37c06015b8f716Form
    /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/alerts'
 */
const index902022dd28ecb1fc39bf2237880a22d0 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index902022dd28ecb1fc39bf2237880a22d0.url(options),
    method: 'get',
})

index902022dd28ecb1fc39bf2237880a22d0.definition = {
    methods: ["get","head"],
    url: '/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/alerts'
 */
index902022dd28ecb1fc39bf2237880a22d0.url = (options?: RouteQueryOptions) => {
    return index902022dd28ecb1fc39bf2237880a22d0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/alerts'
 */
index902022dd28ecb1fc39bf2237880a22d0.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index902022dd28ecb1fc39bf2237880a22d0.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/alerts'
 */
index902022dd28ecb1fc39bf2237880a22d0.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index902022dd28ecb1fc39bf2237880a22d0.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/alerts'
 */
    const index902022dd28ecb1fc39bf2237880a22d0Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index902022dd28ecb1fc39bf2237880a22d0.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/alerts'
 */
        index902022dd28ecb1fc39bf2237880a22d0Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index902022dd28ecb1fc39bf2237880a22d0.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AlertController::index
 * @see app/Http/Controllers/Api/AlertController.php:14
 * @route '/alerts'
 */
        index902022dd28ecb1fc39bf2237880a22d0Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index902022dd28ecb1fc39bf2237880a22d0.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index902022dd28ecb1fc39bf2237880a22d0.form = index902022dd28ecb1fc39bf2237880a22d0Form

export const index = {
    '/api/alerts': indexbf030dfa03534c15ae37c06015b8f716,
    '/alerts': index902022dd28ecb1fc39bf2237880a22d0,
}

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
const update82db8bfc777c206bee42e8ae5d1f6acf = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, options),
    method: 'put',
})

update82db8bfc777c206bee42e8ae5d1f6acf.definition = {
    methods: ["put","patch"],
    url: '/api/alerts/{alert}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update82db8bfc777c206bee42e8ae5d1f6acf.url = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update82db8bfc777c206bee42e8ae5d1f6acf.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update82db8bfc777c206bee42e8ae5d1f6acf.put = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update82db8bfc777c206bee42e8ae5d1f6acf.patch = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
    const update82db8bfc777c206bee42e8ae5d1f6acfForm = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, {
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
        update82db8bfc777c206bee42e8ae5d1f6acfForm.put = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, {
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
        update82db8bfc777c206bee42e8ae5d1f6acfForm.patch = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update82db8bfc777c206bee42e8ae5d1f6acf.form = update82db8bfc777c206bee42e8ae5d1f6acfForm
    /**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
const update82db8bfc777c206bee42e8ae5d1f6acf = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, options),
    method: 'put',
})

update82db8bfc777c206bee42e8ae5d1f6acf.definition = {
    methods: ["put"],
    url: '/api/alerts/{alert}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update82db8bfc777c206bee42e8ae5d1f6acf.url = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update82db8bfc777c206bee42e8ae5d1f6acf.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
update82db8bfc777c206bee42e8ae5d1f6acf.put = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::update
 * @see app/Http/Controllers/Api/AlertController.php:104
 * @route '/api/alerts/{alert}'
 */
    const update82db8bfc777c206bee42e8ae5d1f6acfForm = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, {
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
        update82db8bfc777c206bee42e8ae5d1f6acfForm.put = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update82db8bfc777c206bee42e8ae5d1f6acf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update82db8bfc777c206bee42e8ae5d1f6acf.form = update82db8bfc777c206bee42e8ae5d1f6acfForm

export const update = {
    '/api/alerts/{alert}': update82db8bfc777c206bee42e8ae5d1f6acf,
    '/api/alerts/{alert}': update82db8bfc777c206bee42e8ae5d1f6acf,
}

/**
* @see \App\Http\Controllers\Api\AlertController::destroy
 * @see app/Http/Controllers/Api/AlertController.php:221
 * @route '/api/alerts/{alert}'
 */
export const destroy = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/alerts/{alert}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\AlertController::destroy
 * @see app/Http/Controllers/Api/AlertController.php:221
 * @route '/api/alerts/{alert}'
 */
destroy.url = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::destroy
 * @see app/Http/Controllers/Api/AlertController.php:221
 * @route '/api/alerts/{alert}'
 */
destroy.delete = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::destroy
 * @see app/Http/Controllers/Api/AlertController.php:221
 * @route '/api/alerts/{alert}'
 */
    const destroyForm = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::destroy
 * @see app/Http/Controllers/Api/AlertController.php:221
 * @route '/api/alerts/{alert}'
 */
        destroyForm.delete = (args: { alert: string | number } | [alert: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/alerts/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AlertController::stats
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/stats'
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
/**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/read'
 */
export const markAsRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.definition = {
    methods: ["post"],
    url: '/alerts/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/read'
 */
markAsRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markAsRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/read'
 */
markAsRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/read'
 */
    const markAsReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAsRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::markAsRead
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/read'
 */
        markAsReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAsRead.url(args, options),
            method: 'post',
        })
    
    markAsRead.form = markAsReadForm
/**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/resolve'
 */
export const resolve = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

resolve.definition = {
    methods: ["post"],
    url: '/alerts/{id}/resolve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/resolve'
 */
resolve.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return resolve.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/resolve'
 */
resolve.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/resolve'
 */
    const resolveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resolve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AlertController::resolve
 * @see app/Http/Controllers/Api/AlertController.php:0
 * @route '/alerts/{id}/resolve'
 */
        resolveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resolve.url(args, options),
            method: 'post',
        })
    
    resolve.form = resolveForm
const AlertController = { index, store, show, update, destroy, stats, markAsRead, resolve }

export default AlertController