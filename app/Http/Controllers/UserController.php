<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return User::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = User::create($request->all());
        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  User  $user
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        $user->favourites = $user->favouritePlaces();
        $places = $user->places;
        $tmp = [];
        for ($i = 0; $i < count($places); $i++) {
            $place = $places[$i];
            $place->keyword = $place->keywords();
            array_push($tmp, $place);
        }
        $user->places = $tmp;
        return $user;
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $user = User::firstOrCreate($request->all());
        $favourites =  $user->favouritePlaces();
        $user->favourites = $favourites;
        $user->places;
        return response()->json($user, 201);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(null, 204);
    }
}
