## Places Map ##

Before you can set up this project locally, you first need to set up
* Apache 2.4
* PHP 7.1.3 or higher
* Composer
* MySQL database
* NodeJS + npm

### Installation ###

* `git clone https://github.com/elmahone/PlacesMap.git PlacesMap`
* `cd PlacesMap`
* `composer install`
* `npm install`
* `php artisan key:generate`
* Create a database enter its credentials to *.env*
* Acquire google maps API key and enter it in *.env* like this `MAPS_API_KEY="YOUR_KEY_HERE"`
* `php artisan migrate` to create tables
* If you want to populate tables with random data, you can run `php artisan db:seed --class=DatabaseSeeder`
* `npm run watch` to compile js and scss when making changes to the files
* On another terminal run `php artisan serve` to start the app on http://localhost:8000/
