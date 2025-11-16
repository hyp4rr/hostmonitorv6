import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ConfigurationController::login
 * @see app/Http/Controllers/ConfigurationController.php:17
 * @route '/api/config/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/api/config/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConfigurationController::login
 * @see app/Http/Controllers/ConfigurationController.php:17
 * @route '/api/config/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::login
 * @see app/Http/Controllers/ConfigurationController.php:17
 * @route '/api/config/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::login
 * @see app/Http/Controllers/ConfigurationController.php:17
 * @route '/api/config/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::login
 * @see app/Http/Controllers/ConfigurationController.php:17
 * @route '/api/config/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
/**
* @see \App\Http\Controllers\ConfigurationController::logout
 * @see app/Http/Controllers/ConfigurationController.php:45
 * @route '/api/config/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/api/config/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConfigurationController::logout
 * @see app/Http/Controllers/ConfigurationController.php:45
 * @route '/api/config/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::logout
 * @see app/Http/Controllers/ConfigurationController.php:45
 * @route '/api/config/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::logout
 * @see app/Http/Controllers/ConfigurationController.php:45
 * @route '/api/config/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::logout
 * @see app/Http/Controllers/ConfigurationController.php:45
 * @route '/api/config/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \App\Http\Controllers\ConfigurationController::getBranches
 * @see app/Http/Controllers/ConfigurationController.php:54
 * @route '/api/config/branches'
 */
export const getBranches = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getBranches.url(options),
    method: 'get',
})

getBranches.definition = {
    methods: ["get","head"],
    url: '/api/config/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConfigurationController::getBranches
 * @see app/Http/Controllers/ConfigurationController.php:54
 * @route '/api/config/branches'
 */
getBranches.url = (options?: RouteQueryOptions) => {
    return getBranches.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::getBranches
 * @see app/Http/Controllers/ConfigurationController.php:54
 * @route '/api/config/branches'
 */
getBranches.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getBranches.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConfigurationController::getBranches
 * @see app/Http/Controllers/ConfigurationController.php:54
 * @route '/api/config/branches'
 */
getBranches.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getBranches.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::getBranches
 * @see app/Http/Controllers/ConfigurationController.php:54
 * @route '/api/config/branches'
 */
    const getBranchesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getBranches.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::getBranches
 * @see app/Http/Controllers/ConfigurationController.php:54
 * @route '/api/config/branches'
 */
        getBranchesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getBranches.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConfigurationController::getBranches
 * @see app/Http/Controllers/ConfigurationController.php:54
 * @route '/api/config/branches'
 */
        getBranchesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getBranches.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getBranches.form = getBranchesForm
/**
* @see \App\Http\Controllers\ConfigurationController::createBranch
 * @see app/Http/Controllers/ConfigurationController.php:59
 * @route '/api/config/branches'
 */
export const createBranch = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBranch.url(options),
    method: 'post',
})

createBranch.definition = {
    methods: ["post"],
    url: '/api/config/branches',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConfigurationController::createBranch
 * @see app/Http/Controllers/ConfigurationController.php:59
 * @route '/api/config/branches'
 */
createBranch.url = (options?: RouteQueryOptions) => {
    return createBranch.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::createBranch
 * @see app/Http/Controllers/ConfigurationController.php:59
 * @route '/api/config/branches'
 */
createBranch.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBranch.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::createBranch
 * @see app/Http/Controllers/ConfigurationController.php:59
 * @route '/api/config/branches'
 */
    const createBranchForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createBranch.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::createBranch
 * @see app/Http/Controllers/ConfigurationController.php:59
 * @route '/api/config/branches'
 */
        createBranchForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createBranch.url(options),
            method: 'post',
        })
    
    createBranch.form = createBranchForm
/**
* @see \App\Http\Controllers\ConfigurationController::updateBranch
 * @see app/Http/Controllers/ConfigurationController.php:75
 * @route '/api/config/branches/{id}'
 */
export const updateBranch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBranch.url(args, options),
    method: 'put',
})

