<?php

use Illuminate\Database\Seeder;
use App\Keyword;

class KeywordsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $amount = 12;

        Schema::table('place_keywords', function($table) { $table->dropForeign(['keyword_id']); });
        Keyword::truncate();
        Schema::table('place_keywords', function($table) {
            $table->foreign('keyword_id')->references('id')->on('keywords')->onDelete('cascade');
        });

        $faker = \Faker\Factory::create();

        for ($i = 0; $i < $amount; $i++) {
            Keyword::create([
                'label' => $faker->word,
            ]);
        }
        echo $amount . " Keywords created!\r\n";
    }
}
