(function ($) {

    'use strict';

	// countdown
	if (jQuery("[data-countdown]").length > 0) {
		$('[data-countdown]').each(function () {
			var $this = $(this);

			var finalDate = 1633996800000; // 12 Oct 2021 00:00:00 GMT
			// TODO: dev, remove
			finalDate = 1632797644244 + 1000*60*60;

			const tick = function (event) {
				const now = new Date().getTime();
				const delta = finalDate-now;
				const fmt = 
					'<span class="cdown days"><p>Days</p> <span class="time-count">%-D</span></span> '+
					'<span class="cdown hour"><p>Hours</p> <span class="time-count">%-H</span></span> '+
					'<span class="cdown minutes"><p>Minutes</p> <span class="time-count">%M</span></span> ';
				$this.html(event.strftime(fmt));
				if (delta < 1000*60 && !done) {
					timerDone();
				}
			};
			const timerDone = () => {
				done = true;
				const ctaHTML = 
				"<a href='https://app.rewilder.xyz/#' role='button'"+
					"class='btn btn-theme'>"+
					" Donate now! "
				"</a>"+
				"<h4>Fundraising started Oct 12, 2021.</h4>";
				$('#hero-main').html(ctaHTML);
			};

			const countdown = $this.countdown(finalDate);
			const now = new Date().getTime();
			let done = false;
			
			if (now > finalDate) {
				timerDone();
			}

			countdown.on('update.countdown', tick);
			countdown.on('finished.countdown', tick);
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
	if (hash) {
		$("#"+hash).children('.accordion-head')	.toggleClass("active").next().slideToggle()
		.siblings().children('.accordion-head').removeClass('.active');
	}

})(jQuery);

