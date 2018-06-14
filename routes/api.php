<?php

use Illuminate\Http\Request;
use App\User;
use App\Place;
use App\Keyword;
use App\Favourite;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// User routes

Route::get('users',                     'UserController@index');
Route::get('user/{user}',               'UserController@show');
Route::post('login',                    'UserController@login');
Route::post('newUser',                  'UserController@store');
Route::delete('deleteUser/{user}',      'UserController@destroy');

// Place routes
Route::get('places',                        'PlaceController@index');
Route::get('place/{place}',                 'PlaceController@show');
Route::get('place/search/{title}',          'PlaceController@search');
Route::get('places/filter/{keyword}',       'PlaceController@showWithKeyword');
Route::get('user/{user}/places',            'PlaceController@showWithUser');

Route::post('place/{place}/removeKeywords', 'PlaceController@removeKeywords');
Route::post('place/{place}/addKeywords',    'PlaceController@addKeywords');
Route::post('newPlace',                     'PlaceController@store');
Route::put('editPlace/{place}',             'PlaceController@update');
Route::delete('places/{place}',             'PlaceController@destroy');

// Favourite routes
Route::get('favourites',                    'FavouriteController@index');
Route::post('newFavourite',                 'FavouriteController@store');
Route::post('deleteFavourite',              'FavouriteController@unfavourite');

// Keyword routes
Route::get('keywords',                      'KeywordController@index');
Route::get('keyword/{keyword}',             'KeywordController@show');
Route::post('newKeyword',                   'KeywordController@store');
Route::put('editKeyword/{keyword}',         'KeywordController@update');
Route::delete('deleteKeyword/{keyword}',    'KeywordController@destroy');