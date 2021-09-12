(function ($) {

    'use strict';

	// countdown
	if (jQuery("[data-countdown]").length > 0) {
		$('[data-countdown]').each(function () {
			var $this = $(this);
			var finalDate = 1633996800000; // 12 Oct 2021 00:00:00 GMT
			$this.countdown(finalDate, function (event) {
				$this.html(event.strftime('<span class="cdown days"><p>Days</p> <span class="time-count">%-D</span></span> <span class="cdown hour"><p>Hours</p> <span class="time-count">%-H</span></span> <span class="cdown minutes"><p>Minutes</p> <span class="time-count">%M</span></span> '));
			});
		});
	};


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
	$("#"+hash).children('.accordion-head')	.toggleClass("active").next().slideToggle()
	.siblings().children('.accordion-head').removeClass('.active');

})(jQuery);

