<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'report_name',
        'report_type',
        'start_date',
        'end_date',
        'categories',
        'managed_by',
        'email_sent_to',
        'file_path',
        'file_size',
        'summary_stats',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'categories' => 'array',
        'summary_stats' => 'array',
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

