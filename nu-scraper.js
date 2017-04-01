require('nu-widget');
var cheerio     = require('cheerio');
var Horseman    = require('node-horseman');
var express     = require('express');
var fs          = require('fs')

nu.widget('nubuntu.scraper', {
    options: {
        port    :8080,
        dir     :__dirname,
        output  : 'array'
    },
    _create : function(){
        this.app    = express();
        this.engine = new Horseman();
        this._route();
        this._listen();
    },
    _route  : function(){
        var self = this;
        this.app.use(function(req, res, next) {
            self.uri        = req.url.split('/');
            var file_name   = self.uri[1];
            var file        = self.options.dir + '/' + file_name + '.js';
            console.log('load script', file);
            if (!fs.existsSync(file)) {
                return res.send('Request ' + file_name + ' Not Found');
            }else{
                self.source = require(file).scraper;
                self.res    = res;
                return self._open();
            }
            return next();
        });
    },
    _listen : function(){
        var self = this;
        this.app.listen(this.options.port,function(){
            console.log("scraper engine ready!");
            console.log('Listening on port %d',self.options.port);
        });
    },
    _open        : function(){
        var self = this;
        this.engine.open(this.source.url).then(function(){
            self.get_output();
        });
    },
    _create_output : function(){
        switch(this.options.output){
            default:
                this._create_output_html();
            break;
            case 'array':
                this._create_output_array();
                break;
        }
    },
    _create_output_html : function(){
        this.output = this.$.hmtl();
        this.res.send(this.output);
    },
    _create_output_array : function(){
        this.output = [];
        if(this.source.rows){
            this.output = this._get_rows();
        }
        this.res.json(this.output);
    },
    _get_rows : function(){
        var self = this;
        var rows = this.source.rows.apply(this,[this.$]);
        var output_rows = [];
        if(rows.length<1)
            return output_rows;
        rows.each(function() {
            var $row               = cheerio.load('<div>' + self.$(this).html() + '</div>');
            output_rows.push(self._get_row($row));
        });
        return output_rows;
    },
    _get_row : function($row){
        var fields = {};
        if(!this.source.fields)
            return fields;
        for (var key in this.source.fields) {
            var field   = this.source.fields[key];
            fields[key] = field.apply(this,[$row]);
        }
        return fields;
    },
    get_output : function(){
        var self                        = this;
        this.engine.html().then(function(result){
            self.$       = cheerio.load(result);
            self._create_output();
        });
    },
});
