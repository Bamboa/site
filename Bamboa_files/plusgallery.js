 /*
 * Plus Gallery Javascript Photo gallery v0.8.5 
 *
 * Copyright 2013, Jeremiah Martin
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html

 */

jQuery.ajaxSetup({ cache: false });
/*
SLIDEFADE
------------------------------------------------------------------------------------------------------*/

/* Custom plugin for a slide/in out animation with a fade - JJM */

(function (jQuery) {
	jQuery.fn.slideFade = function (speed, callback) {
		var slideSpeed;
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "number") {
				slideSpeed  = arguments[i];
			}
			else {
				var callBack = arguments[i];
			}
		}
		if(!slideSpeed) {
			slideSpeed = 500;
		}
		this.animate({
				opacity: 'toggle',
				height: 'toggle'
			}, slideSpeed,
			function(){
				if( typeof callBack != "function" ) { callBack = function(){}; }
				callBack.call(this);
			}
		);
  };
})( jQuery );

(function (jQuery){
	jQuery.fn.plusGallery = function(options){
		var lmnt = this;
		if(lmnt.length === 0) { return false; }
		var pg = {
			id: jQuery(lmnt).attr('id'),
			/*user defined Defaults*/
			imagePath: 'images/plusgallery',
			cap_Length:500,
			auto_zoom: '',
			type: 'google',
			albumTitle: false, //show the album title in single album mode
			albumLimit: 20, //Limit amout of albums to load initially.
			limit: 20, //Limit of photos to load for gallery / more that 60 is dumb, separate them into different albums
			apiKey: 'b3ae683dd5fabd40e67cc6fcfb387e3c', //used with Flickr
			exclude: null,
			include: null,
			wpAlbumURL: null,

			
			/*don't touch*/
			imgArray: [],
			titleArray: [],
			descArray:[],
			t: '', //timer
			idx: 0,
			imgCount: 0,
			imgTotal: 0,
			winWidth: 1024, //resets
			touch: false,
			titleText: '',
			containerDataCl: jQuery(lmnt).attr('data-cl'),
			dataOptions:{},
			
			init: function(){
				var _doc = jQuery(document);
				//check for touch device
				if ("ontouchstart" in document.documentElement) {
					window.scrollTo(0, 1);
					pg.touch = true;
				}
				
				pg.winWidth = jQuery(window).width();
				

				//reset some shit in case there is another copy that was loaded.
				jQuery('#pgzoomview').remove();
				//Unbind everything first? 
				if(options)
					_doc.off("click", "."+pg.containerDataCl+" .pgalbumlink,."+pg.containerDataCl+" #pgoptionsthumbhome,."+pg.containerDataCl+" .pgthumb, .pgzoomarrow, .pgzoomclose, #pgzoomview, #pgzoomslide, .pgzoomimg");
				else{
					_doc.off("click", ".pgalbumlink, #pgthumbhome, .pgthumb, .pgzoomarrow, .pgzoomclose, #pgzoomview, #pgzoomslide, .pgzoomimg");
				}
				

				pg.getDataAttr();
				
				pg.writeHTML();
				if(pg.albumId !== null || pg.type == 'instagram'){
					//load single Album
					pg.loadSingleAlbum();
				}
				else {
					pg.loadAlbumData();
				}

				//attach loadGallery to the album links
				_doc.on("click", "."+pg.containerDataCl+" .pgalbumlink",function(e){
					e.preventDefault();
					jQuery(this).append('<span class="pgloading"></span>');
					var galleryURL = this.href;
					var galleryTitle = jQuery(this).children('span').html();
					pg.loadGallery(galleryURL,galleryTitle);					
					pg.scrollup();
					// Hide the filter for WP Gallery
					if(( plusCategory = jQuery('.plus-category') )){
						plusCategory.addClass("plus-hide-pointer");
					}
					
					// tab-plusgallery
					if(options){
						this.href = '#';
						jQuery(this).addClass('addLink');
					}
				});
				
				_doc.on("click", "#pgthumbhome",function(e){
					if(( plusCategory = jQuery('.plus-category') )){
						plusCategory.removeClass("plus-hide-pointer");
						var imgLoad = imagesLoaded( document.querySelector("#" + pg.id + " .isotope") );
						imgLoad.on( 'done', function( instance ) {
							jQuery("#"+pg.id).find(".isotope").isotope("layout");
				         });
						
					}
					e.preventDefault();
					jQuery('#pgthumbview').slideFade(700);
					jQuery('#pgalbums').slideFade(700);
				});
				
				//attach links load detail image
				_doc.on('click','.'+pg.containerDataCl+' .pgthumb',function(e){
					e.preventDefault();
					var idx = jQuery('.pgthumb').index(this);
					pg.loadZoom(idx);
					jQuery('html').addClass('pgzoom-overflow-y');
				});
						
				/*zoom events*/
				_doc.on('click','.pgzoomarrow',function(e){
					e.preventDefault();
					var dir = this.rel;
					pg.prevNext(dir);
					return false;
				});
		
				_doc.on('click','.pgzoomclose',function(e){
					e.preventDefault();
					pg.unloadZoom();
				});
				_doc.on("click", "#pgzoomview",function(e){
					e.preventDefault();
					pg.unloadZoom();
				});
				
				_doc.on("click", "#pgzoomslide",function(){
					pg.unloadZoom();
				});
				
				_doc.on("click", ".pgzoomimg",function(){
					return false;
				});
					
				clearTimeout(pg.t);
			},
			
			/*--------------------------
			
				get all the user defined
				variables from the HTML element
			
			----------------------------*/
			getDataAttr: function(){
				// Plusgallery id
				dataAttr = lmnt.attr('id');
				if(dataAttr) {
					pg.id = dataAttr;
				}else {
					message = 'Please contact to author for support.';
					pg.message(message);
					return false;
				}
				
				//Gallery Type *required
				dataAttr = lmnt.attr('data-type');
				if(dataAttr) {
					pg.type = dataAttr;
				}else if(options && options.dataOptions.type != ''){
					pg.type = options.dataOptions.type;
				}else {
					message = 'You must enter a data type.';
					pg.message(message);
					return false;
				}
				
				// Data wp gallery url
				dataAttr = lmnt.attr('data-album-url');
				if(dataAttr){
					pg.wpAlbumURL = dataAttr;
				}else if(options){
					if(options.dataOptions.albumURL != '')
						pg.wpAlbumURL = options.dataOptions.albumURL;
				}
				
				// Skip get data attr if data_type is WP Post Gallery
				if(pg.type !== 'wp_gallery'){
					lmnt.attr('data-userid');
					//Gallery User Id *required
					var dataAttr = lmnt.attr('data-userid');
					if(dataAttr) {
						pg.userId = dataAttr;
					}else if(options && options.dataOptions.userID != ''){
							pg.userId = options.dataOptions.userID;
					}
					else {
						message = 'You must enter a valid User ID';
						pg.message(message);
						return false;
					}
				}// End check data type
				
				//Limit on the amount photos per gallery
				dataAttr = lmnt.attr('data-limit');
				if(dataAttr) {
					pg.limit = dataAttr;
				}else if(options && options.dataOptions.limit != ""){
						pg.limit = options.dataOptions.limit;
				}
				
				//Limit on the amount albums
				dataAttr = lmnt.attr('data-album-limit');
				if(dataAttr) {
					pg.albumLimit = dataAttr;
				}else if(options && options.dataOptions.albumLimit != ""){
						pg.albumLimit = options.dataOptions.albumLimit;
				}
				
				//album id to exclude
				dataAttr = lmnt.attr('data-exclude');
				if(dataAttr) {
					pg.exclude = dataAttr.split(',');
				}else if(options && options.dataOptions.exclude != ""){
						pg.exclude = options.dataOptions.exclude.split(',');
				}

				//album ids to include
				dataAttr = lmnt.attr('data-include');
				if(dataAttr) {
					pg.include = dataAttr.split(',');
				}else if(options && options.dataOptions.include != ""){
						pg.include = options.dataOptions.include.split(',');
				}
				
				//Api key - used with Flickr
				pg.apiKey = 'b3ae683dd5fabd40e67cc6fcfb387e3c';
				
				dataAttr = lmnt.attr('data-album-id');
				if(dataAttr) {
					pg.albumId = dataAttr;
					
					//show hide the album title if we are in single gallery mode
					titleAttr = lmnt.attr('data-album-title');
					
					if(titleAttr == 'true') {
						pg.albumTitle = true;
					} else {
						pg.albumTitle = false;
					}
				}else if(options && options.dataOptions.albumID != ''){
						pg.albumId = options.dataOptions.albumID;
				}
				else {
					pg.albumTitle = true;
					pg.albumId = null;
				}

				//Image path
                dataAttr = lmnt.attr('data-image-path');
                if(dataAttr) {
                    pg.imagePath = dataAttr;
                }else if(options){
					pg.imagePath = options.dataOptions.imagePath;
				}
                
                //caption length
                dataAttr = lmnt.attr('data-caption-length');
                if(dataAttr) {
                	pg.cap_Length = dataAttr;
                }else if(options && options.dataOptions.captionLng != ""){
                	pg.cap_Length = options.dataOptions.captionLng;
				}
                
                //Lightbox auto_zoom
                dataAttr = lmnt.attr('data-auto-zoom');
                if( dataAttr == 'yes' ){
                	pg.auto_zoom = ' pg-auto-zoom';
                }
                
                
			},
			
			/*--------------------------
			
				set up the initial HTML
			
			----------------------------*/
			writeHTML: function(){
        var touchClass;
				if(pg.touch){
					touchClass = 'touch';
					lmnt.addClass('touch');
				}
				else {
					touchClass = 'no-touch';
					lmnt.addClass('no-touch');
				}
				
				lmnt.append(
					'<ul id="pgalbums" class="clearfix isotope"></ul>' +
					'<div id="pgthumbview">' +
						'<ul id="pgthumbs" class="clearfix"></ul>' +
					'</div>'
				);
				jQuery('body').prepend(
					'<div id="pgzoomview" class="pg ' + touchClass + pg.auto_zoom + '">' +
						'<a href="#" rel="previous" id="pgzoomclose" title="Close">Close</a>' +
						'<a href="#" rel="previous" id="pgprevious" class="pgzoomarrow" title="previous">Previous</a>' +
						'<a href="#" rel="next" id="pgnext" class="pgzoomarrow" title="Next">Next</a>' +
						'<div id="pgzoomscroll">' +
							'<ul id="pgzoom"></ul>' +
						'</div>' +
					'</div>'
					);
				
				lmnt.addClass('pg');
				
				if(pg.albumTitle === true) {
					if(options)
						jQuery('#pgthumbview').prepend('<ul id="pgthumbcrumbs" class="clearfix"><li id="pgoptionsthumbhome"><a class="dtpg-thumb-home" onclick="DTPGThumbHome(this)" href="javascript:void(0);">&laquo;</a></li></ul>');
					else
						jQuery('#pgthumbview').prepend('<ul id="pgthumbcrumbs" class="clearfix"><li id="pgthumbhome">&laquo;</li></ul>');
				}
			},
					
			/*--------------------------
			
				Load up Album Data JSON
				before Albums
			
			----------------------------*/
			loadAlbumData: function() {
        var albumURL;
				switch(pg.type)
				{
				case 'wp_gallery':
					albumURL = pg.wpAlbumURL;
					break;
				case 'google':
					albumURL = 'https://picasaweb.google.com/data/feed/base/user/' + pg.userId + '?alt=json&kind=album&hl=en_US&max-results=' + pg.albumLimit + '&callback=?';
					break;
				case 'flickr':
					albumURL = 'https://api.flickr.com/services/rest/?&method=flickr.photosets.getList&api_key=' + pg.apiKey + '&user_id=' + pg.userId + '&format=json&jsoncallback=?';
					break;
				case 'facebook':
					albumURL = 'https://graph.facebook.com/' + pg.userId + '/albums?limit=' + pg.albumLimit + '&access_token=273366399527177|afnxgGNbszgV2ny0GShChH2coAQ&callback=?';

					break;
				case 'instagram':
					//we ain't got no albums in instagram
					albumURL = null;
					break;
		
				default:
					message = 'Please define a gallery type.';
					pg.message(message);
				}
						
				jQuery.getJSON(albumURL,function(json) {
						lmnt.addClass('loaded');
						var objPath,
		                albumTotal,
		                galleryImage,
		                galleryTitle,
		                galleryJSON,
		                dataCategory;

						switch(pg.type)
						{
						case 'wp_gallery':
							objPath = json;
							albumTotal = objPath.length;
									
							if(albumTotal > 0) {
								jQuery.each(objPath,function(i,obj){

										galleryTitle = obj.name;
										galleryJSON = obj.link;
										galleryImage = obj.galleryImage;
										dataCategory = obj.dataCategory;
										pg.loadAlbums(galleryTitle,galleryImage,galleryJSON,dataCategory);

								});
								var imgLoad = imagesLoaded( document.querySelector("#"+pg.id+ " .isotope") );
								imgLoad.on( 'done', function( instance ) {
									pg.pgIsotope();
						         });
							}
							else {
								message = 'There are either no results for albums.';
								pg.message(message);
							}
							
							break;
						//have to load differently for for google/facebook/flickr
						case 'google':
						
							objPath = json.feed.entry;
							albumTotal = objPath.length;
									
							if(albumTotal > pg.albumLimit) {
								albumTotal = pg.albumLimit;
							}
							
							//remove excluded galleries if there are any.
							//albumTotal = albumTotal - pg.exclude.length;
						
							
							if(albumTotal > 0){
								jQuery.each(objPath,function(i,obj){
									//obj is entry
									if(i < albumTotal){
										galleryTitle = obj.title.$t;
										galleryJSON = obj.link[0].href;
										galleryImage = obj.media$group.media$thumbnail[0].url;
										galleryImage = galleryImage.replace('s160','s210');
									
										pg.loadAlbums(galleryTitle,galleryImage,galleryJSON,i);
									}
			
								});
							}
							else { //else if albumTotal == 0
								message = 'There are either no results for albums with this user ID or there was an error loading the data. \n' + galleryJSON ;
								pg.message(message);
							}
							
						break;
						case 'flickr':
							objPath = json.photosets.photoset;
							albumTotal = objPath.length;
									
							if(albumTotal > pg.albumLimit) {
								albumTotal = pg.albumLimit;
							}
									
							if(albumTotal > 0 ) {
								jQuery.each(objPath,function(i,obj){
									//obj is entry
									if(i < albumTotal){
										galleryTitle = obj.title._content;
										galleryImage = 'https://farm' + obj.farm + '.staticflickr.com/' + obj.server + '/' + obj.primary + '_' + obj.secret + '_n.jpg';
										galleryJSON = 'https://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key=' + pg.apiKey + '&photoset_id=' + obj.id + '&format=json&jsoncallback=?';
				
										pg.loadAlbums(galleryTitle,galleryImage,galleryJSON);
									}
								});
							}
							else { //else if albumTotal == 0
								message = 'There are either no results for albums with this user ID or there was an error loading the data. \n' + galleryJSON ;
								pg.message(message);
							}
							
						break;
						case 'facebook':
							objPath = json.data;
							albumTotal = objPath.length;
									
							if(albumTotal > pg.albumLimit) {
								albumTotal = pg.albumLimit;
							}
									
							if(albumTotal > 0) {
								jQuery.each(objPath,function(i,obj){
									if(i < albumTotal){
										galleryTitle = obj.name;
										galleryJSON = 'https://graph.facebook.com/' + obj.id + '/photos?limit=' + pg.limit + '&access_token=273366399527177|afnxgGNbszgV2ny0GShChH2coAQ';
										galleryImage = 'http://graph.facebook.com/' + obj.id + '/picture?type=album';
										pg.loadAlbums(galleryTitle,galleryImage,galleryJSON);
									}
									
								});
							}
							else {
								message = 'There are either no results for albums with this user ID or there was an error loading the data. \n' + albumURL;
								pg.message(message);
							}
							
							break;
						}
		
				});
			},
			
			/*--------------------------
			
				Load all albums to the page
			
			----------------------------*/
			loadAlbums: function(galleryTitle,galleryImage,galleryJSON,dataCategory) {
				var displayAlbum = true;
		        var imgHTML;
						
						//exclude albums if pg.exclude is set
		        if(pg.exclude !== null) {
		          jQuery.each(pg.exclude,function(index, value){ //exclude albums if pg.exclude is set
		            if(galleryJSON.indexOf(value) > 0){
		              displayAlbum = false;
		            }
		          });
		        }
		
		        //include only specified albums if pg.include is set
		        if(pg.include !== null) {
		          displayAlbum = false;
		          jQuery.each(pg.include,function(index, value){ //exclude albums if pg.exclude is set
		            if(galleryJSON.indexOf(value) > 0){
		              displayAlbum = true;
		            }
		          });
		        }
																		 
				if (displayAlbum){
						if ( pg.type == 'facebook' || pg.type == 'flickr') {
	        	  			imgHTML = '<img src="'+ pg.imagePath + '/square.png" style="background-image: url(' + galleryImage + ');" title="' + galleryTitle + '" title="' + galleryTitle + '" class="pgalbumimg">';
						}else if(pg.type == 'wp_gallery'){
							imgHTML = '<img src="'+ pg.imagePath + '/square.png" style="background-image: url(' + galleryImage + ');" title="' + galleryTitle + '" title="' + galleryTitle + '" class="pgalbumimg">';
						}else {
							imgHTML = '<img src="' + galleryImage + '" title="' + galleryTitle + '" title="' + galleryTitle + '" class="pgalbumimg">';
						}
		          
		          		// Append
						if(pg.type == 'wp_gallery'){
							jQuery('#pgalbums').append(
									'<li class="pgalbumthumb item ' + dataCategory + '" data-category="' + dataCategory + '" >' +
										'<a href="' + galleryJSON + '" class="pgalbumlink">' + imgHTML + '<span style="display:none;">' + galleryTitle + '</span><span class="pgplus">+</span></a><span class="pgalbumtitle">' + galleryTitle + '</span>' +
									'</li>'
								);
						}else{
							if(options){
								lmnt.find('#pgalbums').append(
									'<li class="pgalbumthumb">' +
										'<a data-url-json="'+galleryJSON+'" href="' + galleryJSON + '" class="pgalbumlink">' + imgHTML + '<span class="pgalbumtitle" style="display: none;">' + galleryTitle + '</span><span class="pgplus">+</span></a><span class="pgalbumtitle">' + galleryTitle + '</span>' +
									'</li>'
									);
							}else{
								jQuery('#pgalbums').append(
									'<li class="pgalbumthumb">' +
										'<a href="' + galleryJSON + '" class="pgalbumlink">' + imgHTML + '<span style="display: none;">' + galleryTitle + '</span><span class="pgplus">+</span></a><span class="pgalbumtitle">' + galleryTitle + '</span>' +
									'</li>'
								);
							}
							
						}
				}
			
			}, //End loadAlbums
				
			/*--------------------------
			
				Load all the images within
				a specific gallery
			
			----------------------------*/
			
			loadSingleAlbum:function(){
				var url;
				//get title singleAlbum
				var allAlbum,title;
				switch(pg.type)
				{
				case 'wp_gallery':
					url = pg.wpAlbumURL;
					break;
				case 'google':
					url = 'https://picasaweb.google.com/data/feed/base/user/' + pg.userId + '/albumid/' + pg.albumId + '?alt=json&hl=en_US';
					break;
				case 'flickr':
					url = 'https://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key=' + pg.apiKey + '&photoset_id=' + pg.albumId + '&format=json&jsoncallback=?';
					break;
				case 'facebook':
					url = 'https://graph.facebook.com/' + pg.albumId + '/photos?limit=' + pg.limit + '&access_token=273366399527177|afnxgGNbszgV2ny0GShChH2coAQ';
					allAlbum ='https://graph.facebook.com/' + pg.userId + '/albums?access_token=273366399527177|afnxgGNbszgV2ny0GShChH2coAQ';
					
					break;
				case 'instagram':
					url = 'https://api.instagram.com/v1/users/' + pg.userId + '/media/recent/?access_token=35163631.3a5ca5d.be9b66ad0f964d17b996d2a899bc8cd3&count=' + pg.limit;
					break;
				}
				
				pg.loadGallery(url);
				lmnt.addClass('loaded');
				jQuery('#pgthumbhome').hide();
				jQuery('#pgoptionsthumbhome').hide();
				
			},
			
			/*--------------------------
			
				Load all the images within
				a specific gallery
			
			----------------------------*/
			loadGallery: function(url,title){
				var obPath,
						imgTitle,
						imgSrc,
						imgTh,
						imgBg = '',
            thumbsLoaded = 0,
            zoomWidth,
            flickrImgExt;

				pg.imgArray = [];
				pg.titleArray = [];
				pg.descArray = [];
				jQuery('#pgzoom').empty();
				var dataType = "jsonp";
				if( pg.type == 'wp_gallery' ){
					dataType = "json";
				}
				jQuery.ajax({
					url: url,
					cache: false,
					dataType: dataType,
					success: function(json){
						jQuery('.crumbtitle').remove();
						jQuery('#pgthumbs').empty();
						if(title === undefined){
							title = '&nbsp;';
						}
						jQuery('#pgthumbcrumbs').append('<li class="crumbtitle">' + title + '</li>');
						
						switch(pg.type)
						{
						case 'wp_gallery':
							objPath = json.data;
							break;
						case 'google':
							objPath = json.feed.entry;
							break;
						case 'flickr':
							objPath = json.photoset.photo;
							break;
						case 'facebook':
							objPath = json.data;
							break;
						case 'instagram':
							objPath = json.data;
							break;
						}
						
										
						pg.imgTotal = objPath.length;
						//limit the results
						if(pg.type == 'wp_gallery'){
							pg.limit = 9999;
						}else if(pg.limit < pg.imgTotal){
							pg.imgTotal = pg.limit;
						}
						
						if(pg.imgTotal === 0) {
							message = 'Please check your photo permissions,\nor make sure there are photos in this gallery.';
							pg.message(message);
						}

						if(pg.winWidth > 1100) {
							zoomWidth = 1024;
							flickrImgExt = '_b';
						} else if(pg.winWidth > 620) {
							zoomWidth = 768;
							flickrImgExt = '_b';
						} else {
							zoomWidth = 540;
							flickrImgExt = '_z';
						}

						jQuery.each(objPath,function(i,obj){
							//limit the results
							
							if(i < pg.limit) {
								switch(pg.type)
								{
								case 'wp_gallery':
									imgTitle = obj.title;
									imgCaption = obj.caption;
									imgDesc = obj.desc;
									imgSrc = obj.source;
									imgTh = pg.imagePath + '/square.png';
									imgBg = ' style="background: url(' + obj.thumbnail + ') no-repeat 50% 50%; background-size: cover;"';
									break;
								case 'google':
									imgTitle = obj.title.$t;
									imgSrc = obj.media$group.media$content[0].url;
									var lastSlash = imgSrc.lastIndexOf('/');
									var imgSrcSubString =imgSrc.substring(lastSlash);
									
									//show the max width image 1024 in this case
									imgSrc = imgSrc.replace(imgSrcSubString, '/s' + zoomWidth + imgSrcSubString);
									
									imgTh = obj.media$group.media$thumbnail[1].url;
									imgTh = imgTh.replace('s144','s160-c');
									break;
								case 'flickr':
									imgTitle = obj.title;
									imgSrc = 'https://farm' + obj.farm + '.staticflickr.com/' + obj.server + '/' + obj.id + '_' + obj.secret + flickrImgExt + '.jpg';
									imgTh = 'https://farm' + obj.farm + '.staticflickr.com/' + obj.server + '/' + obj.id + '_' + obj.secret + '_q.jpg';
									break;
								case 'facebook':
									imgTitle = obj.name;
									imgSrc = obj.images[0].source;
									imgTh = pg.imagePath + '/square.png';
									imgBg = ' style="background: url(' + obj.images[0].source + ') no-repeat 50% 50%; background-size: cover;"';
									break;
								case 'instagram':
									if(obj.caption !== null){
										imgTitle = obj.caption.text;
									}
									imgSrc = obj.images.standard_resolution.url;
									imgTh = obj.images.low_resolution.url;
									break;
								}
								
								if(!imgTitle) {
									imgTitle = '';
								}
										
								pg.imgArray[i] = imgSrc;
								pg.titleArray[i] = imgTitle;
								
								if(pg.type == 'wp_gallery'){
									pg.descArray[i] = imgDesc;
									var pggallery_title = imgTitle;
									var pggallery_caption = (imgCaption) ? imgCaption : '';
									if( pggallery_title ){
										pggallery_title = imgTitle;
									}else{
										pggallery_title = '';
									}
										
									jQuery('#pgthumbs').append('<li class="pgthumb"><a href="' + imgSrc + '"><img src="' + imgTh + '" id="pgthumbimg' + i + '" class="pgthumbimg" alt="' + pg.capLength(pggallery_title , pg.cap_Length) + '" title="' + pg.capLength(pggallery_title , pg.cap_Length) + '"' + imgBg + '><span class="pg-wp-attachment-caption">' + pggallery_caption + '</span></a><span class="pgalbumtitle">'+ pggallery_title + '</span></li>');
								}else{
									jQuery('#pgthumbs').append('<li class="pgthumb"><a href="' + imgSrc + '"><img src="' + imgTh + '" id="pgthumbimg' + i + '" class="pgthumbimg" alt="' + pg.capLength(imgTitle , pg.cap_Length) + '" title="' + pg.capLength(imgTitle , pg.cap_Length) + '"' + imgBg + '></a></li>');
								}
								
								//check to make sure all the images are loaded and if so show the thumbs
								jQuery('#pgthumbimg' + i).load(function(){
									thumbsLoaded++;
									if(thumbsLoaded == pg.imgTotal) {
										jQuery('#pgalbums').slideFade(700,function(){
										jQuery('.pgalbumthumb .pgloading').remove();
									});
									jQuery('#pgthumbview').slideFade(700);
									}
							});
							} //end if(i < pg.limit)							
						}); //end each
					}, //end success
					error: function(jqXHR, textStatus, errorThrown){
						console.log('Error: \njqXHR:' + jqXHR + '\ntextStatus: ' + textStatus + '\nerrorThrown: '  + errorThrown);
					}					
				});	
			}, //End loadGallery
			
			zoomIdx: null, //the zoom index
			zoomImagesLoaded: [],
			zoomScrollDir: null,
			zoomScrollLeft: 0,
			loadZoom: function(idx){
				pg.zoomIdx = idx;
				pg.winWidth = jQuery(window).width();
				var pgZoomView = jQuery('#pgzoomview'),
						pgZoomScroll = jQuery('#pgzoomscroll'),
						pgPrevious = jQuery('#pgprevious'),
						pgNext = jQuery('#pgnext'),
						pgZoom = jQuery('#pgzoom'),
						pgZoomHTML = '',
						totalImages = pg.imgArray.length;
				pgZoomView.addClass('fixed');
				
				//show/hide the prev/next links
				if(idx === 0) {
					pgPrevious.hide();
				}
				
				if(idx == totalImages - 1) {
					pgNext.hide();
				}
		
				var pgzoomWidth = pg.imgArray.length * pg.winWidth;
				jQuery('#pgzoom').width(pgzoomWidth);
				
				var scrollLeftInt = parseInt(idx * pg.winWidth);
								
				pgZoomView.fadeIn(function(){
					//this has gotta come in after the fade or iOS blows up.
					
					jQuery(window).on('resize',pg.resizeZoom);
					
					jQuery.each(pg.imgArray,function(i){
						if(pg.type == 'wp_gallery'){
							pgZoomHTML = pgZoomHTML  + '<li class="pgzoomslide loading" id="pgzoomslide' + i + '" style="width: ' + pg.winWidth + 'px;"><div class="pgzoomspacer"></div><img src="' + pg.imgArray[i] + '" data-src="' + pg.imgArray[i] + '" title="' + pg.capLength(pg.descArray[i] , pg.cap_Length) + '" alt="' + pg.capLength(pg.descArray[i] , pg.cap_Length) + '" id="pgzoomimg' + i + '" class="pgzoomimg"><span class="pgzoomcaption">' + pg.capLength(pg.descArray[i] , pg.cap_Length) + '</span></li>';
						}else{
							pgZoomHTML = pgZoomHTML  + '<li class="pgzoomslide loading" id="pgzoomslide' + i + '" style="width: ' + pg.winWidth + 'px;"><div class="pgzoomspacer"></div><img src="' + pg.imgArray[i] + '" data-src="' + pg.imgArray[i] + '" title="' + pg.capLength(pg.titleArray[i] , pg.cap_Length) + '" alt="' + pg.capLength(pg.titleArray[i] , pg.cap_Length) + '" id="pgzoomimg' + i + '" class="pgzoomimg"><span class="pgzoomcaption">' + pg.capLength(pg.titleArray[i] , pg.cap_Length) + '</span></li>';
						}
						//pgZoomHTML = pgZoomHTML  + '<li class="pgzoomslide loading" id="pgzoomslide' + i + '" style="width: ' + pg.winWidth + 'px;"><div class="pgzoomspacer"></div><img src="' + pg.imgArray[i] + '" data-src="' + pg.imgArray[i] + '" title="' + pg.capLength(pg.titleArray[i] , pg.cap_Length) + '" alt="' + pg.capLength(pg.titleArray[i] , pg.cap_Length) + '" id="pgzoomimg' + i + '" class="pgzoomimg"><span class="pgzoomcaption">' + pg.capLength(pg.titleArray[i] , pg.cap_Length) + '</span></li>';
						if(i + 1 == pg.imgArray.length) {
							//at the end of the loop
								jQuery('#pgzoom').html(pgZoomHTML);
								
								pg.zoomKeyPress();
								jQuery('#pgzoomscroll').scrollLeft(scrollLeftInt);
								pg.zoomScrollLeft = scrollLeftInt;
								pg.loadZoomImg(idx);
								pg.zoomScroll();
								//load siblings
								if((idx - 1) >= 0){
								pg.loadZoomImg(idx - 1);
								}
								
								if((idx + 1) < pg.imgArray.length){
									pg.loadZoomImg(idx + 1);
								}
							}
						});
					});
				
			},
					
			loadZoomImg:function(idx){
				jQuery('#pgzoomimg'+idx).css('opacity',99999);
			},
			
			zoomScroll:function(){
				var pgPrevious = jQuery('#pgprevious'),
						pgNext = jQuery('#pgnext'),
						scrollTimeout,
						canLoadZoom = true;
				
				jQuery('#pgzoomscroll').on('scroll',function(){
					currentScrollLeft = jQuery(this).scrollLeft();
					if(canLoadZoom === true) {
						canLoadZoom = false;
						scrollTimeout = setTimeout(function(){
							if(currentScrollLeft === 0){
								pgPrevious.fadeOut();
							}
							else {
								pgPrevious.fadeIn();
							}
							
							if(currentScrollLeft >= (pg.imgTotal - 1) * pg.winWidth){
							pgNext.fadeOut();
							}
							else {
								pgNext.fadeIn();
							}
							
							/*Check if we have scrolled left and if so load up the zoom image*/
							if(currentScrollLeft % pg.zoomScrollLeft > 20 || (currentScrollLeft > 0 && pg.zoomScrollLeft === 0)){
								pg.zoomScrollLeft = currentScrollLeft;
								var currentIdx = pg.zoomScrollLeft / pg.winWidth;
								
								var currentIdxCeil = Math.ceil(currentIdx);
								var currentIdxFloor = Math.floor(currentIdx);
								
								//Lazy load siblings on scroll.
								if(!pg.zoomImagesLoaded[currentIdxCeil]) {
									pg.loadZoomImg(currentIdxCeil);
								}
								if(!pg.zoomImagesLoaded[currentIdxFloor]){
									pg.loadZoomImg(currentIdxFloor);
								}
							}
							canLoadZoom = true;
						},200);
					}
				});
			},
			
			zoomKeyPress: function(){
				jQuery(document).on('keyup','body',function(e){
					if(e.which == 27){
						pg.unloadZoom();
					}
					else
					if(e.which == 37){
						pg.prevNext('previous');
					}
					else
					if(e.which == 39){
						pg.prevNext('next');
					}
				});
			},
			
			resizeZoom: function(){
				pg.winWidth = jQuery(window).width();
				var pgzoomWidth = pg.imgArray.length * pg.winWidth;
				jQuery('#pgzoom').width(pgzoomWidth);
				jQuery('.pgzoomslide').width(pg.winWidth);
				
				var scrollLeftInt = parseInt(pg.zoomIdx * pg.winWidth);
				
				jQuery('#pgzoomscroll').scrollLeft(scrollLeftInt);
			},
			
			unloadZoom: function(){
				jQuery(document).off('keyup','body');
				jQuery(window).off('resize',pg.resizeZoom);
				jQuery('#pgzoomscroll').off('scroll');
				jQuery('#pgzoomview').fadeOut(function(){
					jQuery('#pgzoom').empty();
					jQuery('#pgzoomview').off('keyup');
					jQuery('#pgzoomview').removeClass('fixed');
				});
				// return html overflow-y
				jQuery('html').removeClass('pgzoom-overflow-y');
			},
			
			prevNext: function(dir){
				var currentIdx = jQuery('#pgzoomscroll').scrollLeft() / pg.winWidth;
				
				if(dir == "previous"){
					pg.zoomIdx = Math.round(currentIdx)  - 1;
				}
				else {
					pg.zoomIdx = Math.round(currentIdx) + 1;
				}
				
				var newScrollLeft = pg.zoomIdx * pg.winWidth;
				
				jQuery('#pgzoomscroll').stop().animate({scrollLeft:newScrollLeft});
			},
			
			capLength: function(string,length){
				string = jQuery.trim(string);
				// Replace all bad character
				string = string.replace(/\</g,'&#60');
				string = string.replace(/\>/g,'&#62');	
				string = string.replace(/\"/g,'&#34');
				string = string.replace(/\'/g,'&#39');
				string = string.replace(/\%/g,'&#37');
					
				if (string.length > length)
				{
					var cut = string.substring(0, length);
					// Cut last string
					last_space_position = cut.lastIndexOf(' ');
					//		console.log(last_space_position);
					if (last_space_position < length){
						return string.substring(0,last_space_position) + "...";
					}else{
						return cut + '...';
					} 
				}else
					return string;
			},
			// Scroll up to aligning album
			scrollup: function(){				
				jQuery('html,body').animate({
			        scrollTop: jQuery("#DTPlusgalleryWrapper").offset().top},
			        'slow');
			},
			// Display the messages
			message: function(message){
				jQuery('.dtpg_message').html(message);
				setTimeout(function(){
					jQuery('.dtpg_message').hide('slow');
				}, 5000);
			},
			// Isotope
			pgIsotope: function(container,itemSelector){
				var $container = jQuery("#"+pg.id + ' .isotope');
			  	$container.isotope({
				  // options		  
				  itemSelector: '.item',
				  layoutMode: 'fitRows',
				  resizable: true
				});
			 // filter functions
				var filterFns = {
				// show if number is greater than 50
				numberGreaterThan50: function() {
				  var number = $(this).find('.number').text();
				  return parseInt( number, 10 ) > 50;
				},
				// show if name ends with -ium
				ium: function() {
				  var name = $(this).find('.name').text();
				  return name.match( /ium$/ );
				}
				};
				
				// Hide the filter that has not any albums
				if((plusCategoryFilters = jQuery('.plus-category'))){
					var dataFilters = [];
					var Ifilters = jQuery(plusCategoryFilters).find('span');
					jQuery(Ifilters).each(function(){
						var Ifilter = jQuery( this ).attr('data-category');
						Ifilter = Ifilter.substring(1);
						dataFilters.push(Ifilter);
					});
					//
					var Iitems = jQuery("#"+pg.id).find(".isotope").find("li");
					var DataCategory = [];			
					jQuery(Iitems).each(function(){
						DataCategory.push( jQuery(this).attr("data-category") );
					});
					// Remove duplicates
					var DataCat = [];
					jQuery.each(DataCategory, function(i, el){
					    if(jQuery.inArray(el, DataCat) === -1) DataCat.push(el);
					});
					
				}
				// Get an array of the filters that has not data item and remove filter
				var FhasNotItems = [];
				jQuery.each( dataFilters, function(idx, value){				
					if( jQuery.inArray(value, DataCat) !== -1 ){
						// Match data item					
					}else{					
						FhasNotItems.push(value);
					}
				});
				//remove filter			
				jQuery(Ifilters).each(function(){
					jQuery( this ).removeClass("hidden-filter");
					var Ifilter = jQuery( this ).attr('data-category');
					Ifilter = Ifilter.substring(1);			
					if( Ifilter !== "" ){
						for (var i = 0 ; i < FhasNotItems.length ; i++ ){
							if(FhasNotItems[i] == Ifilter){
								jQuery( this ).addClass("hidden-filter");
							}
						}
						
					}						
				});
				
			  	// bind filter button click
			  	jQuery('.filters').on( 'click', 'span', function() {
			  	jQuery(this).parent().find('.active').removeClass('active');		
			  	jQuery(this).addClass('active');
				var filterValue = jQuery( this ).attr('data-category');
				// use filterFn if matches value
				filterValue = filterFns[ filterValue ] || filterValue;
				$container.isotope({ filter: filterValue });
				});
			}
		};
		
		jQuery.extend(pg, options);
		pg.init();
	};
})( jQuery );

function DTPGThumbHome(element){
	var newElement = jQuery(element);
	var pgthumbview = newElement.closest('#pgthumbview');
	var pgalbums = newElement.closest('.dtpg_tab_plusgallery_content').find('#pgalbums');
	// Return Link for Album
	var pgalbumlink = newElement.closest('.dtpg_tab_plusgallery_content').find('.addLink');
	pgalbumlink.attr('href',pgalbumlink.data('url-json')).removeClass('addLink');
	// Empty gallery
	newElement.closest('.dtpg_tab_plusgallery_content').find('#pgthumbs').empty();
	jQuery('#pgzoomview').find('#pgzoom').empty();	
	pgthumbview.slideFade(300);
	pgalbums.slideFade(300);
}