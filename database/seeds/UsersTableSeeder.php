<?php

use Illuminate\Database\Seeder;
use App\User;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $amount = 10;

        // Drop foreign keys
        Schema::table('places', function($table) { $table->dropForeign(['user_id']); });
        Schema::table('favourites', function($table) { $table->dropForeign(['user_id']); });

        User::truncate();

        // Add foreign keys
        Schema::table('places', function($table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        Schema::table('favourites', function($table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        $faker = \Faker\Factory::create();

        for ($i = 0; $i < $amount; $i++) {
            $name = $faker->firstName;
            User::create([
                'username' => $name,
            ]);
        }
        echo "Created " . $amount . " users!\r\n";

    }
}
