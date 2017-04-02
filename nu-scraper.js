require('nu-widget');
var cheerio     = require('cheerio');
var Horseman    = require('node-horseman');
var express     = require('express');
var fs          = require('fs');

nu.widget('nubuntu.scraper', {
    options: {
        port    :8080,
        dir     :__dirname,
        output  : 'array'
    },
    _create : function(){
        this.app    = express();
        this._route();
        this._listen();
    },
    _route  : function(){
        var self = this;
        this.app.use(function(req, res, next) {
            self.request    = req;
            self.uri        = req.url.split('?')[0].split('/');
            var file_name   = self.uri[1];
            var file        = self.options.dir + '/' + file_name + '.js';
            console.log('load script', file);
            if (!fs.existsSync(file)) {
                return res.send('Request ' + file_name + ' Not Found');
            }else{
                self.source = require(file).scraper;
                return self._open(res);
            }
        });
    },
    _listen : function(){
        var self = this;
        this.app.listen(this.options.port,function(){
            console.log("scraper engine ready!");
            console.log('Listening on port %d',self.options.port);
        });
    },
    _open        : function(res){
        var self    = this;
        var url     = this.source.url;
        if(typeof url=='function')
            url     = url.apply(this);
        self.success= true;
        this.engine = new Horseman(this.source.options||{});
        this.engine.on('resourceError', function(err) {
            self.success = false;
            if(!res.headersSent){
                res.json({
                    error : true,
                    message : err.errorString
                });                
            }
        });
        this.engine.open(url).then(function(){
            if(self.success){
                self.get_output(res);
            }else{
                self.engine.close();
            }
        });     
    },
    _create_output : function(res){
        switch(this.options.output){
            default:
                this._create_output_html(res);
            break;
            case 'array':
                this._create_output_array(res);
                break;
        }
    },
    _create_output_html : function(res){
        this.output = this.$.hmtl();
        res.send(this.output);
    },
    _create_output_array : function(res){
        this.output = [];
        if(this.source.rows){
            this.output = this._get_rows();
        }
        res.json(this.output);
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
    get_output : function(res){
        var self                        = this;
        this.engine.html().then(function(result){
            self.$       = cheerio.load(result);
            self._create_output(res);
        });
    },
});
