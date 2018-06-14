<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Place;
use App\User;

class PlacesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $amount = 20;

        // Drop foreign keys
        Schema::table('favourites', function($table) { $table->dropForeign(['place_id']); });
        Schema::table('place_keywords', function($table) { $table->dropForeign(['place_id']); });

        Place::truncate();

        // Add foreign keys
        Schema::table('favourites', function($table) {
            $table->foreign('place_id')->references('id')->on('places')->onDelete('cascade');
        });
        Schema::table('place_keywords', function($table) {
            $table->foreign('place_id')->references('id')->on('places')->onDelete('cascade');
        });


        $faker = \Faker\Factory::create();
        $users = User::all()->pluck('id')->toArray();
        $openingIimes = ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'];
        $closingTimes = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];

        for ($i = 0; $i < $amount; $i++) {
            $keywords = $faker->words($nb = 3, $asText = false);

            Place::create([
                'title' => $faker->streetName,
                'description' => $faker->sentence,
                'opening_time' => $faker->randomElement($openingIimes),
                'closing_time' => $faker->randomElement($closingTimes),
                'lat' => $faker->latitude($min = 60, $max = 70),
                'long' => $faker->longitude($min = 22, $max = 27),
                'user_id' => $faker->randomElement($users),
            ]);
        }
        echo "Created " . $amount . " places\r\n";
    }
}