updateBranch.definition = {
    methods: ["put"],
    url: '/api/config/branches/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConfigurationController::updateBranch
 * @see app/Http/Controllers/ConfigurationController.php:75
 * @route '/api/config/branches/{id}'
 */
updateBranch.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateBranch.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::updateBranch
 * @see app/Http/Controllers/ConfigurationController.php:75
 * @route '/api/config/branches/{id}'
 */
updateBranch.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBranch.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::updateBranch
 * @see app/Http/Controllers/ConfigurationController.php:75
 * @route '/api/config/branches/{id}'
 */
    const updateBranchForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateBranch.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::updateBranch
 * @see app/Http/Controllers/ConfigurationController.php:75
 * @route '/api/config/branches/{id}'
 */
        updateBranchForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateBranch.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateBranch.form = updateBranchForm
/**
* @see \App\Http\Controllers\ConfigurationController::deleteBranch
 * @see app/Http/Controllers/ConfigurationController.php:95
 * @route '/api/config/branches/{id}'
 */
export const deleteBranch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteBranch.url(args, options),
    method: 'delete',
})

deleteBranch.definition = {
    methods: ["delete"],
    url: '/api/config/branches/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConfigurationController::deleteBranch
 * @see app/Http/Controllers/ConfigurationController.php:95
 * @route '/api/config/branches/{id}'
 */
deleteBranch.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteBranch.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::deleteBranch
 * @see app/Http/Controllers/ConfigurationController.php:95
 * @route '/api/config/branches/{id}'
 */
deleteBranch.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteBranch.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::deleteBranch
 * @see app/Http/Controllers/ConfigurationController.php:95
 * @route '/api/config/branches/{id}'
 */
    const deleteBranchForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteBranch.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::deleteBranch
 * @see app/Http/Controllers/ConfigurationController.php:95
 * @route '/api/config/branches/{id}'
 */
        deleteBranchForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteBranch.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteBranch.form = deleteBranchForm
/**
* @see \App\Http\Controllers\ConfigurationController::getDevices
 * @see app/Http/Controllers/ConfigurationController.php:103
 * @route '/api/config/devices'
 */
export const getDevices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDevices.url(options),
    method: 'get',
})

getDevices.definition = {
    methods: ["get","head"],
    url: '/api/config/devices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConfigurationController::getDevices
 * @see app/Http/Controllers/ConfigurationController.php:103
 * @route '/api/config/devices'
 */
getDevices.url = (options?: RouteQueryOptions) => {
    return getDevices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::getDevices
 * @see app/Http/Controllers/ConfigurationController.php:103
 * @route '/api/config/devices'
 */
getDevices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDevices.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConfigurationController::getDevices
 * @see app/Http/Controllers/ConfigurationController.php:103
 * @route '/api/config/devices'
 */
getDevices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getDevices.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::getDevices
 * @see app/Http/Controllers/ConfigurationController.php:103
 * @route '/api/config/devices'
 */
    const getDevicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getDevices.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::getDevices
 * @see app/Http/Controllers/ConfigurationController.php:103
 * @route '/api/config/devices'
 */
        getDevicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getDevices.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConfigurationController::getDevices
 * @see app/Http/Controllers/ConfigurationController.php:103
 * @route '/api/config/devices'
 */
        getDevicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getDevices.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getDevices.form = getDevicesForm
/**
* @see \App\Http\Controllers\ConfigurationController::createDevice
 * @see app/Http/Controllers/ConfigurationController.php:108
 * @route '/api/config/devices'
 */
export const createDevice = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createDevice.url(options),
    method: 'post',
})

