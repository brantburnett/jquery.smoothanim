(function(jQuery, window) {
	var timerId = null,
		paintEventTimeStamp = 0,
		fNow = jQuery.now,
		
		// cache function to request the next animation frame
		requestFrame = window.mozRequestAnimationFrame;
		
	jQuery.now = function() {
		return paintEventTimeStamp || fNow.apply(this, arguments);
	};
		
	jQuery.fx.prototype.custom = function( from, to, unit ) {
		this.startTime = window.mozAnimationStartTime || fNow();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || "px";
		this.now = this.start;
		this.pos = this.state = 0;

		var self = this, fx = jQuery.fx;
		function t( gotoEnd ) {
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			if ( requestFrame ) {
				jQuery(window).bind("MozBeforePaint", fx.tick);
				timerId = 1;
				requestFrame();
			} else {
				timerId = setInterval(fx.tick, fx.interval);
			}					
		}
	};
	
	jQuery.extend(jQuery.fx, {
		tick: function( event ) {
			var timers = jQuery.timers;
				
			if ( requestFrame && event ) {
				paintEventTimeStamp = event.timeStamp;
			}

			for ( var i = 0; i < timers.length; i++ ) {
				if ( !timers[i]() ) {
					timers.splice(i--, 1);
				}
			}
			
			// Clear the paintEventTimeStamp to revert jQuery.now to normal operation
			paintEventTimeStamp = 0;

			if ( !timers.length ) {
				jQuery.fx.stop();
			} else if ( requestFrame ) {
				requestFrame();
			}
		},
		
		stop: function() {
			if ( requestFrame ) {
				jQuery(window).unbind("MozBeforePaint", jQuery.fx.tick);
			} else {
				clearInterval( timerId );
			}

			timerId = null;
		}
	});
		
})(jQuery, window);