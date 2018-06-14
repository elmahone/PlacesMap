<?php

use Illuminate\Database\Seeder;
use App\PlaceKeyword;
use App\Place;
use App\Keyword;

class PlaceKeywordsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $amount = 13;

        PlaceKeyword::truncate();

        $faker = \Faker\Factory::create();
        $places = Place::all()->pluck('id')->toArray();
        $keywords = Keyword::all()->pluck('id')->toArray();

        for ($i = 0; $i < $amount; $i++) {
            PlaceKeyword::create([
                'place_id' => $faker->randomElement($places),
                'keyword_id' => $faker->randomElement($keywords),
            ]);
        }
        echo $amount . " Keywords attached to places created!\r\n";
    }
}

?>