createDevice.definition = {
    methods: ["post"],
    url: '/api/config/devices',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConfigurationController::createDevice
 * @see app/Http/Controllers/ConfigurationController.php:108
 * @route '/api/config/devices'
 */
createDevice.url = (options?: RouteQueryOptions) => {
    return createDevice.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::createDevice
 * @see app/Http/Controllers/ConfigurationController.php:108
 * @route '/api/config/devices'
 */
createDevice.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createDevice.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::createDevice
 * @see app/Http/Controllers/ConfigurationController.php:108
 * @route '/api/config/devices'
 */
    const createDeviceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createDevice.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::createDevice
 * @see app/Http/Controllers/ConfigurationController.php:108
 * @route '/api/config/devices'
 */
        createDeviceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createDevice.url(options),
            method: 'post',
        })
    
    createDevice.form = createDeviceForm
/**
* @see \App\Http\Controllers\ConfigurationController::updateDevice
 * @see app/Http/Controllers/ConfigurationController.php:143
 * @route '/api/config/devices/{id}'
 */
export const updateDevice = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateDevice.url(args, options),
    method: 'put',
})

updateDevice.definition = {
    methods: ["put"],
    url: '/api/config/devices/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConfigurationController::updateDevice
 * @see app/Http/Controllers/ConfigurationController.php:143
 * @route '/api/config/devices/{id}'
 */
updateDevice.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateDevice.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::updateDevice
 * @see app/Http/Controllers/ConfigurationController.php:143
 * @route '/api/config/devices/{id}'
 */
updateDevice.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateDevice.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::updateDevice
 * @see app/Http/Controllers/ConfigurationController.php:143
 * @route '/api/config/devices/{id}'
 */
    const updateDeviceForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateDevice.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::updateDevice
 * @see app/Http/Controllers/ConfigurationController.php:143
 * @route '/api/config/devices/{id}'
 */
        updateDeviceForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateDevice.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateDevice.form = updateDeviceForm
/**
* @see \App\Http\Controllers\ConfigurationController::deleteDevice
 * @see app/Http/Controllers/ConfigurationController.php:185
 * @route '/api/config/devices/{id}'
 */
export const deleteDevice = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteDevice.url(args, options),
    method: 'delete',
})

deleteDevice.definition = {
    methods: ["delete"],
    url: '/api/config/devices/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConfigurationController::deleteDevice
 * @see app/Http/Controllers/ConfigurationController.php:185
 * @route '/api/config/devices/{id}'
 */
deleteDevice.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteDevice.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::deleteDevice
 * @see app/Http/Controllers/ConfigurationController.php:185
 * @route '/api/config/devices/{id}'
 */
deleteDevice.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteDevice.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::deleteDevice
 * @see app/Http/Controllers/ConfigurationController.php:185
 * @route '/api/config/devices/{id}'
 */
    const deleteDeviceForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteDevice.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::deleteDevice
 * @see app/Http/Controllers/ConfigurationController.php:185
 * @route '/api/config/devices/{id}'
 */
        deleteDeviceForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteDevice.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteDevice.form = deleteDeviceForm
/**
* @see \App\Http\Controllers\ConfigurationController::getAlerts
 * @see app/Http/Controllers/ConfigurationController.php:193
 * @route '/api/config/alerts'
 */
export const getAlerts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAlerts.url(options),
    method: 'get',
})

getAlerts.definition = {
    methods: ["get","head"],
    url: '/api/config/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConfigurationController::getAlerts
 * @see app/Http/Controllers/ConfigurationController.php:193
 * @route '/api/config/alerts'
 */
getAlerts.url = (options?: RouteQueryOptions) => {
    return getAlerts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::getAlerts
 * @see app/Http/Controllers/ConfigurationController.php:193
 * @route '/api/config/alerts'
 */
getAlerts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAlerts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConfigurationController::getAlerts
 * @see app/Http/Controllers/ConfigurationController.php:193
 * @route '/api/config/alerts'
 */
getAlerts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAlerts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::getAlerts
 * @see app/Http/Controllers/ConfigurationController.php:193
 * @route '/api/config/alerts'
 */
    const getAlertsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getAlerts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::getAlerts
 * @see app/Http/Controllers/ConfigurationController.php:193
 * @route '/api/config/alerts'
 */
        getAlertsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getAlerts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConfigurationController::getAlerts
 * @see app/Http/Controllers/ConfigurationController.php:193
 * @route '/api/config/alerts'
 */
        getAlertsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getAlerts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getAlerts.form = getAlertsForm
/**
* @see \App\Http\Controllers\ConfigurationController::updateAlert
 * @see app/Http/Controllers/ConfigurationController.php:198
 * @route '/api/config/alerts/{id}'
 */
export const updateAlert = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAlert.url(args, options),
    method: 'put',
})

