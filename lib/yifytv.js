(function () {

    var request = require('request'),
        chalk = require('chalk'),
        inquirer = require('inquirer'),
        cheerio = require('cheerio'),
        spawn = require('child_process').spawn,
        main = require('./main.js'),
        subtitles = require('./subtitles.js'),
        download = require('./download.js');

    var count = 0;
    var player;
    var player_sub_cmd;
    var site_url;
    var movie_title;
    var subtitle_language;
    var use_subtitle;
    var download_location;
    var player_arg_cmd;

    exports.yifytvInitialize = start = function (config_object) {
        site_url = config_object.yifytv;
        player = config_object.player;
        player_sub_cmd = config_object.player_sub_cmd;
        player_arg_cmd = config_object.player_arg_cmd;
        use_subtitle = config_object.subtitles;
        subtitle_language = config_object.subtitle_lang;
        download_location = config_object.download_location;
        initialize();
    };

    var initialize = function () {
        count = 0;
        inquirer.prompt([{
            type: "list",
            name: "section",
            message: chalk.green.bold("Select site section:"),
            choices: [
                "New Releases",
                "Featured",
                "Most Popular",
                "Last Added",
                "Search",
                "Back to site selection"
            ]
        }], function (answer) {

            if (answer.section == "New Releases") {
                new_releases();
            } else if (answer.section == "Featured") {
                featured();
            } else if (answer.section == "Most Popular") {
                popular();
            } else if (answer.section == "Last Added") {
                releases();
            } else if (answer.section == "Search") {
                inquirer.prompt([{
                    type: "input",
                    name: "search",
                    message: chalk.green.bold("What film are you searching for?"),
                }], function (answer) {
                    search(answer.search);
                });
            } else if ("Back to site selection") {
                main.AppInitialize();
            }

        });
    };


    var featured = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = site_url + "/?ajaxlist&get_fea&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content, "featured");

            } else {
                console.log(chalk.red.bold('There was a problem loading yify.tv'));
                main.AppInitialize();
            }
        });

    };

    var new_releases = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = site_url + "/?ajaxlist&get_rel&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content, "new_releases");

            } else {
                console.log(chalk.red.bold('There was a problem loading yify.tv'));
                main.AppInitialize();
            }
        });

    };


    var releases = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = site_url + "/?ajaxlist&get_last&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content, "releases");

            } else {
                console.log(chalk.red.bold('There was a problem loading yify.tv'));
                main.AppInitialize();
            }
        });

    };

    var search = function (search) {
        var search_url = site_url + "/?s=" + search;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                $ = cheerio.load(body);

                $('.soe22 a').each(function () {
                    var link = $(this).attr('href');
                    var title = $(this).text().split('Watch ').join('').split(' Online').join('');

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                });

                selectStreamSearch(stream_content, "search");
            } else {
                console.log(chalk.red.bold('There was a problem loading yify.tv'));
                main.AppInitialize();
            }
        });


    };


    var popular = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = site_url + "/?ajaxlist&get_pop&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content, "popular");

            } else {
                console.log(chalk.red.bold('There was a problem loading yify.tv'));
                main.AppInitialize();
            }
        });

    };

    var selectStream = function (data, state) {

        var movie_object = [];

        data.forEach(function (movies) {
            movie_object.push({
                'key': movies.number,
                name: chalk.yellow(movies.title + " (" + movies.year + ")"),
                value: movies.number
            });
        });

        movie_object.push({
            'key': 'next',
            name: chalk.cyan('next page'),
            value: 'next'
        });

        movie_object.push({
            'key': 'cat',
            name: chalk.cyan('back to category select'),
            value: 'cat'
        });

        inquirer.prompt([{
            type: "list",
            name: "movie",
            message: chalk.green.bold("Select a movie:"),
            choices: movie_object
        }], function (answer) {
            if (answer.movie == "cat") {
                initialize();
            } else if (answer.movie !== "next") {
                fetchStreamlinks(answer.movie, data);
            } else {
                if (state == "featured") {
                    featured();
                } else if (state == "popular") {
                    popular();
                } else if (state == "new_releases") {
                    new_releases();
                } else if (state == "releases") {
                    releases();
                }
            }
        });

    };

    var selectStreamSearch = function (data) {

        var movie_object = [];

        data.forEach(function (movies) {
            movie_object.push({
                'key': movies.number,
                name: chalk.yellow(movies.title),
                value: movies.number
            });
        });

        movie_object.push({
            'key': 'cat',
            name: chalk.cyan('back to category select'),
            value: 'cat'
        });


        inquirer.prompt([{
            type: "list",
            name: "movie",
            message: chalk.green.bold("Select a movie:"),
            choices: movie_object
        }], function (answer) {
            if (answer.movie !== "cat") {
                fetchStreamlinks(answer.movie, data);
            } else {
                initialize();
            }

        });

    };


    var fetchStreamlinks = function (number, data) {
        var link = data[number].link;
        var title = data[number].title;
        var year = data[number].year;

        movie_title = title + " (" + year + ")";

        request(link, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                var linkID = body.match(/\?pic=(.+)\&/i);
                var string = "&" + linkID[0].substring(1);
                string = string.split('&vb=')[0].split('&&&id=')[0];
                var splitid = string.split('&pic=');

                selectStreamLink(splitid);

            }
        });

    };

    var selectStreamLink = function (data) {
        delete data[0];
        var movie_object = [];
        count = 1;

        data.forEach(function (s) {
            movie_object.push({
                'key': s,
                name: chalk.yellow("Link " + count),
                value: s
            });
            count++;
        });

        movie_object.push({
            'key': 'cat',
            name: chalk.cyan('back to category select'),
            value: 'cat'
        });

        inquirer.prompt([{
            type: "list",
            name: "movie",
            message: chalk.green.bold("Select a stream:"),
            choices: movie_object
        }], function (answer) {

            if(answer.movie == "cat"){

              initialize();

            } else {

              startStream(answer.movie);
              
            }

        });

    };


    var startStream = function (data) {
        var movie_object = [];

        request.post({
            url: site_url + '/player/pk/pk/plugins/player_p2.php',
            form: {
                fv: '17',
                url: data
            }
        }, function (err, httpResponse, body) {

            try {

                data = JSON.parse(body);

                delete data[0];

                data.forEach(function (movies) {
                    movie_object.push({
                        'key': movies.url,
                        name: chalk.yellow(movies.width + "x" + movies.height),
                        value: movies.url
                    });

                });

                movie_object.push({
                    'key': 'cat',
                    name: chalk.cyan('back to category select'),
                    value: 'cat'
                });

                inquirer.prompt([{
                    type: "list",
                    name: "movie",
                    message: chalk.green.bold("Select stream quality:"),
                    choices: movie_object
                }], function (answer) {

                    if (answer.movie == "cat") {

                        initialize();

                    } else {

                        var movie = answer.movie;

                        if (download_location) {
                            inquirer.prompt([{
                                type: "list",
                                name: "stream",
                                message: "Do you want to stream or download the file ?",
                                choices: ["Stream", "Download"]
                            }], function (answer) {
                                if (answer.stream == "Stream") {
                                    getSubs(movie);
                                } else if (answer.stream == "Download") {
                                    sod(movie);
                                }
                            });
                        } else {
                            getSubs(movie);
                        }

                    }

                });

            } catch (e) {
                console.log(chalk.red.bold("There was an error with this source."));
                initialize();
            }

        });

    };

    var sod = function (movie) {

        download.fetch(movie, movie_title, download_location);

    };

    var getSubs = function (movie) {
        if (use_subtitle) {

            subtitles.fetchSub(subtitle_language, movie_title).then(function (data) {

                if (data !== false) {
                    subtitles = data;
                    spawnPlayer(movie, subtitles);
                } else {
                    spawnPlayer(movie);
                }

            });
        } else {
            spawnPlayer(movie);
        }
    };


    var spawnPlayer = function (movie, subtitles) {

        if (subtitles) {
            if (player_arg_cmd) {
                argsList = [movie, player_arg_cmd, player_sub_cmd + subtitles];
            } else {
                argsList = [movie, player_sub_cmd + subtitles];
            }

        } else {
            if (player_arg_cmd) {
                argsList = [movie, player_arg_cmd];
            } else {
                argsList = [movie];
            }

        }

        spawn(player, argsList, {
            stdio: 'inherit'
        });

    };


})();
