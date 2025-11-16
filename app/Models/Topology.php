<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Topology extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'description',
        'canvas_data',
        'is_active',
    ];

    protected $casts = [
        'canvas_data' => 'array',
        'is_active' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function devices(): BelongsToMany
    {
        return $this->belongsToMany(Device::class, 'topology_devices')
            ->withPivot(['node_id', 'position_x', 'position_y', 'node_data'])
            ->withTimestamps();
    }
}
