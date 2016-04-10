var nu          = require('nu-widget');
var cheerio     = require('cheerio');
var Horseman    = require('node-horseman');


nu.widget('nubuntu.scraper', {
    options: {},
    _create : function(){
        this.engine = new Horseman();
        this.engine = this.engine.open(this.options.url);
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
    },
    _create_output_array : function(){
        this.output = [];
        if(this.options.rows){
            this.output = this._get_rows();
        }
        if(this.options.output_callback){
            this.options.output_callback.apply(this,[this.output]);
        }
    },
    _get_rows : function(){
        var self = this;
        var rows = this.options.rows.apply(this,[this.$]);
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
        if(!this.options.fields)
            return fields;
        for (var key in this.options.fields) {
            var field   = this.options.fields[key];
            fields[key] = field.apply(this,[$row]);
        }
        return fields;
    },
    get_array : function(callback){
        var self                        = this;
        self.options.output             = 'array';
        self.options.output_callback    = callback;
        this.engine.html().then(function(result){
            self.$       = cheerio.load(result);
            self._create_output();
        });
    },
});
