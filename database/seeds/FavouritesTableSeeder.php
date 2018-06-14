<?php

use Illuminate\Database\Seeder;
use App\Favourite;
use App\User;
use App\Place;

class FavouritesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $amount = 10;
        Favourite::truncate();

        $faker = \Faker\Factory::create();
        $users = User::all()->pluck('id')->toArray();
        $places = Place::all()->pluck('id')->toArray();

        for ($i = 0; $i < $amount; $i++) {
            Favourite::create([
                'user_id' => $faker->randomElement($users),
                'place_id' => $faker->randomElement($places),
            ]);

        }
        echo "Created " . $amount . " favourite places\r\n";
    }
}
