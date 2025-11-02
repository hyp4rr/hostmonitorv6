<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Block extends Model
{
    protected $primaryKey = 'block_id';
    
    public $timestamps = false;
    
    protected $fillable = [
        'block_name',
        'block_code',
        'parent_block_id',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the parent block
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Block::class, 'parent_block_id', 'block_id');
    }

    /**
     * Get child blocks
     */
    public function children(): HasMany
    {
        return $this->hasMany(Block::class, 'parent_block_id', 'block_id');
    }

    /**
     * Get devices in this block
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'block_id', 'block_id');
    }

    /**
     * Get user notifications for this block
     */
    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class, 'block_id', 'block_id');
    }
}
