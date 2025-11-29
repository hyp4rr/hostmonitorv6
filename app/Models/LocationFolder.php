<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'branch_id',
        'description',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }
}
