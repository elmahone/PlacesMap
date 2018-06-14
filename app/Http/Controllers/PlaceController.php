<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Place;
use App\Keyword;
use App\User;

class PlaceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $places = Place::all();
        $tmp = [];
        for ($i = 0; $i < count($places); $i++) {
            $place = $places[$i];
            $place->keyword = $place->keywords();
            $place->user;
            array_push($tmp, $place);
        }
        return $tmp;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $place = Place::create($request->all());
        $keywords = $request->keywords;
        $place = $place->addKeywords(explode(',', $request->keywords));
        return response()->json($place, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  Place  $place
     * @return \Illuminate\Http\Response
     */
    public function show(Place $place)
    {
        $place->user;
        $place->keywords = $place->keywords();
        return $place;
    }

    public function search($title)
    {
        $places = Place::where('title', 'like', '%'.$title.'%')->get();
        $tmp = [];
        for ($i = 0; $i < count($places); $i++) {
            $place = $places[$i];
            $place->keyword = $place->keywords();
            $place->user;
            array_push($tmp, $place);
        }
        return $tmp;
    }

    public function showWithKeyword(Keyword $keyword)
    {
        $places = $keyword->getPlacesWithKeyword();
        $tmp = [];
        for ($i = 0; $i < count($places); $i++) {
            $place = $places[$i];
            $place->keyword = $place->keywords();
            $place->user;
            array_push($tmp, $place);
        }
        return $tmp;
    }

    public function showWithUser(User $user)
    {
        $places = $user->places;
        $tmp = [];
        for ($i = 0; $i < count($places); $i++) {
            $place = $places[$i];
            $place->keyword = $place->keywords();
            array_push($tmp, $place);
        }
        return $tmp;
    }

    public function addKeywords(Request $request, Place $place)
    {
        $place = $place->addKeywords($request->keyword_ids);
        return $place;
    }

    public function removeKeywords(Request $request, Place $place)
    {
        $place = $place->removeKeywords($request->keyword_ids);
        return $place;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Place  $place
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Place $place)
    {
        $place->update($request->all());
        $place = $place->removeKeywords($place->keywords());
        $place = $place->addKeywords(explode(',', $request->keywords));
        $place->user;
        return $place;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Place  $place
     * @return \Illuminate\Http\Response
     */
    public function destroy(Place $place)
    {
        $place->delete();
        return response()->json(['message' => 'deleted']);
    }
}
