import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BranchController::index
 * @see app/Http/Controllers/Api/BranchController.php:13
 * @route '/api/branches'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BranchController::index
 * @see app/Http/Controllers/Api/BranchController.php:13
 * @route '/api/branches'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BranchController::index
 * @see app/Http/Controllers/Api/BranchController.php:13
 * @route '/api/branches'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BranchController::index
 * @see app/Http/Controllers/Api/BranchController.php:13
 * @route '/api/branches'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BranchController::index
 * @see app/Http/Controllers/Api/BranchController.php:13
 * @route '/api/branches'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BranchController::index
 * @see app/Http/Controllers/Api/BranchController.php:13
 * @route '/api/branches'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BranchController::index
 * @see app/Http/Controllers/Api/BranchController.php:13
 * @route '/api/branches'
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
* @see \App\Http\Controllers\Api\BranchController::store
 * @see app/Http/Controllers/Api/BranchController.php:24
 * @route '/api/branches'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/branches',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BranchController::store
 * @see app/Http/Controllers/Api/BranchController.php:24
 * @route '/api/branches'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BranchController::store
 * @see app/Http/Controllers/Api/BranchController.php:24
 * @route '/api/branches'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BranchController::store
 * @see app/Http/Controllers/Api/BranchController.php:24
 * @route '/api/branches'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BranchController::store
 * @see app/Http/Controllers/Api/BranchController.php:24
 * @route '/api/branches'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\BranchController::show
 * @see app/Http/Controllers/Api/BranchController.php:57
 * @route '/api/branches/{branch}'
 */
export const show = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/branches/{branch}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BranchController::show
 * @see app/Http/Controllers/Api/BranchController.php:57
 * @route '/api/branches/{branch}'
 */
show.url = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: args.branch,
                }

    return show.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BranchController::show
 * @see app/Http/Controllers/Api/BranchController.php:57
 * @route '/api/branches/{branch}'
 */
show.get = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BranchController::show
 * @see app/Http/Controllers/Api/BranchController.php:57
 * @route '/api/branches/{branch}'
 */
show.head = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BranchController::show
 * @see app/Http/Controllers/Api/BranchController.php:57
 * @route '/api/branches/{branch}'
 */
    const showForm = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BranchController::show
 * @see app/Http/Controllers/Api/BranchController.php:57
 * @route '/api/branches/{branch}'
 */
        showForm.get = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BranchController::show
 * @see app/Http/Controllers/Api/BranchController.php:57
 * @route '/api/branches/{branch}'
 */
        showForm.head = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\BranchController::update
 * @see app/Http/Controllers/Api/BranchController.php:68
 * @route '/api/branches/{branch}'
 */
export const update = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/branches/{branch}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\BranchController::update
 * @see app/Http/Controllers/Api/BranchController.php:68
 * @route '/api/branches/{branch}'
 */
update.url = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: args.branch,
                }

    return update.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BranchController::update
 * @see app/Http/Controllers/Api/BranchController.php:68
 * @route '/api/branches/{branch}'
 */
update.put = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\BranchController::update
 * @see app/Http/Controllers/Api/BranchController.php:68
 * @route '/api/branches/{branch}'
 */
update.patch = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\BranchController::update
 * @see app/Http/Controllers/Api/BranchController.php:68
 * @route '/api/branches/{branch}'
 */
    const updateForm = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BranchController::update
 * @see app/Http/Controllers/Api/BranchController.php:68
 * @route '/api/branches/{branch}'
 */
        updateForm.put = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\BranchController::update
 * @see app/Http/Controllers/Api/BranchController.php:68
 * @route '/api/branches/{branch}'
 */
        updateForm.patch = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\BranchController::destroy
 * @see app/Http/Controllers/Api/BranchController.php:102
 * @route '/api/branches/{branch}'
 */
export const destroy = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/branches/{branch}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BranchController::destroy
 * @see app/Http/Controllers/Api/BranchController.php:102
 * @route '/api/branches/{branch}'
 */
destroy.url = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: args.branch,
                }

    return destroy.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BranchController::destroy
 * @see app/Http/Controllers/Api/BranchController.php:102
 * @route '/api/branches/{branch}'
 */
destroy.delete = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BranchController::destroy
 * @see app/Http/Controllers/Api/BranchController.php:102
 * @route '/api/branches/{branch}'
 */
    const destroyForm = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BranchController::destroy
 * @see app/Http/Controllers/Api/BranchController.php:102
 * @route '/api/branches/{branch}'
 */
        destroyForm.delete = (args: { branch: string | number } | [branch: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const BranchController = { index, store, show, update, destroy }

export default BranchController