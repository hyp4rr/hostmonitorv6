<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'name',
        'description',
        'report_type',
        'categories',
        'managed_by',
        'included_fields',
        'included_metrics',
        'filters',
        'summary_config',
    ];

    protected $casts = [
        'categories' => 'array',
        'included_fields' => 'array',
        'included_metrics' => 'array',
        'filters' => 'array',
        'summary_config' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function managedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'managed_by');
    }
}

