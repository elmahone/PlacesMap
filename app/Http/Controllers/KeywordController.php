<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Keyword;
use App\Place;

class KeywordController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Keyword::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $keyword = Keyword::create($request->all());
        if($request->place_id) {
            $place = Place::find($request->place_id)->get();
            $place = $place->addKeywords([$keyword->id]);
        }
        return response()->json($keyword, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  Keyword  $keyword
     * @return \Illuminate\Http\Response
     */
    public function show(Keyword $keyword)
    {
        return $keyword;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Keyword  $keyword
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Keyword $keyword)
    {
        $keyword->update($request->all());
        return $keyword;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Keyword  $keyword
     * @return \Illuminate\Http\Response
     */
    public function destroy(Keyword $keyword)
    {
        $keyword->delete();
        return response()->json(null, 204);
    }
}
