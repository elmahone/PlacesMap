<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PlaceKeyword extends Model
{
    protected $fillable = ['keyword_id', 'place_id'];

    public function keyword() {
        $this->hasOne('App\Keyword', 'foreign_key');
    }

    public function place() {
        $this->hasOne('App\Place', 'foreign_key');
    }
}
