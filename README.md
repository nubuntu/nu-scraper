#nu-scraper
Another simple web scraping solution

#How to install

```
npm install nu-scraper
```
create example.js
```
require('nu-scraper');

nu.scraper({
    port    :9090,
    dir     :__dirname + '/sites'
});
```

```
$ node example.js
scraper engine ready!
Listening on port 9090
```
and open your browser

http://localhost:9090/**controller**

## example controller

http://localhost:9090/youtube

example : Youtube controller

```
exports.scraper = {
    url     : 'https://youtube.com/',
    rows    : function($){
        return $('.yt-shelf-grid-item');
    },
    fields  : {
        title : function($){
            return $('.yt-lockup-title').find('a').html();
        },
        link : function($){
            return this.source.url + $('.yt-lockup-title').find('a').attr('href');
        },
        thumbnail : function ($) {
            return $('.yt-thumb-simple').find('img').attr('src');
        }
    }
	
}
```

Example: Olx Controller
```
var S = require('string');
exports.scraper = {
    name: 'OLX',
    url: function () {
        return "http://olx.co.id/all-results/q-batu-bacan/"
    },
    rows: function ($) {
        return $('.offer');
    },
    fields: {
        title: function ($) {
            return S($.find('.link.linkWithHash').text()).trim().s;
        },
        price: function ($) {
            return S($.find('.price').text()).trim().s;
        },
        image: function ($) {
            return $.find('.linkWithHash img').attr('src');
        }


    }

}
```


#Author
##poetnoer@gmail.com