updateAlert.definition = {
    methods: ["put"],
    url: '/api/config/alerts/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConfigurationController::updateAlert
 * @see app/Http/Controllers/ConfigurationController.php:198
 * @route '/api/config/alerts/{id}'
 */
updateAlert.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateAlert.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::updateAlert
 * @see app/Http/Controllers/ConfigurationController.php:198
 * @route '/api/config/alerts/{id}'
 */
updateAlert.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAlert.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::updateAlert
 * @see app/Http/Controllers/ConfigurationController.php:198
 * @route '/api/config/alerts/{id}'
 */
    const updateAlertForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateAlert.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::updateAlert
 * @see app/Http/Controllers/ConfigurationController.php:198
 * @route '/api/config/alerts/{id}'
 */
        updateAlertForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateAlert.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateAlert.form = updateAlertForm
/**
* @see \App\Http\Controllers\ConfigurationController::deleteAlert
 * @see app/Http/Controllers/ConfigurationController.php:222
 * @route '/api/config/alerts/{id}'
 */
export const deleteAlert = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAlert.url(args, options),
    method: 'delete',
})

deleteAlert.definition = {
    methods: ["delete"],
    url: '/api/config/alerts/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConfigurationController::deleteAlert
 * @see app/Http/Controllers/ConfigurationController.php:222
 * @route '/api/config/alerts/{id}'
 */
deleteAlert.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteAlert.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::deleteAlert
 * @see app/Http/Controllers/ConfigurationController.php:222
 * @route '/api/config/alerts/{id}'
 */
deleteAlert.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAlert.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::deleteAlert
 * @see app/Http/Controllers/ConfigurationController.php:222
 * @route '/api/config/alerts/{id}'
 */
    const deleteAlertForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteAlert.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::deleteAlert
 * @see app/Http/Controllers/ConfigurationController.php:222
 * @route '/api/config/alerts/{id}'
 */
        deleteAlertForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteAlert.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteAlert.form = deleteAlertForm
/**
* @see \App\Http\Controllers\ConfigurationController::getLocations
 * @see app/Http/Controllers/ConfigurationController.php:230
 * @route '/api/config/locations'
 */
export const getLocations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getLocations.url(options),
    method: 'get',
})

getLocations.definition = {
    methods: ["get","head"],
    url: '/api/config/locations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConfigurationController::getLocations
 * @see app/Http/Controllers/ConfigurationController.php:230
 * @route '/api/config/locations'
 */
getLocations.url = (options?: RouteQueryOptions) => {
    return getLocations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::getLocations
 * @see app/Http/Controllers/ConfigurationController.php:230
 * @route '/api/config/locations'
 */
getLocations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getLocations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConfigurationController::getLocations
 * @see app/Http/Controllers/ConfigurationController.php:230
 * @route '/api/config/locations'
 */
getLocations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getLocations.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::getLocations
 * @see app/Http/Controllers/ConfigurationController.php:230
 * @route '/api/config/locations'
 */
    const getLocationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getLocations.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::getLocations
 * @see app/Http/Controllers/ConfigurationController.php:230
 * @route '/api/config/locations'
 */
        getLocationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getLocations.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConfigurationController::getLocations
 * @see app/Http/Controllers/ConfigurationController.php:230
 * @route '/api/config/locations'
 */
        getLocationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getLocations.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getLocations.form = getLocationsForm
/**
* @see \App\Http\Controllers\ConfigurationController::createLocation
 * @see app/Http/Controllers/ConfigurationController.php:235
 * @route '/api/config/locations'
 */
export const createLocation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createLocation.url(options),
    method: 'post',
})

