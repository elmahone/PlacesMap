<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePlaceKeywordsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('place_keywords', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('place_id')->unsigned();
            $table->foreign('place_id')->references('id')->on('places')->onDelete('cascade');
            $table->integer('keyword_id')->unsigned();
            $table->foreign('keyword_id')->references('id')->on('keywords')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Drop foreign keys
        Schema::table('places', function($table) {
            $table->dropForeign(['place_id']);
            $table->dropColumn('place_id');
            $table->dropForeign(['keyword_id']);
            $table->dropColumn('keyword_id');
        });

        Schema::dropIfExists('place_keywords');
    }
}
