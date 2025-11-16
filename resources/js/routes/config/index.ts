import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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
const config = {
    login: Object.assign(login, login),
}

export default config