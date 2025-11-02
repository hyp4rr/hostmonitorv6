<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BrandController extends Controller
{
    public function index()
    {
        try {
            if (!Schema::hasTable('brands')) {
                return response()->json([]);
            }

            $brands = DB::table('brands')
                ->orderBy('name')
                ->pluck('name');

            return response()->json($brands);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function models()
    {
        try {
            if (!Schema::hasTable('models')) {
                return response()->json([]);
            }

            $models = DB::table('models')
                ->join('brands', 'models.brand_id', '=', 'brands.id')
                ->select(DB::raw("CONCAT(brands.name, ' ', models.name) as full_name"))
                ->orderBy('full_name')
                ->pluck('full_name');

            return response()->json($models);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }
}
