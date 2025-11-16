import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TopologyController::index
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/monitor/topology',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TopologyController::index
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TopologyController::index
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TopologyController::index
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TopologyController::index
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TopologyController::index
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TopologyController::index
 * @see app/Http/Controllers/TopologyController.php:88
 * @route '/monitor/topology'
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
const TopologyController = { index }

export default TopologyController