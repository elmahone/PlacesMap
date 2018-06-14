<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Keyword extends Model
{
    protected $fillable = ['label'];

    function getPlacesWithKeyword() {
        $places = PlaceKeyword::where('keyword_id', $this->id)->get()->toArray();
        $places = array_column($places, 'place_id');
        $places = Place::findMany($places);

        return $places;
    }
}
