jQuery(document).ready(function($) {
	"use strict";
	$(window).load(function () {
		$("#status").fadeOut();
		$("#preloader").delay(350).fadeOut("slow");
		if($(".rockon_portfolio_width").hasClass( "rockon_portfolio_width" )){
			var offset = $(".rockon_portfolio_width").offset();
			var ls = 0;
			if(offset.left > 0){
				ls = -offset.left;
			}
			$('.rockon_portfolio_width').css( { position: 'relative',
			left: ls+'px',
			width: $(window).width()+'px' } );
		}	
			
	});
	 // select
	 $(window).on('load', function () {
				$('.selectpicker').selectpicker({
					'selectedText': 'cat'
				});
			  // $('.selectpicker').selectpicker('hide');
	  });
  $('.rock_logo:after').addClass('animated fadeInDownBig');
	//smooth scrolling
	$.smoothScroll();
	// single page
	//$("#rockon_single").single({
	//	speed: 1000
	//});
	
	//widget select
	$('.widget select').addClass('selectpicker');
	
	
	// video mediaelementplayer
	$('video').mediaelementplayer({
	success: function(media, node, player) {
		$('#' + node.id + '-mode').html('mode: ' + media.pluginType);
		}
	});
	
	
	//Check if browser is Safari or not
	if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
		$('.products').addClass('product_sufari');
	}
	
	// tooltip
	$('[data-toggle="tooltip"]').tooltip();
	//
	var bg_w = window.innerWidth;
	var bg_h = window.innerHeight;
	$('rock_single_page_slider_bg').css('width', bg_w);
	$('rock_single_page_slider_bg').css('height', bg_h);
	 //active menu on scroll single page
	 $(window).scroll(function() {
		var windscroll = $(window).scrollTop();
			if (windscroll >= 100) {
				$('.rockon_section').each(function(i) {
					if ($(this).position().top <= windscroll + 10 ) {
						$('.rock_menu_single ul li').removeClass('active');
						$('.rock_menu_single ul li').eq(i).addClass('active');
					}
				});
			} else {
				$('.rock_menu_single ul li').removeClass('active');
				$('.rock_menu_single ul li:first').addClass('active');
			}
		}).scroll();		
	// fixed menu on scroll
	var hig = window.innerHeight - 130;
	$(window).bind('scroll', function() {
             if ($(window).scrollTop() > hig) {
                 $('#rock_header').addClass('rock_header_fixed');
             }
             else {
                 $('#rock_header').removeClass('rock_header_fixed');
             }
        });
	$(window).bind('scroll', function() {
             if ($(window).scrollTop() > 0) {
                 $('#rock_header_otherpage').addClass('rock_header_fixed');
             }
             else {
                 $('#rock_header_otherpage').removeClass('rock_header_fixed');
             }
        });
	$(window).bind('scroll', function() {
             if ($(window).scrollTop() > hig) {
                 $('#rock_header_single_page').addClass('rock_header_fixed');
             }
             else {
                 $('#rock_header_single_page').removeClass('rock_header_fixed');
             }
        });	
	/*********color change script*******/
	$('.colorchange').click(function(){
		var color_name=$(this).attr('id');
		var siteurl = $('#rockon_style_siteurl').val();
		if(color_name != 'style' && color_name != 'style_light_version'){
			var new_style= siteurl+'/css/color/'+color_name+'.css';
		}else{
			var new_style= '';
		}
		$('#basic_color-css').attr('href',new_style);
		if($('#basic_color_rs-css')){
			$('#basic_color_rs-css').attr('href','');
		}
		$.ajax({
			type : "post",
			url : $('#rockon_style_ajaxurl').val(),
			data : {'colorcssfile_url' : color_name, 'action' : 'rockon_style_swticher_setting'}, 
			success: function(response) {
				console.log(response);
			}
		});
	});
	$('.pattern_change').click(function(){
		var name=$(this).attr('id');
		var siteurl = $('#rockon_style_siteurl').val();
		var new_style=siteurl+'/css/pattern/'+name+'.css';
		$('#basic_patern-css').attr('href',new_style);
		$.ajax({
			type : "post",
			url : $('#rockon_style_ajaxurl').val(),
			data : {'patterncssfile_url' : name, 'action' : 'rockon_style_swticher_setting'}, 
			success: function(response) {
				console.log(response);
			}
		});
	});
	
	
	//woocomerce single page number input
	$('.minus').click(function () {
		var $input = $(this).parent().find('input');
		var count = parseInt($input.val()) - 1;
		count = count < 1 ? 1 : count;
		$input.val(count);
		$input.change();
		return false;
	});
	$('.plus').click(function () {
		var $input = $(this).parent().find('input');
		$input.val(parseInt($input.val()) + 1);
		$input.change();
		return false;
	});
	
	//woocommerce-message
	var woocommerce_error =	setTimeout(function () {
			 $('.woocommerce-error').fadeOut(500);
		 }, 5000);
	var woocommerce_info =	setTimeout(function () {
			 $('.woocommerce-info').fadeOut(500);
		 }, 5000);
	var woocommerce_message =	setTimeout(function () {
			 $('.woocommerce-message').fadeOut(500);
		 }, 5000);		
	
	
	/* Portfolio */
	  if ($.fn.mixitup) {
	      $('#grid').mixitup( {
	        filterSelector: '.filter-item'
	      } );
	      $(".filter-item").click(function(e) {
	      	e.preventDefault();
	      })
	  }
	
	
	//rotate setting gear 
	$(function() {
		var $rota = $('#style-switcher .bottom a.settings img'),
			degree = 0,
			timer;
		function rotate() {    
			$rota.css({ transform: 'rotate(' + degree + 'deg)'});
			// timeout increase degrees:
			timer = setTimeout(function() {
				++degree;
				rotate(); // loop it
			},0);
		}
		rotate();    // run it!
	});
	$("#style-switcher .bottom a.settings").click(function(e){
			e.preventDefault();
			var div = $("#style-switcher");
			if (div.css("left") === "-161px") {
				$("#style-switcher").animate({
					left: "0px"
				}); 
			} else {
				$("#style-switcher").animate({
					left: "-161px"
				});
			}
		});
/******color change script end******/
    //accordion
	jQuery(function ($) {
		var $active = $('#accordion .panel-collapse.in').prev().addClass('active');
		$active.find('a').prepend('<i class="glyphicon glyphicon-minus"></i>');
		$('#accordion .panel-heading').not($active).find('a').prepend('<i class="glyphicon glyphicon-plus"></i>');
		$('#accordion').on('show.bs.collapse', function (e) {
			$('#accordion .panel-heading.active').removeClass('active').find('.glyphicon').toggleClass('glyphicon-plus glyphicon-minus');
			$(e.target).prev().addClass('active').find('.glyphicon').toggleClass('glyphicon-plus glyphicon-minus');
		})
	});
	// drop down menu
	$('.rock_menu ul li').children('ul').addClass('animated fadeInDown');
	$('.rock_menu ul li ul li').children('ul').addClass('animated fadeInLeft');
	// event tab
	$('.rock_event_tab > ul').each(function(){
			// For each set of tabs, we want to keep track of
			// which tab is active and it's associated content
			var $active, $content, $links = $(this).find('a');
			// If the location.hash matches one of the links, use that as the active tab.
			// If no match is found, use the first link as the initial active tab.
			$active = $($links.filter('[href="'+location.hash+'"]')[0] || $links[0]);
			$active.addClass('active');
			//$content = $($active.hash);
			$content = $($active[0].hash);
			// Hide the remaining content
			$links.not($active).each(function () {
			  $(this.hash).hide();
			});
			// Bind the click event handler
			$(this).on('click', 'a', function(e){
			  // Make the old tab inactive.
			  $active.removeClass('active');
			  $content.hide();
			  // Update the variables with the new link and content
			  $active = $(this);
			  $content = $(this.hash);
			  // Make the tab active.
			  $active.addClass('active');
			  $content.fadeIn().addClass('animated fadeIn');
			  // Prevent the anchor's default click action
			  e.preventDefault();
			});
		  });
	 // date time picker	
	     var logic = function( currentDateTime ){
			if( currentDateTime ){
				if( currentDateTime.getDay()==6 ){
					this.setOptions({
						minTime:'11:00'
					});
				}else
					this.setOptions({
						minTime:'8:00'
					});
			}
		};
		$('#datetimepicker').datetimepicker({
			onChangeDateTime:logic,
			onShow:logic
		});
	// slider autoplay
	$(function(){
      $('.carousel').carousel({
      interval: 4000,
	  pause: false
		});
	});
	// slider background
	$(function() {
				$( '#ri-grid' ).gridrotator( {
					rows : 4,
					columns : 8,
					maxStep : 2,
					interval : 2000,
					w1024 : {
						rows : 5,
						columns : 6
					},
					w768 : {
						rows : 5,
						columns : 5
					},
					w480 : {
						rows : 6,
						columns : 4
					},
					w320 : {
						rows : 7,
						columns : 4
					},
					w240 : {
						rows : 7,
						columns : 3
					},
				} );
			});
		// footer copyright background
		$(function() {
				$( '#ri-grid2' ).gridrotator( {
					rows : 1,
					columns : 8,
					maxStep : 2,
					interval : 2000,
					w1024 : {
						rows : 1,
						columns : 6
					},
					w768 : {
						rows : 1,
						columns : 5
					},
					w480 : {
						rows : 2,
						columns : 4
					},
					w320 : {
						rows : 2,
						columns : 4
					},
					w240 : {
						rows : 3,
						columns : 3
					},
				} );
			});
		// page title background
		$(function() {
				$( '#rock_page_title_bg' ).gridrotator( {
					rows : 1,
					columns : 8,
					maxStep : 2,
					interval : 2000,
					w1024 : {
						rows : 1,
						columns : 6
					},
					w768 : {
						rows : 1,
						columns : 5
					},
					w480 : {
						rows : 2,
						columns : 4
					},
					w320 : {
						rows : 2,
						columns : 4
					},
					w240 : {
						rows : 3,
						columns : 3
					},
				} );
			});
		
		
		
		
		$(window).on('resize', function(){
			var slider_height = $(window).innerHeight();
			$('.rock_slider_div .main').css('height', slider_height);
		});
		//function for slider height on resize
		window.onresize = function(){
			if (window.innerHeight > 992)
			{
				 //slider height on resize 
				var slider_height = $(window).innerHeight();
				$('.rock_slider_div .main').css('height', slider_height);
			}
			else{
				var slider_height1 = $('.rock_slider_div .main #ri-grid').innerHeight();
				$('.rock_slider_div .main').css('height', slider_height1);
			}
		}    
		
		
		// club photo hover overlay
		$('.rock_club_photo_item').hover(function(){
			$(this).children('.rock_club_photo_overlay').children('.photo_link').addClass('fadeInDown');
			$(this).children('.rock_club_photo_overlay').children('.rock_club_photo_detail').addClass('fadeInUp');
			$(this).children('.rock_club_photo_overlay').show();
			});
		$('.rock_club_photo_item').mouseleave(function(){
			$('.rock_club_photo_item .rock_club_photo_overlay').children('.photo_link').removeClass('fadeInDown');
			$('.rock_club_photo_item .rock_club_photo_overlay').children('.rock_club_photo_detail').removeClass('fadeInUp');
			$(this).children('.rock_club_photo_overlay').hide();
		});	
		
		/*
		// footer and rock-track
		var track_height = $(".rock_club_track").innerHeight() - 100;
		var half_of_track_height = track_height / 2 ;
		$('.rock_footer').css('margin-top', half_of_track_height);
		$('.rock_footer').css('padding-top', half_of_track_height + 30);
		*/
		
		//player
		$(function(){
		  $('.rock_player').mediaelementplayer({
			alwaysShowControls: true,
			features: ['playpause','progress','volume'],
			audioVolume: 'horizontal',
			audioWidth: 450,
			audioHeight: 70,
			iPadUseNativeControls: true,
			iPhoneUseNativeControls: true,
			AndroidUseNativeControls: true
		  });
		});
		
		$(function(){
			$('.rockon_player audio').mediaelementplayer({
					   loop: true,
			shuffle: true,
			audioVolume: 'horizontal',
			playlist: false,
			features: ['playlistfeature','playpause', 'nexttrack'],
				keyActions: []
			});
		});
		
		setTimeout(
		  function() 
		  {
			$('.rockon_player').css('display','block');
		  }, 3000);
		
		
		
	$('.bxslider').bxSlider({
	  mode: 'vertical',
	  slideMargin: 5,
	  minSlides: 2,
	  auto: true,
	  default: 500,
	  controls: false,
	  pager: false,
	  autoHover: true
    });
	
	$('.portfolio_filter_slider').bxSlider({
	  minSlides: 4,
	  maxSlides: 4,
	  slideWidth: 360,
	  slideMargin: 10,
	  pager: false,
    });
	
	// club photo image popup
	$(".fancybox").fancybox({
          openEffect	: 'elastic',
		  closeEffect	: 'elastic',
		  helpers : 
			{
				overlay: 
				{ 
					locked: false 
				} 
			}
      });
	// portfolio video popup
	$(".fancybox-video").fancybox({
          openEffect	: 'elastic',
		  closeEffect	: 'elastic',
		  type : 'iframe',
		  helpers : 
			{	
				overlay: 
				{ 
					locked: false 
				} 
			}
      });	
	 
	//player poster hover
	$('.rock_audio_player').hover(function(){
		$('.rock_audio_player_track_image_overlay').toggle().addClass('animated fadeInUp');
	});
	//play list slider 
	$('.rock_track_playlist_slider').bxSlider({
	  mode: 'vertical',
	  slideMargin: 0,
	  minSlides: 5,
	  auto: true,
	  default: 500,
	  controls: true,
	  pager: false,
	  autoHover: true,
	  nextSelector: '#rock_track_playlist_slider_next',
      prevSelector: '#rock_track_playlist_slider_prev',
	  nextText: '<i class="fa fa-angle-up"></i>',
      prevText: '<i class="fa fa-angle-down"></i>'
    });	
	//Rockon Club Track share button hover
	 $('.rock_share_track').hover(function(){
		var id=$(this).attr('id');
		 $('.'+id).show();
		 $('.'+id+' li').addClass('animated fadeInLeft');
	  });
	 $('.rock_track_playlist ul li .rock_track_detail').mouseleave(function(){
		$('.rock_track_playlist ul li .rock_track_detail .rock_social').hide();
	  });
	 // sidebar categories dropdown
	 $('.rock_categories ul li').click(function(){
		 $(this).children('ul').slideToggle();
		 });
	  // book table
	  $('.rock_book_table').click(function(){
		  $(this).addClass('active');
		  $(this).children('.rock_table_1').children('.table_overlay').children('p').html('<p>Reserve</p>');
		  $(this).children('.rock_table_1').children('.table_overlay').children('p').css('margin-left','-27px');
		  $(this).children('.rock_table_1').children('.table_overlay').css('cursor','not-allowed');
		  });
	 $('.main_gallery_tab > ul').each(function(){
			// For each set of tabs, we want to keep track of
			// which tab is active and it's associated content
			var $active, $content, $links = $(this).find('a');
			// If the location.hash matches one of the links, use that as the active tab.
			// If no match is found, use the first link as the initial active tab.
			$active = $($links.filter('[href="'+location.hash+'"]')[0] || $links[0]);
			$active.addClass('active');
			$content = $($active[0].hash);
			// Hide the remaining content
			$links.not($active).each(function () {
			  $(this.hash).hide();
			});
			// Bind the click event handler
			$(this).on('click', 'a', function(e){
			  // Make the old tab inactive.
			  $active.removeClass('active');
			  $content.hide();
			  // Update the variables with the new link and content
			  $active = $(this);
			  $content = $(this.hash);
			  // Make the tab active.
			  $active.addClass('active');
			  $content.fadeIn();
			  // Prevent the anchor's default click action
			  e.preventDefault();
			});
		  });
	 // gallery item click
	 $('.main_gallery_item_link').click(function(){
		 $('.main_gallery_item_popup').each(function(){
			 $(this).hide();
			 });
		 var shaid=$(this).attr('id');
		 $('.'+shaid).slideDown();
	});
	 $('.main_gallery_item_popup_close').click(function(){
		 $('.main_gallery_item_popup').slideUp();
	 });	 
});
// club photo slider
jQuery(document).ready(function($) {
 "use strict";
  var owl = $("#rock_club_photo_slider");
  owl.owlCarousel({
      items : 3,
      itemsDesktop : [1000,3], 
      itemsDesktopSmall : [900,2], 
      itemsTablet: [600,2], 
      itemsMobile : [480,1]
  });
  // Custom Navigation Events
  $(".next").click(function(){
    owl.trigger('owl.next');
  })
  $(".prev").click(function(){
    owl.trigger('owl.prev');
  })
});

