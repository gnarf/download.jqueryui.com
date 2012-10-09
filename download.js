var _ = require( "underscore" ),
	fs = require( "fs" ),
	Handlebars = require( "handlebars" ),
	querystring = require( "querystring" ),
	release = require( "./lib/release" ).all()[ 0 ],
	themeGallery = require( "./lib/themeroller.themegallery" ),
	ThemeRoller = require( "./lib/themeroller" );

// Returns 'selected="selected"' if param == value
Handlebars.registerHelper( "isSelectedTheme", function( theme, selectedTheme ) {
	return theme.isEqual( selectedTheme ) ? "selected=\"selected\"" : "";
});

Handlebars.registerHelper( "themerollerParams", function( serializedVars ) {
	return serializedVars.length > 0 ? "#" + serializedVars : "";
});

var indexTemplate = Handlebars.compile( fs.readFileSync( __dirname + "/template/download/index.html", "utf8" ) ),
	jsonpTemplate = Handlebars.compile( fs.readFileSync( __dirname + "/template/jsonp.js", "utf8" ) ),
	themeTemplate = Handlebars.compile( fs.readFileSync( __dirname + "/template/download/theme.html", "utf8" ) ),
	wrapTemplate = Handlebars.compile( fs.readFileSync( __dirname + "/template/download/wrap.html", "utf8" ) );

var Frontend = function( args ) {
	_.extend( this, args );
};

Frontend.prototype = {
	index: function( params, options ) {
		options = options || {};
		if ( options.wrap ) {
			options = _.defaults( { wrap: false }, options );
			return wrapTemplate({
				body: this.index( params, options ),
				resources: this.resources
			});
		}
		return indexTemplate({
			categories: release.categories(),
			host: this.host,
			pkg: release.pkg,
			resources: this.resources
		});
	},

	theme: function( params ) {
		var selectedTheme = themeGallery[ 0 ];
		if ( params.themeParams ) {
			selectedTheme = new ThemeRoller( querystring.parse( unescape( params.themeParams ) ) );
		}
		return jsonpTemplate({
			callback: params.callback,
			data: JSON.stringify( themeTemplate({
				folderName: selectedTheme.folderName(),
				selectedTheme: selectedTheme,
				themeGallery: selectedTheme.name === "Custom Theme" ?  [ selectedTheme ].concat( themeGallery ) : themeGallery
			}))
		});
	}
};

module.exports = Frontend;
