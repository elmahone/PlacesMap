<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\PlaceKeyword;
use App\Keyword;

class Place extends Model
{
    protected $fillable = ['title', 'description', 'opening_time', 'closing_time', 'lat', 'long', 'user_id'];

    public function user() {
        return $this->belongsTo('App\User');
    }

    public function keywords() {
        $placeKeys = PlaceKeyword::where('place_id', $this->id)->get();
        $keywords = [];
        foreach ($placeKeys as $placeKey) {
            $keyword = Keyword::find($placeKey->keyword_id);
            array_push($keywords, $keyword);
        }
        return $keywords;
    }

    public function addKeywords($keywordIds) {
        foreach ($keywordIds as $keywordId) {
            if($keywordId) {
                PlaceKeyword::firstOrCreate([
                    "place_id"    => $this->id,
                    "keyword_id"  => $keywordId
                ]);
            }
        }
        $this->keywords = $this->keywords();
        return $this;
    }

    public function removeKeywords($keywordIds) {
        foreach ($keywordIds as $keywordId) {
            if($keywordId) {
                if ($keywordId->id) {
                    $keywordId = $keywordId->id;
                }
                $pk = PlaceKeyword::where([
                    "place_id"    => $this->id,
                    "keyword_id"  => $keywordId
                ]);
                $pk->delete();
            }
        }
        $this->keywords = $this->keywords();
        return $this;
    }


}