//woocomerce related product slider
jQuery(document).ready(function($) {
 "use strict";
  var owl = $(".related_product_slider");
  owl.owlCarousel({
      items : 3,
	  pagination: false,
	  itemsDesktop : [1000,3], 
      itemsDesktopSmall : [900,2], 
      itemsTablet: [600,2], 
      itemsMobile : [480,1]
  });
  // Custom Navigation Events
  $(".next").click(function(){
    owl.trigger('owl.next');
  })
  $(".prev").click(function(){
    owl.trigger('owl.prev');
  })
  
});


//woocomerce product image thumbnails  slider
jQuery(document).ready(function($) {
 "use strict";
  var owl = $(".images .thumbnails");
  owl.owlCarousel({
      items : 3,
	  margin:20,
	  navigation: true, 
	  navigationText : ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
	  pagination: false,
	  itemsDesktop : [1000,3], 
      itemsDesktopSmall : [900,2], 
      itemsTablet: [600,2], 
      itemsMobile : [480,1]
  });
  // Custom Navigation Events
  $(".next").click(function(){
    owl.trigger('owl.next');
  })
  $(".prev").click(function(){
    owl.trigger('owl.prev');
  })
  
});


// club photo slider
jQuery(document).ready(function($) {
 "use strict";
  var owl = $("#rock_disc_jockcy_slider");
  owl.owlCarousel({
      items : 4, 
      itemsDesktop : [1000,4], 
      itemsDesktopSmall : [900,3], 
      itemsTablet: [600,2], 
      itemsMobile : false ,
	  autoPlay : true
  });
  // Custom Navigation Events
  $(".next").click(function(){
    owl.trigger('owl.next');
  });
  $(".prev").click(function(){
    owl.trigger('owl.prev');
  });
  /*************** Contact-form *****************/
	$.validate({
		form : '#rockon_contactform',
		modules : 'security',
		onSuccess : function() {
		contactform();
		return false; // Will stop the submission of the form
		}
	});
	function contactform(){
		var formdata = $( "#rockon_contactform" ).serialize();
		formdata += '&action=rockon_sndadminmail';
		$.ajax({
			type : "post",
			url : $('#rockon_ajaxurl').val(),
			data : formdata, 
			success: function(response) {
				alert(response);
				$('.rockon_infotext').text(response);
				$('#Message').val('');
			}
		});
	}
	/*************** Contact-form *****************/
	
	$('#goGrid').click(function(){
		$('.product_wrapper').removeClass('col-lg-12 col-md-12 col-sm-12 product_list_wrapper').addClass('col-lg-4 col-md-4 col-sm-4');
		$('.rockon_product_shop_content').css('display','none');
		$('#goGrid').removeClass('active');
		$(this).addClass('active');
		$('#goList').removeClass('active');
	});
	
	$('#goList').click(function(){
		$('.product_wrapper').removeClass('col-lg-4 col-md-4 col-sm-4').addClass('col-lg-12 col-md-12 col-sm-12 product_list_wrapper');
		$('.rockon_product_shop_content').css('display','block');
		$('#goList').removeClass('active');
		$(this).addClass('active');
		$('#goGrid').removeClass('active');
	});
	
	/*$('.single_add_to_cart_button').click(function(e){
		e.preventDefault();
		var id = $(this).attr('data');
		$.ajax({
			type : "post",
			url : $('#woo_rockon_ajax').val(),
			data : {'product_id' : id, 'action' : 'woo_rockon_add_to_cart_single'}, 
			success: function(response) {
				alert(response);
				console.log(response);
			}
		});
	});*/
	
});

