<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Favourite extends Model
{
    protected $fillable = ['user_id', 'place_id'];
    public function user() {
        return $this->belongsTo('App\User');
    }

    public function place() {
        return $this->hasOne('App\Place', 'place_id', 'id');
    }
}
