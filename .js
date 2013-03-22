// based on http://nodejs.org/api/events.html

if (!window.EventEmitter) {
	window.EventEmitter = (function () {
		function EventEmitter() {
			this._listeners = {};
			this.maxListeners = 10;
		}

		var prototype = EventEmitter.prototype = {
			addListener: (function () {
				var listeners;

				return function EventEmitter_addListener(event, listener) {
					listeners = this._listeners;

					if (!(event in listeners)) {
						listeners[event] = [listener];
					}
					else {
						listeners = listeners[event];
						listeners.push(listener);
						if ((!listeners.warned) && (this.maxListeners !== 0) && (listeners.length > this.maxListeners)) {
							console.warn("Possible memory leak detected; more than " + this.maxListeners + " listeners added to EventEmitter. Use setMaxListeners to extend allowed listener count.");
							listeners.warned = true;
						}
					}

					this.emit("newListener", event, listener);

					return this;
				};
			})(),

			removeListener: (function () {
				var i, l;
				var removed, listeners;

				return function EventEmitter_removeListener(event, listener) {
					listeners = this._listeners;

					if (event in listeners) {
						listeners = listeners[event];

						for (i = 0, l = listeners.length; i < l; i++) {
							if (listeners[i] === listener) {
								removed = listeners.splice(i, 1)[0];
								this.emit("removeListener", event, removed);
							}
						}
					}

					return this;
				};
			})(),
			removeAllListeners: (function () {
				var current, listeners;
				var remove = function EventEmitter_removeAllListeners_remove(emitter, event) {
					listeners = emitter._listeners[event];

					if (EventEmitter.listenerCount(emitter, "removeListener") <= 0) {
						listeners.splice(0);
					}
					else {
						current = listeners.shift();
						while (current) {
							emitter.emit("removeListener", event, current);
							current = listeners.shift();
						}
					}
				};

				return function EventEmitter_removeAllListeners(event) {
					var listeners = this._listeners;

					if (event) {
						if (event in listeners) {
							remove(this, event);
						}
					}
					else {
						for (name in listeners) {
							if (listeners[name] instanceof Array) {
								remove(this, name);
							}
						}
					}

					return this;
				};
			})(),

			setMaxListeners: function EventEmitter_setMaxListeners(n) {
				if ((typeof (n) === "number") || (n instanceof Number)) {
					this.maxListeners = n;
				}

				return this;
			},
			listeners: function EventEmitter_listeners(event) {
				return this._listeners[event];
			},

			emit: (function () {
				var i, l;
				var listeners, args;
				var slice = Array.prototype.slice;

				return function EventEmitter_emit(event, event_arguments) {
					if (event in this._listeners) {
						listeners = this._listeners[event];

						if (listeners.length > 0) {
							args = slice.call(arguments, 1);
							for (i = 0, l = this._listeners[event].length; i < l; i++) {
								listeners[i].apply(null, args);
							}
							args = null;
						}
					}

					return this;
				};
			})(),
			once: (function () {
				var emitter;

				return function EventEmitter_once(event, listener) {
					emitter = this;

					function new_listener() {
						new_listener.listener.apply(this, arguments);
						emitter.removeListener(event, new_listener);
					}
					new_listener.listener = listener;

					this.addListener(event, new_listener);

					return this;
				};
			})()
		};

		// proxies
		prototype.on = prototype.addListener;

		// class methods
		EventEmitter.listenerCount = function listenerCount(emitter, event) {
			if (event in emitter._listeners) {
				return emitter._listeners[event].length;
			}
			else {
				return 0;
			}
		};

		return EventEmitter;
	})();
}