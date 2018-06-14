<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected  $fillable = ['username'];

    public function places() {
        return $this->hasMany('App\Place', 'user_id', 'id');
    }

    public function favouritePlaces() {
        $favourites = Favourite::where('user_id', $this->id)->get();
        $places = [];
        foreach ($favourites as $favourite) {
            $place = Place::find($favourite->place_id);
            array_push($places, $place);
        }
        return $places;
    }
}
