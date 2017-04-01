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