createLocation.definition = {
    methods: ["post"],
    url: '/api/config/locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConfigurationController::createLocation
 * @see app/Http/Controllers/ConfigurationController.php:235
 * @route '/api/config/locations'
 */
createLocation.url = (options?: RouteQueryOptions) => {
    return createLocation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::createLocation
 * @see app/Http/Controllers/ConfigurationController.php:235
 * @route '/api/config/locations'
 */
createLocation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createLocation.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::createLocation
 * @see app/Http/Controllers/ConfigurationController.php:235
 * @route '/api/config/locations'
 */
    const createLocationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createLocation.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::createLocation
 * @see app/Http/Controllers/ConfigurationController.php:235
 * @route '/api/config/locations'
 */
        createLocationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createLocation.url(options),
            method: 'post',
        })
    
    createLocation.form = createLocationForm
/**
* @see \App\Http\Controllers\ConfigurationController::updateLocation
 * @see app/Http/Controllers/ConfigurationController.php:249
 * @route '/api/config/locations/{id}'
 */
export const updateLocation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateLocation.url(args, options),
    method: 'put',
})

updateLocation.definition = {
    methods: ["put"],
    url: '/api/config/locations/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConfigurationController::updateLocation
 * @see app/Http/Controllers/ConfigurationController.php:249
 * @route '/api/config/locations/{id}'
 */
updateLocation.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateLocation.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::updateLocation
 * @see app/Http/Controllers/ConfigurationController.php:249
 * @route '/api/config/locations/{id}'
 */
updateLocation.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateLocation.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::updateLocation
 * @see app/Http/Controllers/ConfigurationController.php:249
 * @route '/api/config/locations/{id}'
 */
    const updateLocationForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateLocation.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::updateLocation
 * @see app/Http/Controllers/ConfigurationController.php:249
 * @route '/api/config/locations/{id}'
 */
        updateLocationForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateLocation.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateLocation.form = updateLocationForm
/**
* @see \App\Http\Controllers\ConfigurationController::deleteLocation
 * @see app/Http/Controllers/ConfigurationController.php:265
 * @route '/api/config/locations/{id}'
 */
export const deleteLocation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteLocation.url(args, options),
    method: 'delete',
})

deleteLocation.definition = {
    methods: ["delete"],
    url: '/api/config/locations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConfigurationController::deleteLocation
 * @see app/Http/Controllers/ConfigurationController.php:265
 * @route '/api/config/locations/{id}'
 */
deleteLocation.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteLocation.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::deleteLocation
 * @see app/Http/Controllers/ConfigurationController.php:265
 * @route '/api/config/locations/{id}'
 */
deleteLocation.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteLocation.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::deleteLocation
 * @see app/Http/Controllers/ConfigurationController.php:265
 * @route '/api/config/locations/{id}'
 */
    const deleteLocationForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteLocation.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::deleteLocation
 * @see app/Http/Controllers/ConfigurationController.php:265
 * @route '/api/config/locations/{id}'
 */
        deleteLocationForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteLocation.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteLocation.form = deleteLocationForm
/**
* @see \App\Http\Controllers\ConfigurationController::getUsers
 * @see app/Http/Controllers/ConfigurationController.php:273
 * @route '/api/config/users'
 */
export const getUsers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getUsers.url(options),
    method: 'get',
})

