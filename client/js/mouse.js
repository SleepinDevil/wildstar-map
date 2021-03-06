/*
 * mouse.js
 *
 * Registers mousehandlers (cross-browser) for movement, clicking and
 * mousewheel and passes on the events to it's listeners.
 * This source also handles the dragging for moving the map around and
 * opening up the contextmenu.
 *
 * 2014 by Prior(Frederick Gnodtke) under the terms of GNU GPL
 */

var Mouse = function(canvas) {
	var self = this;
	this.position = {
		x : 0,
		y : 0
	};
	canvas.addEventListener("mouseup", function(e) {
		if(e.button == 0)
		self.up(e);
	});
	canvas.addEventListener("mousedown", function(e) {
		if(e.button == 0)
		self.down(e);
	});
	canvas.addEventListener("contextmenu", function(e) {
		e.preventDefault();
		self.context(e);
	}, false);
	canvas.addEventListener("mousemove", function(e) {
		self.move(e);
	});
	canvas.addEventListener("mousewheel", function(e) {
		self.wheel(e);
	}, false);
	canvas.addEventListener("DOMMouseScroll", function(e) {
		self.wheel(e);
	}, false);
	this.dragEvents = [];
	this.upEvents = [];
	this.downEvents = [];
	this.wheelEvents = [];
	this.contextEvents = [];
	this.last = undefined;
};

Mouse.prototype = {
	onDrag : function(f) {
		this.dragEvents.push(f);
	},
	onUp : function(f) {
		this.upEvents.push(f);
	},
	onDown : function(f) {
		this.downEvents.push(f);
	},
	onWheel : function(f) {
		this.wheelEvents.push(f);
	},
	onContext : function(f) {
		this.contextEvents.push(f);
	},
	up : function() {
		this.pressed = false;
		this.last = undefined;
		for(var i in this.upEvents) {
			this.upEvents[i]();
		}
	},
	context : function(e) {
		for(var i in this.contextEvents) {
			this.contextEvents[i](e.clientX, e.clientY);
		}
	},
	down : function(e) {
		var ok = true
		for(var i in this.downEvents) {
			ok &= !this.downEvents[i](e.clientX, e.clientY);
		}
		if(ok) {
			this.pressed = true;
			this.last = undefined;
		}
	},
	move : function(e) {
		this.position.x = e.clientX;
		this.position.y = e.clientY;
		if(this.pressed) {
			if(this.last != undefined) {
				/*offset = {
					x : offset.x + e.x - last.x,
					y : offset.y + e.y - last.y
				};*/
				var offset = {
					x : e.clientX - this.last.x,
					y : e.clientY - this.last.y
				};
				for(var i in this.dragEvents) {
					this.dragEvents[i](offset);
				}
			}
			this.last = {
				x : e.clientX,
				y : e.clientY
			};
		}
	},
	wheel : function(e) {
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		for(var i in this.wheelEvents) {
			this.wheelEvents[i](delta);
		}
	}
};
