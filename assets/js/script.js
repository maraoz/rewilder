(function ($) {

    'use strict';

	// accordion
	$(".single-accordion").click(function(e){

		if ($(e.target).closest('a').length) {
			return;
		}
		$(this).children('.accordion-head')	.toggleClass("active").next().slideToggle()
			.siblings().children('.accordion-head').removeClass('.active');
    });
	
	// faq auto-open
	var hash = window.location.hash.substr(1);
	if (hash) {
		$("#"+hash).children('.accordion-head')	.toggleClass("active").next().slideToggle()
		.siblings().children('.accordion-head').removeClass('.active');
	}

})(jQuery);