getUsers.definition = {
    methods: ["get","head"],
    url: '/api/config/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConfigurationController::getUsers
 * @see app/Http/Controllers/ConfigurationController.php:273
 * @route '/api/config/users'
 */
getUsers.url = (options?: RouteQueryOptions) => {
    return getUsers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::getUsers
 * @see app/Http/Controllers/ConfigurationController.php:273
 * @route '/api/config/users'
 */
getUsers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getUsers.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConfigurationController::getUsers
 * @see app/Http/Controllers/ConfigurationController.php:273
 * @route '/api/config/users'
 */
getUsers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getUsers.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::getUsers
 * @see app/Http/Controllers/ConfigurationController.php:273
 * @route '/api/config/users'
 */
    const getUsersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getUsers.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::getUsers
 * @see app/Http/Controllers/ConfigurationController.php:273
 * @route '/api/config/users'
 */
        getUsersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getUsers.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConfigurationController::getUsers
 * @see app/Http/Controllers/ConfigurationController.php:273
 * @route '/api/config/users'
 */
        getUsersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getUsers.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getUsers.form = getUsersForm
/**
* @see \App\Http\Controllers\ConfigurationController::createUser
 * @see app/Http/Controllers/ConfigurationController.php:278
 * @route '/api/config/users'
 */
export const createUser = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createUser.url(options),
    method: 'post',
})

createUser.definition = {
    methods: ["post"],
    url: '/api/config/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConfigurationController::createUser
 * @see app/Http/Controllers/ConfigurationController.php:278
 * @route '/api/config/users'
 */
createUser.url = (options?: RouteQueryOptions) => {
    return createUser.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::createUser
 * @see app/Http/Controllers/ConfigurationController.php:278
 * @route '/api/config/users'
 */
createUser.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createUser.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::createUser
 * @see app/Http/Controllers/ConfigurationController.php:278
 * @route '/api/config/users'
 */
    const createUserForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createUser.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::createUser
 * @see app/Http/Controllers/ConfigurationController.php:278
 * @route '/api/config/users'
 */
        createUserForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createUser.url(options),
            method: 'post',
        })
    
    createUser.form = createUserForm
/**
* @see \App\Http\Controllers\ConfigurationController::updateUser
 * @see app/Http/Controllers/ConfigurationController.php:293
 * @route '/api/config/users/{id}'
 */
export const updateUser = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUser.url(args, options),
    method: 'put',
})

updateUser.definition = {
    methods: ["put"],
    url: '/api/config/users/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConfigurationController::updateUser
 * @see app/Http/Controllers/ConfigurationController.php:293
 * @route '/api/config/users/{id}'
 */
updateUser.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateUser.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::updateUser
 * @see app/Http/Controllers/ConfigurationController.php:293
 * @route '/api/config/users/{id}'
 */
updateUser.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUser.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::updateUser
 * @see app/Http/Controllers/ConfigurationController.php:293
 * @route '/api/config/users/{id}'
 */
    const updateUserForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateUser.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::updateUser
 * @see app/Http/Controllers/ConfigurationController.php:293
 * @route '/api/config/users/{id}'
 */
        updateUserForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateUser.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateUser.form = updateUserForm
/**
* @see \App\Http\Controllers\ConfigurationController::deleteUser
 * @see app/Http/Controllers/ConfigurationController.php:314
 * @route '/api/config/users/{id}'
 */
export const deleteUser = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteUser.url(args, options),
    method: 'delete',
})

deleteUser.definition = {
    methods: ["delete"],
    url: '/api/config/users/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConfigurationController::deleteUser
 * @see app/Http/Controllers/ConfigurationController.php:314
 * @route '/api/config/users/{id}'
 */
deleteUser.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteUser.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConfigurationController::deleteUser
 * @see app/Http/Controllers/ConfigurationController.php:314
 * @route '/api/config/users/{id}'
 */
deleteUser.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteUser.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ConfigurationController::deleteUser
 * @see app/Http/Controllers/ConfigurationController.php:314
 * @route '/api/config/users/{id}'
 */
    const deleteUserForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteUser.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConfigurationController::deleteUser
 * @see app/Http/Controllers/ConfigurationController.php:314
 * @route '/api/config/users/{id}'
 */
        deleteUserForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteUser.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteUser.form = deleteUserForm
const ConfigurationController = { login, logout, getBranches, createBranch, updateBranch, deleteBranch, getDevices, createDevice, updateDevice, deleteDevice, getAlerts, updateAlert, deleteAlert, getLocations, createLocation, updateLocation, deleteLocation, getUsers, createUser, updateUser, deleteUser }

export default ConfigurationController