<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Favourite;

class FavouriteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Favourite::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $favourite = Favourite::firstOrCreate($request->all());
        return response()->json($favourite, 201);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\Response
     */
    public function unfavourite(Request $request)
    {
        $data = $request->all();
        $favourite = Favourite::where([
            "place_id" => $data["place_id"],
            "user_id"  => $data["user_id"]
        ]);
        $favourite->delete();
        return response()->json(['message' => 'deleted']);
    }
}
