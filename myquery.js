/**
 * MyQuery
 *
 * A Compact jQuery-like Cross-Browser JavaScript Library
 *
 * Requirements:
 * -------------
 * IE6+
 * Firefox
 * Opera
 * Chrome
 * Safari
 * ...
 *
 * Features:
 * ---------
 * Cross-browser
 * Lazy loading
 * DOM selection and manipulation
 * Events
 * Ajax
 * Cookies
 * ...
 *
 * Todo:
 * -----
 * Animation
 * ...
 *
 * Reference:
 * ----------
 * MOZILLA DEVELOPER NETWORK
 *     https://developer.mozilla.org/en-US/
 * Lazy loading
 *     http://en.wikipedia.org/wiki/Lazy_loading
 * Selectors Level 4
 *     http://www.w3.org/TR/selectors4/
 * Comet
 *     http://en.wikipedia.org/wiki/Comet_(programming)
 * Ajax
 *     http://en.wikipedia.org/wiki/Ajax_(programming)
 * JSON
 *     http://en.wikipedia.org/wiki/JSON
 * jQuery
 *     http://jquery.com/
 * getElementsBySelector()
 *     http://simonwillison.net/2003/mar/25/getelementsbyselector/
 * ...
 *
 * sun2052@gmail.com
 * 2013-02-03T21:25:00UTC+08:00
 */
(function (window) {
	/**
	 * Enables strict mode.
	 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/Strict_mode
	 */
	"use strict";
	/**
	 * MyQuery(selector[, context]) : MyQuery
	 *     A wrapper of MyQuery.prototype.initialize(selector, context).
	 * MyQuery(callback) : MyQuery
	 *     A shortcut for MyQuery.ready(callback).
	 * MyQuery() : MyQuery
	 *     Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.
	 * 
	 * @param {String|Element|Array} selector
	 *     The selector, could be a DOM Element, a simple selector string, an array or array-like object of elements or a "<tagName>" string for creating.
	 * @param {String|Element|Array} context
	 *     The context, could be a DOM Element, a simple selector string, an array or array-like object of elements.
	 * @param {Function} callback
	 *     callback($)
	 *     
	 * @return {MyQuery}
	 *     The MyQuery with selected elements.
	 */
	var MyQuery = function (selector, context) {
			return new MyQuery.prototype.initialize(selector, context);
		},
		/**
		 * Maps over MyQuery and $ in case of overwrite.
		 */
		_MyQuery = window.MyQuery,
		_$ = window.$,
		/**
		 * Ensures the document refer to the correct object.
		 */
		document = window.document,
		/**
		 * Enable cache only if events DOMNodeInserted and DOMNodeRemoved are supported.
		 */
		isCacheEnabled = false,
		/**
		 * Attribute fix
		 */
		attributeFix = {
			tabindex: "tabIndex",
			readonly: "readOnly",
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder",
			contenteditable: "contentEditable"
		},
		/**
		 * Collection of utility functions using for selector parsing.
		 */
		isMatchedByAttributeSelector = {},
		isMatchedByPseudoSelector = {},
		/**
		 * each(collection, callback[, reverse])
		 * each(object, callback)
		 *     A generic iterator function, which can be used to seamlessly iterate over both objects and arrays.
		 * Arrays and array-like objects with a length property (such as a function's arguments object) are iterated by numeric index,
		 * from 0 to length-1. Other objects are iterated via their named properties.
		 *     We can break the $.each() loop at a particular iteration by making the callback function return false.
		 * Returning non-false is the same as a continue statement in a for loop; it will skip immediately to the next iteration.
		 *     The current value can also be accessed through the this keyword in the callback function,
		 * but JavaScript will always wrap the this value as an Object even if it is a simple string or number value.
		 *
		 * @param {Collection} collection
		 *     The array or array-like object to iterate over.
		 * @param {Function} callback(element, index, collection)
		 *     The function that will be executed on every element in the collection.
		 * @param {Boolean} reverse
		 *     Whether iteration is from the end or not when iterates over an array or array-like object.
		 * @param {Object} object
		 *     The object to iterate over.
		 * @param {Function} callback(value, property, object)
		 *     The function that will be executed on every object.
		 *     
		 * @return {Object}
		 *     The method returns its first argument, the object that was iterated.
		 */
		each = function (collection, callback, reverse) {
			var name = null,
				index = 0,
				length = collection.length,
				element = null;
			if (length === undefined) {
				for (name in collection) {
					if (hasOwnProperty(collection, name)) {
						element = collection[name];
						if (callback.call(element, element, name, collection) === false) {
							break;
						}
					}
				}
			} else {
				if (reverse) {
					for (index = length - 1; index >= 0; index--) {
						element = collection[index];
						if (callback.call(element, element, index, collection) === false) {
							break;
						}
					}
				} else {
					for (; index < length; index++) {
						element = collection[index];
						if (callback.call(element, element, index, collection) === false) {
							break;
						}
					}
				}
			}
			return collection;
		},
		/**
		 * Trims leading and trailing whitespaces of the specified string.
		 * 
		 * @param  {String}  text
		 * @return  {String}
		 */
		trimString = function (text) {
			if (String.prototype.trim) {
				trimString = function (text) {
					return text.trim();
				};
			} else {
				trimString = function (text) {
					return text.replace(/^\s+|\s+$/g, "");
				};
			}
			return trimString(text);
		},
		/**
		 * Gets space-separated argument string as an array.
		 * 
		 * @param  {String}  argument
		 * @return  {Array}
		 */
		splitArgumentString = function (argument) {
			return trimString(argument).split(/\s+/);
		},
		/**
		 * element.hasOwnProperty won't work in IE6/7/8
		 */
		hasOwnProperty = function (target, property) {
			return Object.prototype.hasOwnProperty.call(target, property);
		};
	/**
	 * Defines instance properties and methods.
	 */
	MyQuery.prototype = {
		/**
		 * The number of elements in the MyQuery object.
		 */
		length: 0,
		/**
		 * Previous MyQuery Object
		 */
		previousObject: null,
		/**
		 * Constructor
		 */
		constructor: MyQuery,
		/**
		 * constructor(selector[, context])
		 *     Core function used for selecting or creating elements and forming a MyQuery object.
		 * MyQuery(callback)
		 *      A shortcut for MyQuery.ready(callback).
		 *
		 * @param {String|Element|Array|MyQuery} selector
		 *     The selector, could be a DOM Element, a simple selector string, an array or array-like object of elements or a "<tagName>" string for creating.
		 * @param {Element|Array|MyQuery} context
		 *     The context, could be a DOM Element or an array or array-like object of elements.
		 * @param {Function} callback($){...}
		 *     The callback which will be executed as soon as the DOM is ready.
		 *
		 * @return {MyQuery}
		 *     The MyQuery with matched elements.
		 */
		initialize: function (selector, context) {
			var self = this;

			// Handle $(""), $(null), or $(undefined)
			if (!selector) {
				return this;
			}

			// Handle $(Element)
			if (selector.nodeType !== undefined) {
				this[0] = selector;
				this.length = 1;
				return this;
			}

			// Handle $("<tagName>") as a shortcut for create("tagName").
			if (typeof selector === "string" && /^<\w+>$/.test(selector)) {
				return this.pushStack(create(selector.substring(1, selector.length - 1)).childNodes);
			}
			
			// Handle $(selector, context) as a shortcut for find(selector, context).
			if (typeof selector === "string") {
				return this.pushStack(find(selector, context));
			}

			// Handle Array or Array-like object
			if (typeof selector.length === "number") {
				each(selector, function (element, index) {
					self[index] = element;
				});
				this.length = selector.length;
				return this;
			}

			// Handle $(function($)) as a shortcut for MyQuery.ready(function($)).
			if (typeof selector === "function") {
				MyQuery.ready(selector);
				return this;
			}
		},
		/**
		 * .get()
		 *     Retrieve the DOM elements matched by the MyQuery object as an array.
		 * .get(index)
		 *     Retrieve a specific the DOM element matched by the MyQuery object using an integer.
		 *
		 * @param {Integer} index
		 *     A zero-based integer indicating which element to retrieve.
		 *     Negative integer indicating the element counted from end.
		 *
		 *  @return {DOMElement|Array}
		 *     Return an array or a specific element of The current MyQuery object.
		 */
		get: function (index) {
			var result;
			if (index === undefined) {
				result = Array.prototype.slice.call(this, 0);
			} else if (index < 0) {
				result = this[this.length + index];
			} else {
				result = this[index];
			}
			return result;
		},
		/**
		 * .each(callback[, reverse])
		 *     Iterates over a MyQuery object, executing a function for each matched element.
		 *     
		 * @param {Function} callback(element, index, collection)
		 *     A function to be executed for each matched element. The loop could be terminated by making the callback function return false.
		 *     Returning non-false is the same as a continue statement in a for loop; it will skip immediately to the next iteration.
		 * @param {Boolean} reverse
		 *     Whether iteration is from the end or not when iterates over an array or array-like object.
		 *     
		 * @return {MyQuery}
		 *      The current MyQuery object.
		 */
		each: function (callback, reverse) {
			each(this, callback, reverse);
			return this;
		},
		/**
		 * .pushStack(elements)
		 *     Takes an array of elements and push it onto the stack, returning the new matched element set.
		 *     
		 * @param {Array|MyQuery} elements
		 *     The object containing properties and methods to be added to MyQuery object.
		 *     
		 * @return {Object}
		 *      The new MyQuery Object.
		 */
		pushStack: function (elements) {
			// Build a new jQuery matched element set
			var result = MyQuery(elements);
			// Add the old object onto the stack (as a reference)
			result.previousObject = this;
			// Return the newly-formed element set
			return result;
		},
		/**
		 * .filter(selector)
		 * .filter(handler)
		 *     Reduce the set of matched elements to those that match the selector or pass the function's test.
		 *     
		 * @param {String} selector
		 *     A string containing a selector expression to match the current set of elements against.
		 * @param {Function} handler(element, index)
		 *     A function used as a test for each element in the set. Pointer "this" points to the current DOM element.
		 *     
		 * @return {MyQuery}
		 *     Return a new MyQuery object with elements filtered.
		 */
		filter: function (filter) {
			var self = this, elements = [];
			if (typeof filter === "function") {
				this.each(function (element) {
					if (filter.call(element, index, element) === true) {
						elements.push(element);
					}
				});
			} else if (typeof filter === "string") {
				MyQuery(filter).each(function(element) {
					self.each(function(current) {
						if (current === element) {
							elements.push(current);
						}
					});
				});
			}
			return this.pushStack(elements);
		},
		/**
		 * .first()
		 * 		Reduce the set of matched elements to the first in the set.
		 * 
		 * @returns {MyQuery}
		 */
		first: function () {
			return this.slice(0, 1);
		},
		/**
		 * .last()
		 * 		Reduce the set of matched elements to the final one in the set.
		 * 
		 * @returns {MyQuery}
		 */
		last: function () {
			return this.slice(-1);
		},
		/**
		 * .slice(start[, end])
		 * 		Reduce the set of matched elements to a subset specified by a range of indices.
		 * 
		 * @param {Integer} start
		 * 		An integer indicating the 0-based position at which the elements begin to be selected. If negative, it indicates an offset from the end of the set.
		 * @param {Integer} end
		 * 		An integer indicating the 0-based position at which the elements stop being selected. If negative, it indicates an offset from the end of the set. If omitted, the range continues until the end of the set.
		 * 
		 * @returns {MyQuery}
		 */
		slice: function (start, end) {
			return this.pushStack(Array.prototype.slice.call(this, start, end));
		},
		/**
		 * .end()
		 * 		End the most recent filtering operation in the current chain and return the set of matched elements to its previous state.
		 * 
		 * @returns {MyQuery}
		 */
		end: function () {
			return this.previousObject || MyQuery();
		},
		/**
		 * .offsetParent([selector])
		 * 		Get the closest ancestor element that is positioned, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		offsetParent: function (selector) {
			var elements = [];
			this.each(function (element) {
				if (match(element.offsetParent, selector)) {
					elements.push(element.offsetParent);
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .parent([selector])
		 * 		Get the parent of each element in the current set of matched elements, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		parent: function (selector) {
			var elements = [], parent;
			this.each(function (element) {
				parent = element.parentNode;
				if (parent && match(parent, selector)) {
					elements.push(parent);
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .parents([selector])
		 * 		Get the ancestors of each element in the current set of matched elements, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		parents: function (selector) {
			var elements = [], parent;
			this.each(function (element) {
				while ((parent = element.parentNode) !== null) {
					if (match(parent, selector)) {
						elements.push(parent);
					}
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .children([selector])
		 * 		Get the children of each element in the set of matched elements, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		children: function (selector) {
			var elements = [];
			this.each(function (element) {
				each(element.childNodes, function (child) {
					if (child.nodeType === 1 && match(child, selector)) {  // Element Node
						elements.push(child);
					}
				});
			});
			return this.pushStack(elements);
		},
		/**
		 * .find(selector)
		 * 		Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns
		 */
		find: function (selector) {
			return find(selector, this);
		},
		/**
		 * .previous([selector])
		 * 		Get the immediately preceding sibling of each element in the set of matched elements, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		previous: function (selector) {
			var elements = [], previous;
			this.each(function (element) {
				previous = element.previousSibling;
				if (previous.nodeType === 1 && match(previous, selector)) {  // Element node
					elements.push(previous);
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .previousAll([selector])
		 * 		Get all preceding siblings of each element in the set of matched elements, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		previousAll: function (selector) {
			var elements = [], previous;
			this.each(function (element) {
				while ((previous = element.previousSibling) !== null) {
					if (previous.nodeType === 1 && match(previous, selector)) {  // Element node
						elements.push(previous);
					}
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .next([selector])
		 * 		Get the immediately following sibling of each element in the set of matched elements. If a selector is provided, it retrieves the next sibling only if it matches that selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		next: function (selector) {
			var elements = [], next;
			this.each(function (element) {
				next = element.nextSibling;
				if (next.nodeType === 1 && match(next, selector)) {  // Element node
					elements.push(next);
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .nextAll([selector])
		 * 		Get all following siblings of each element in the set of matched elements, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		nextAll: function (selector) {
			var elements = [], next;
			this.each(function (element) {
				while ((next = element.nextSibling) !== null) {
					if (next.nodeType === 1 && match(next, selector)) {  // Element node
						elements.push(next);
					}
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .siblings([selector])
		 * 		Get the siblings of each element in the set of matched elements, optionally filtered by a selector.
		 * 
		 * @param {String} selector
		 * 		A string containing a selector expression to match elements against.
		 * 
		 * @returns {MyQuery}
		 */
		siblings: function (selector) {
			var elements = [];
			this.each(function (element) {
				if (element.parentNode) {
					each(element.parentNode.childNodes, function (child) {
						if (child.nodeType === 1 && match(child, selector)) {  // Element node
							elements.push(child);
						}
					});
				}
			});
			return this.pushStack(elements);
		},
		/**
		 * .hasClass(className)
		 * 		Determine whether any of the matched elements are assigned the given class.
		 * 
		 * @param {String} className
		 * 		The class name to search for.
		 * 
		 * @returns {Boolean}
		 */
		hasClass: function (className) {
			var result = false;
			this.each(function (element) {
				if ((" " + element.className + " ").indexOf(" " + className + " ") !== -1) {
					result = true;
					return false;  // Break the loop.
				}
			});
			return result;
		},
		/**
		 * .addClass(className)
		 * 		Add the specified class(es) to each of the set of matched elements.
		 * 
		 * @param {String} className
		 * 		One or more space-separated classes to be added to the class attribute of each matched element.
		 * 
		 * @returns {MyQuery}
		 */
		addClass: function (className) {
			var classNames = splitArgumentString(className);
			this.each(function (element) {
				each(classNames, function (className) {
					if (!MyQuery(element).hasClass(className)) {
						if (element.className === "") {
							element.className = className;
						} else {
							element.className += " " + className;
						}
					}
				});
			});
			return this;
		},
		/**
		 * .removeClass([className])
		 * 		Remove the specified class(es) or all classes from each element in the set of matched elements.
		 * 
		 * @param {String} className
		 * 		One or more space-separated classes to be removed from the class attribute of each matched element.
		 * 
		 * @returns {MyQuery}
		 */
		removeClass: function (className) {
			var targets = className === undefined ? [/^.*$/] : splitArgumentString(className);
			this.each(function (element) {
				each(targets, function (target) {
					element.className = (element.className + " ").replace(target, "");
				});
			});
			return this;
		},
		/**
		 * .toggleClass(className)
		 * 		Add or remove one or more classes from each element in the set of matched elements, depending on the class's presence.
		 * 
		 * @param {String} className
		 * 		One or more class names (separated by spaces) to be toggled for each element in the matched set.
		 * 
		 * @returns {MyQuery}
		 */
		toggleClass: function (className) {
			var classNames = splitArgumentString(className);
			this.each(function (element) {
				each(classNames, function (className) {
					if (MyQuery(element).hasClass(className)) {
						MyQuery(element).removeClass(className);
					} else {
						MyQuery(element).addClass(className);
					}
				});
			});
			return this;
		},
		/**
		 * .clone(deep)
		 * 		Create a shallow or deep copy of the set of matched elements.
		 * 
		 * @param {Boolean} deep
		 * 
		 * @returns {MyQuery}
		 */
		clone: function (deep) {
			var elements = [];
			deep = deep === undefined ? false : true;
			this.each(function (element) {
				elements.push(element.cloneNode(deep));
			});
			return this.pushStack(elements);
		},
		/**
		 * .prepend(content)
		 * 		Insert content, specified by the parameter, to the beginning of each element in the set of matched elements.
		 * 
		 * @param {Element|MyQuery} content
		 * 		DOM element, array of elements, or MyQuery object to insert at the beginning of each element in the set of matched elements.
		 * 
		 * @returns {MyQuery}
		 */
		prepend: function (content) {
			var isFirst = true;
			content = MyQuery(content);
			this.each(function (target) {
				if (isFirst) {
					isFirst = false;
				} else {
					content = content.clone(true);
				}
				each(content, function (element) {
					target.parentNode.insertBefore(element, target);
				});
			});
			return this;
		},
		/**
		 * .append(content)
		 * 		Insert content, specified by the parameter, to the beginning of each element in the set of matched elements.
		 * 
		 * @param {String|Element|MyQuery} content
		 * 		DOM element, array of elements, HTML string, or jQuery object to insert at the beginning of each element in the set of matched elements.
		 * 
		 * @returns {MyQuery}
		 */
		append: function (content) {
			var isFirst = true;
			content = MyQuery(content);
			this.each(function (target) {
				if (isFirst) {
					isFirst = false;
				} else {
					content = content.clone(true);
				}
				each(content, function (element) {
					target.parentNode.appendChild(element);
				});
			});
			return this;
		},
		/**
		 * .prependTo(target)
		 *     Insert every element in the set of matched elements to the beginning of the target.
		 *
		 * @param {MyQuery} target
		 *     A MyQuery object.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object.
		 */
		prependTo: function (target) {
			var isFirst = true, self = this;
			each(MyQuery(target), function (target) {
				if (isFirst) {
					isFirst = false;
				} else {
					self = self.clone(true);
				}
				self.each(function (element) {
					target.parentNode.insertBefore(element, target.firstChild);
				}, true);
			});
			return this;
		},
		/**
		 * .appendTo(target)
		 *     Insert every element in the set of matched elements after the target.
		 *
		 * @param {MyQuery} target
		 *     A MyQuery object.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object.
		 */
		appendTo: function (target) {
			var isFirst = true, self = this;
			each(MyQuery(target), function (target) {
				if (isFirst) {
					isFirst = false;
				} else {
					self = self.clone(true);
				}
				self.each(function (element) {
					target.appendChild(element);
				});
			});
			return this;
		},
		/**
		 * .html()
		 *     Get the HTML contents of the first element in the set of matched elements.
		 * .html(htmlString)
		 *     Set the HTML contents of each element in the set of matched elements.
		 *
		 * @param {String} htmlString
		 *     A string of HTML to set as the content of each matched element.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object or the HTML string retrieved.
		 */
		html: function (htmlString) {
			if (htmlString === undefined) {
				return this.get(0).innerHTML;
			} else {
				this.each(function (element) {
					element.innerHTML = htmlString;
				});
			}
			return this;
		},
		/**
		 * .before(className)
		 * 		Add the specified class to each of the set of matched elements.
		 * @param {String} className
		 * 		The class to be added to the class attribute of each matched element.
		 * @returns {MyQuery}
		 */

		before: function (content) {},
		/**
		 * .after(className)
		 * 		Add the specified class to each of the set of matched elements.
		 * @param {String} className
		 * 		The class to be added to the class attribute of each matched element.
		 * @returns {MyQuery}
		 */
		after: function (content) {},
		/**
		 * .insertBefore(target)
		 *     Insert every element in the set of matched elements before the target.
		 *
		 * @param {MyQuery} target
		 *     A MyQuery object.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object.
		 */
		insertBefore: function (target) {
			var self = this, current;
			target.each(function (element) {
				current = element;
				self.each(function (element) {
					current.parentNode.insertBefore(element, current);
				});
			});
			return this;
		},
		/**
		 * .insertAfter(target)
		 *     Insert every element in the set of matched elements after the target.
		 *
		 * @param {MyQuery} target
		 *     A MyQuery object.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object.
		 */
		insertAfter: function (target) {
			var self = this, current;
			target.each(function (element) {
				current = element;
				self.each(function (element) {
					current.parentNode.insertBefore(element, current.nextSibling);
				});
			});
			return this;
		},
		/**
		 * .empty([selector])
		 * 		Remove all child nodes of the set of matched elements from the DOM.
		 * 
		 * @param {String} selector
		 * 		A selector expression that filters the set of matched elements to be removed.
		 * 
		 * @returns {MyQuery}
		 */
		empty: function (selector) {
			this.each(function (element) {
				while (element.firstChild) {
					if (!selector || match(element, selector)) {
						element.removeChild(element.firstChild);
					}
				}
			});
			return this;
		},
		/**
		 * .remove([selector])
		 * 		Remove the set of matched elements from the DOM.
		 * 
		 * @param {String} selector
		 * 		A selector expression that filters the set of matched elements to be removed.
		 * 
		 * @returns {MyQuery}
		 */
		remove: function (selector) {
			this.each(function (element) {
				if (!selector || match(element, selector)) {
					element.parentNode.removeChild(element);
				}
			});
			return this.pushStack();
		},
		/**
		 * .replace(className)
		 * 		Add the specified class to each of the set of matched elements.
		 * 
		 * @param {String} className
		 * 		The class to be added to the class attribute of each matched element.
		 * 
		 * @returns {MyQuery}
		 */

		replace: function (target) {},
		/**
		 * .replaceWith(target)
		 *     Replace each element in the set of matched elements with the provided new content.
		 *
		 * @param {MyQuery} target
		 *     A MyQuery object.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object.
		 */
		replaceWith: function (content) {},

		/**
		 * .attribute(name)
		 *     Get the value of an attribute for the first element in the set of matched elements.
		 * .attribute(name, value)
		 *     Set one attribute for the set of matched elements.
		 * .attribute(map)
		 *     Set several attributes for the set of matched elements.
		 *
		 * @param {String} name
		 *     The name of the attribute to set.
		 * @param {Mixed} value
		 *     A value to set for the attribute.
		 * @param {Object} map
		 *     A map of attribute-value pairs to set.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object or the value retrieved.
		 */
		attribute: function (args) {
			var name, value, map;
			if (typeof arguments[0] === "string") {
				name = attributeFix[arguments[0]] || arguments[0];
				if (arguments.length === 1) {
					return this.get(0)[name];
				} else {
					value = arguments[1];
					this.get(0)[name] = value;
				}
			} else {
				map = arguments[0];
				this.each(function (element) {
					current = element;
					MyQuery.each(map, function (value, name) {
						current[name] = value;
					});
				});
			}
			return this;
		},
		/**
		 * .removeAttribute(name)
		 *     Remove an attribute from each element in the set of matched elements.
		 *
		 * @param {String} name
		 *     The name of the attribute to remove.
		 *
		 * @return {MyQuery}
		 *     The current MyQuery object.
		 */
		removeAttribute: function (name) {
			name = attributeFix[name] || name;
			this.each(function (element) {
				if (element[name] !== undefined) {
					delete element[name];
				}
			});
			return this;
		},
		/**
		 * .property(className)
		 * 		Add the specified class to each of the set of matched elements.
		 * @param {String} className
		 * 		The class to be added to the class attribute of each matched element.
		 * @returns {MyQuery}
		 */
		property: function (property) {
			this.each(function (element) {
			});
			return this;
		},
		/**
		 * .removeProperty(className)
		 * 		Add the specified class to each of the set of matched elements.
		 * @param {String} className
		 * 		The class to be added to the class attribute of each matched element.
		 * @returns {MyQuery}
		 */
		removeProperty: function (property) {
			this.each(function (element) {
				delete element[property];
			});
			return this;
		},
		/**
		 * .value([value])
		 * 		Get the current value of the first element in the set of matched elements or set the value of every matched element.
		 * @param {String|Array} value
		 * 		A string of text or an array of strings corresponding to the value of each matched element to set as selected/checked.
		 * @returns {MyQuery|String|Array}
		 */
		value: function (value) {
			if (value === undefined) {  // Retrieve results as string or array

			} else if (typeof value === "string") {  // String

			} else if (value.length !== undefined) {  // Array

			} else {  // Number

			}
		},
		/**
		 * .style(propertyName) : String
		 * .style(propertyName, value) : MyQuery
		 * .style(properties) : MyQuery
		 * 		Get the value of a style property for the first element in the set of matched elements or set one or more CSS properties for every matched element.
		 * 
		 * @param {String} propertyName
		 * 		A CSS property.
		 * @param {String|Number} value
		 * 		A value to set for the property.
		 * @param {Object} properties
		 * 		An object of property-value pairs to set.
		 * 
		 * @returns {MyQuery|String}
		 */
		style: function (property, value) {
			if (typeof property === "string") {
				if (value === undefined) {
					if (document.defaultView && document.defaultView.getComputedStyle) {
						return document.defaultView.getComputedStyle(this[0], null)[property];
					} else {
						return this[0].currentStyle[property];
					}
				} else {
					this.each(function (element) {
						element.style[property] = value;
					});
				}
			} else {
				this.each(function (element) {
					each(property, function (rule, property) {
						element.style[property] = rule;
					});
				});
			}
			return this;
		},
		/**
		 * .dimension([type])
		 * 		Get the current computed dimension for the first element in the set of matched elements or set the dimension of every matched element.
		 * 
		 * @param {String} type
		 * 		"content", "client", "offset", "scroll"
		 * @param {Object} options
		 * 		{width: xx, height: xx}
		 * 
		 * @returns {Object|MyQuery}
		 */
		dimension: function (type, options) {
			var target = (type === "content" && options === undefined) ? this.first() : this[0];
			type = type || "content";
			switch (type) {
				case "content":  // content, read and write
					if (options === undefined) {
						return {
							width: parseInt(target.style("width")),
							height: parseInt(target.style("height"))
						};
					} else {
						this.each(function (element) {
							if (options.width !== undefined) {
								element.style.width = options.width + "px";
							}
							if (options.height !== undefined) {
								element.style.height = options.height + "px";
							}
						});
						return this;
					}
					break;
				case "client":  // content + padding, read only
					return {
						width: target.clientWidth,
						height: target.clientHeight
					};
					break;
				case "offset":  // content + padding + scrollbar (if visible) + border, read only
					return {
						width: target.offsetWidth,
						height: target.offsetHeight
					};
					break;
				case "scroll":  // The total dimensions of the content if there were no scrollbars present, read only
					return {
						width: target.scrollWidth,
						height: target.scrollHeight
					};
					break;
				default:
					throw new SyntaxError("Invalid argument for .dimension(type[, options]).");
					break;
			}
		},
		/**
		 * .position([type])
		 * 		Get the current coordinates of the first element, or set the coordinates of every element, in the set of matched elements, relative to the document.
		 * 
		 * @param {String} type
		 * 		"offset", "scroll"
		 * 
		 * @returns {Object}
		 */
		position: function (type, options) {
			var target = this[0];
			switch (type) {
				case "offset":  // The number of pixels between the element’s outside left/top border and the containing element’s inside left/top border. read only
					return {
						left: target.offsetLeft,
						top: target.offsetTop
					};
					break;
				case "scroll":  // The number of pixels that are hidden to the left/top of the content area. read and write
					if (options === undefined) {
						return {
							left: target.scrollLeft,
							top: target.scrollTop
						};
					} else {
						this.each(function (element) {
							if (options.left !== undefined) {
								element.scrollLeft = options.left + "px";
							}
							if (options.top !== undefined) {
								element.scrollTop = options.top + "px";
							}
						});
						return this;
					}
					break;
				default:
					throw new SyntaxError("Invalid argument for .position(type[, options]).");
					break;
			}
		},
		/**
		 * .hide(options)
		 * 		Hide the matched elements.
		 * 
		 * @param {String|Number} duration
		 * 		"fast", "medium", "slow", number of milliseconds
		 * @param {String} transition
		 * 		"fadeIn", "fadeOut", "slideUp", "slideRight", "slideDown", "slideLeft"
		 * 
		 * @returns {MyQuery}
		 */
		hide: function (duration, transition) {},
		/**
		 * .show(options)
		 * 		Display the matched elements.
		 * 
		 * @param {String|Number} duration
		 * 		"fast", "medium", "slow", number of milliseconds
		 * @param {String} transition
		 * 		"fadeIn", "fadeOut", "slideUp", "slideRight", "slideDown", "slideLeft"
		 * 
		 * @returns {MyQuery}
		 */
		show: function (duration, transition) {},
		/**
		 * .toggle(options)
		 * 		Display or hide the matched elements.
		 * 
		 * @param {String|Number} duration
		 * 		"fast", "medium", "slow", number of milliseconds
		 * @param {String} transition
		 * 		"fadeIn", "fadeOut", "slideUp", "slideRight", "slideDown", "slideLeft"
		 * 
		 * @returns {MyQuery}
		 */
		toggle: function (duration, transition) {},
		/**
		 * .animate(options)
		 * 		Perform a custom animation of a set of CSS properties.
		 * 
		 * @param {Object} options
		 * 		{
		 * 			delay: 10,		// Time between frames (in ms, 1/1000 of second). For example, 10ms
		 * 			duration: 1000,	// The full time the animation should take, in ms. For example, 1000ms
		 * 			delta: delta,	// A function, which returns the current animation progress.
		 * 			step: step		// The function, which actually does the job. It takes the result of delta and applies it.
		 * 		}
		 * 
		 * @returns {MyQuery}
		 */
		animate: function (options) {
			var _options = {
					delay: 10,
					duration: 1000,
					delta: function (progress) {},
					step: function (delta) {}
				},
				start = new Date(),
				id = null;

			for (property in options) {
				if (hasOwnProperty(_options, property)) {
					_options[property] = options[property];
				}
			}
			
			id = setInterval(function() {
				var progress = (new Date() - start) / _options.duration;

				if (progress > 1) {
					progress = 1;
				}

				_options.step(_options.delta(progress));

				if (progress === 1) {
					clearInterval(id);
				}
			}, _options.delay);
		},
		/**
		 * .stop(options)
		 * 		Stop the currently-running animation on the matched elements.
		 * 
		 * @param {Object} options
		 * 
		 * @returns {MyQuery}
		 */
		stop: function (options) {},
		/**
		 * .bind(eventType, handler)
		 *     Attach an event handler function for one or more events to the selected elements.
		 *     
		 * @param {String} eventType
		 *     One or more space-separated event types.
		 * @param {Function} handler(event)
		 *     The function to be executed each time the event is triggered.
		 *     
		 * @returns {MyQuery}
		 */
		bind: function (eventType, handler) {
			var eventTypes = splitArgumentString(eventType);
			this.each(function (element) {
				each(eventTypes, function (eventType) {
					var handlers, isFound;
					if (element.addEventListener) {
						element.addEventListener(eventType, handler, false);
					} else {
						// Create a hash table of event types for the element.
						if (!element.events) {
							element.events = {};
						}
						// Create a hash table of event handlers for each element/event pair.
						handlers = element.events[eventType];
						if (!handlers) {
							handlers = element.events[eventType] = [];
							// Store the existing event handler if there is one.
							if (element["on" + eventType]) {
								handlers[0] = element["on" + eventType];
							}
						}
						isFound = false;
						// Check whether this handler is attached to the element already.
						each(handlers, function (element) {
							if (element === handler) {
								isFound = true;
								return false;
							}
						});
						if (!isFound) {
							// Store the event handler in the hash table.
							handlers.push(handler);
						}
						// Assign a global event handler to do all the work
						element["on" + eventType] = function (event) {
							var returnValue = true, event = window.event, fixedEvent = null;
							// Create a writable copy of the event object and normalize some properties and methods
							fixedEvent = {
								target: (event.srcElement || document),
								currentTarget: this,
								immediatePropagationStopped: false,
								preventDefault: function () {
									event.returnValue = false;
								},
								stopPropagation: function () {
									event.cancelBubble = true;
								},
								stopImmediatePropagation: function () {
									this.immediatePropagationStopped = true;
								}
							};
							// Copy all original properties and methods to the new one
							each(event, function (value, property) {
								fixedEvent[property] = value;
							});
							each(this.events[fixedEvent.type], function (element) {
								if (element.call(fixedEvent.currentTarget, fixedEvent) === false) {
									returnValue = false;
								}
								if (fixedEvent.immediatePropagationStopped === true) {
									return false;
								}
							});
							return returnValue;
						};
					}
				});
			});
			return this;
		},
		/**
		 * .unbind(eventType, handler)
		 *     Remove a previously-attached event handler from the elements.
		 *     
		 * @param {String} eventType
		 *     One or more space-separated event types
		 * @param {Function} handler(event)
		 *     The function to be removed.
		 *     
		 * @returns {MyQuery}
		 */
		unbind: function (eventType, handler) {
			var eventTypes = splitArgumentString(eventType);
			this.each(function (element) {
				each(eventTypes, function (eventType) {
					var handlers = null, position = 0;
					if (element.removeEventListener) {  // Standard
						element.removeEventListener(eventType, handler, false);
					} else {  // IE
						handlers = element.events[eventType];
						if (element.events && handlers) {
							each(handlers, function (element, index) {
								if (element === handler) {
									position = index;
									return false;
								}
							});
							handlers.splice(position, 1);
						}
					}
				});
			});
			return this;
		},
		/**
		 * .trigger(eventType)
		 *     Execute all handlers and behaviors attached to the matched elements for the given event type.
		 *     
		 * @param {String} eventType
		 *     One or more space-separated event types.
		 *     
		 * @returns {MyQuery}
		 */
		trigger: function (eventType) {
			var eventTypes = splitArgumentString(eventType);
			this.each(function (element) {
				each(eventTypes, function (eventType) {
					var event;
					if (document.createEvent) {  // Standard DOM Level 2
						event = document.createEvent("HTMLEvents");
						event.initEvent(eventType, true, true);
						element.dispatchEvent(event);
					} else {  // IE
						event = document.createEventObject();
						element.fireEvent("on" + eventType, event);
					}
				});
			});
			return this;
		}
	};
	/**
	 * Give the constructor function the MyQuery prototype for later instantiation.
	 */
	MyQuery.prototype.initialize.prototype = MyQuery.prototype;
	/**
	 * MyQuery.extend(target)
	 * MyQuery.extend(target, object1, ..., objectN)
	 *     Merge the contents of two or more objects together into the first object.
	 *
	 * @param {Object} target
	 *     An object that will receive the new properties if additional objects are passed in or that will extend the jQuery namespace if it is the sole argument.
	 * @param {Object} object1
	 *     An object containing additional properties to merge in.
	 * @param {Object} objectN
	 *     Additional objects containing properties to merge in.
	 *
	 * @return {Object}
	 *     The target object.
	 */
	MyQuery.extend = function () {
		var length = arguments.length,
			target = MyQuery,
			index,
			extend = function (target, source) {
				var property = null;
				for (property in source) {
					if (hasOwnProperty(source, property)) {
						target[property] = source[property];
					}
				}
			};
		if (length === 1) {
			extend(target, arguments[0]);
		} else {
			target = arguments[0];
			for (index = 0; index < length; index++) {
				extend(target, arguments[index]);
			}
		}
		return target;
	};
	/**
	 * Extending MyQuery object by adding some static properties and methods.
	 */
	MyQuery.extend({
		/**
		 * Static property indicating whether DOM is ready.
		 */
		isReady: false,
		/**
		 * List of functions to be executed after DOM is ready.
		 */
		readyList: [],
		/**
		 * Version
		 */
		version: "1.0",
		/**
		 * MyQuery.noConflict()
		 * 		Relinquish MyQuery's control of the MyQuery and $ variable.
		 * @returns {MyQuery}
		 */
		noConflict: function () {
			window.MyQuery = _MyQuery;
			window.$ = _$;
			return MyQuery;
		},
		/**
		 * MyQuery.ready(callback)
		 *     Specify a function to execute when the DOM is fully loaded.
		 *
		 * @param {Function} callback($)
		 *     The function to be executed after the DOM is ready.
		 */
		each: function (collection, callback, reverse) {
			return each(collection, callback, reverse);
		},
		/**
		 * MyQuery.ready(callback)
		 *     Specify a function to execute when the DOM is fully loaded.
		 *
		 * @param {Function} callback($)
		 *     The function to be executed after the DOM is ready.
		 */
		ready: function (callback) {
			// Handler
			var readyHandler = function () {
				if (!MyQuery.isReady) {
					MyQuery.isReady = true;
					MyQuery.ready = function (callback) {
						return callback(MyQuery);
					};
					each(MyQuery.readyList, function (callback) {
						callback(MyQuery);
					});
					MyQuery.readyList = [];  // Clear the ready list
				}
			};
			// Catch cases where MyQuery.ready() is called after the browser event has already occurred.
			if (document.readyState === "complete") {
				readyHandler();
			} else {
				if (document.addEventListener) {  // Standards-based browsers support DOMContentLoaded
					// Use the handy event callback
					document.addEventListener("DOMContentLoaded", readyHandler, false);
					// A fallback to window.onload, that will always work
					window.addEventListener("load", readyHandler, false);
				} else if (document.attachEvent) {  // If IE event model is used
					// IE, the document is inside a frame
					document.attachEvent("onreadystatechange", function () {
						if (document.readyState === "complete") {
							readyHandler();
						}
					});
					// A fallback to window.onload, that will always work
					window.attachEvent("onload", readyHandler);
					// If IE and not a frame
					// continually check to see if the document is ready
					var top = false;
					try {
						top = window.frameElement == null && document.documentElement;
					} catch(e) {
						// ignore
					}
					if (top && top.doScroll) {
						(function doScrollCheck() {
							if (!MyQuery.isReady) {
								try {
									// Use the trick by Diego Perini
									// http://javascript.nwbox.com/IEContentLoaded/
									top.doScroll("left");
								} catch(e) {
									return setTimeout(doScrollCheck, 10);
								}
								// detach all dom ready events and execute any waiting functions
								readyHandler();
							}
						})();
					}
				}
				MyQuery.ready = function (callback) {
					MyQuery.readyList.push(callback);
				};
				return MyQuery.ready(callback);
			}
		},
		/**
		 * MyQuery.serialize(form)
		 *     Encode a set of form elements as a string for submission.
		 *
		 * @param {Element|MyQuery} form
		 * @param {Boolean} array
		 * 
		 * @return {String|Array}
		 *     The text string in standard URL-encoded notation.
		 */
		serialize: function (form, array) {
			var parts = [],
				optValue;
			each(form.elements, function (element) {
				switch (element.type) {
				case "select-one":
				case "select-multiple":
					if (element.name.length) {
						each(element.options, function (option) {
							if (option.selected) {
								optValue = "";
								if (option.hasAttribute) {
									optValue = (option.hasAttribute("value") ? option.value : option.text);
								} else {
									optValue = (option.attributes["value"].specified ? option.value : option.text);
								}
								parts.push(encodeURIComponent(element.name) + "=" + encodeURIComponent(optValue));
							}
						});
					}
					break;
				case undefined: //fieldset
				case "file": //file input
				case "submit": //submit button
				case "reset": //reset button
				case "button": //custom button
					break;
				case "radio": //radio button
				case "checkbox": //checkbox
					if (!element.checked) {
						break;
					}
					/* falls through */
				default:
					//don't include form fields without names
					if (element.name.length) {
						parts.push(encodeURIComponent(element.name) + "=" + encodeURIComponent(element.value));
					}
				}
			});
			return array ? parts : parts.join("&");
		},
		/**
		 * MyQuery.createXHR()
		 *     Create a XMLHttpRequest object used for performing an asynchronous HTTP (Ajax) request.
		 *
		 * @return {Object}
		 *     A XMLHttpRequest object.
		 */
		createXHR: function () {
			var activeXString = null, func = MyQuery.createXHR;
			if (window.XMLHttpRequest !== undefined) {
				func = function () {
					return new window.XMLHttpRequest();
				};
			} else if (window.ActiveXObject !== undefined) {
				each(["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"], function (version) {
					try {
						new window.ActiveXObject(version);
						activeXString = version;
						return false;  // Break current each
					} catch (e) {
						// ignore
					}
				});
				func = function () {
					return new window.ActiveXObject(activeXString);
				};
			} else {
				func = function () {
					throw new Error("No XMLHttpRequest object available.");
				};
			}
			return func();
		},
		/**
		 * MyQuery.ajax(options)
		 *     Perform an asynchronous HTTP (Ajax) request.
		 *
		 * @param {Object} options
		 *     A set of key/value pairs that configure the Ajax request.
		 */
		ajax: function (options) {
			var _options = {
					method: "POST",
					form: null,
					url: "",
					params: [],
					timeout: 30000, // time in milliseconds
					onSending: function () {}, // xhr.readyState === 1
					onSent: function () {}, // xhr.readyState === 2
					onReceiving: function () {}, // xhr.readyState === 3
					onComplete: function () {}, // xhr.readyState === 4
					// xhr.readyState === 4 && ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
					onSuccess: function (xhr) {
						window.alert("Ajax request succeded!");
					},
					onFailure: function (xhr) {
						window.alert("Ajax request failed!");
					},
					onTimeout: function () {
						window.alert("Ajax request timed out!");
					}
				},
				xhr = null,
				timeoutId = null,
				isAborted = false;

			// initializing properties
			each(options, function (value, property) {
				if (hasOwnProperty(_options, property)) {
					_options[property] = value;
				}
			});
			xhr = MyQuery.createXHR();
			if (_options.form) {
				_options.params.push(MyQuery.serialize(_options.form, true));
			}
			// prevent from caching
			_options.params.push("rand" + "=" + (new Date()).getTime());
			xhr.onreadystatechange = function() {
				switch (xhr.readyState) {
					case 1:
						_options.onSending();
						break;
					case 2:
						_options.onSent();
						break;
					case 3:
						_options.onReceiving();
						break;
					case 4:
						// xhr.abort() will cause xhr.readyState changed to 4 in IE8
						// an error occurs if you try to access the status property after a timeout has occurred in IE8
						if (isAborted === true) {
							if (xhr.timeout === undefined) {
								window.clearTimeout(timeoutId);
							}
							if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
								_options.onSuccess(xhr);
							} else {
								_options.onFailure(xhr);
							}
						} else {
							_options.onComplete();
						}
						break;
				}
			};
			if (_options.method === "GET") {
				xhr.open(_options.method, _options.url + "?" + encodeURIComponuent(_options.params.join("&")), true);
			} else {
				xhr.open(_options.method, _options.url, true);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			if (xhr.timeout !== undefined) {
				xhr.timeout = _options.timeout;
				xhr.ontimeout = function() {
					isAborted = true;
					_options.onTimeout();
				};
			} else {
				timeoutId = window.setTimeout(function () {
					isAborted = true;
					xhr.abort();
					_options.onTimeout();
				}, _options.timeout);
			}
			xhr.send(encodeURIComponuent(_options.params.join("&")));
		},
		/**
		 * MyQuery.parseJSON(JSONString)
		 *     Takes a well-formed JSON string and returns the resulting JavaScript object.
		 *     
		 * @param {String} JSONString
		 * 		The JSON string to parse.
		 * 
		 * @returns {Object}
		 */
		parseJSON: function (JSONString) {
			var rvalidchars = /^[\],:{}\s]*$/,
				rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
				rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
				rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
				func = MyQuery.parseJSON;

			// Attempt to parse using the native JSON parser first
			if (window.JSON && window.JSON.parse) {
				func = function (JSONString) {
					return window.JSON.parse(JSONString);
				};
				return func(JSONString);
			}

			if (typeof JSONString === "string") {
				// Make sure leading/trailing whitespace is removed (IE can't handle it)
				JSONString = trimString(JSONString);
				if (JSONString) {
					// Make sure the incoming data is actual JSON
					// Logic borrowed from http://json.org/json2.js
					if (rvalidchars.test(JSONString.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
						return (new Function("return " + JSONString))();
					}
				}
			}
			throw new Error("Invalid JSON: " + data);
		},
		/**
		 * MyQuery.toJSONString(collection)
		 *     Produces a JSON text from a JavaScript object or array-like object.
		 *     
		 * @param {Object|Array} collection
		 * 		The Object or Array to stringify.
		 * 
		 * @returns {String}
		 */
		toJSONString: function (collection) {
			if (window.JSON && window.JSON.stringify) {
				return function (collection) {

				};
			} else {
				return function (collection) {

				};
			}
			return MyQuery.toJSONString(collection);
		},
		/**
		 * MyQuery.cookie(name)
		 * MyQuery.cookie(name, value[, expires[, path[, domain[, secure]]]])
		 *     Retrieve the value of a cookie with the given name or set a cookie on the page and accepts several arguments: the name
		 * of the cookie, the value of the cookie, an optional  Date object indicating when the cookie should be
		 * deleted, an optional URL path for the cookie, an optional domain for the cookie, and an optional
		 * Boolean value indicating if the secure fl  ag should be added.
		 *
		 * @param {String} name
		 *     The name of the cookie.
		 * @param {String} value
		 *     The value of the cookie.
		 * @param {Date} expires
		 *     A Date object indicating when the cookie should be deleted.
		 * @param {String} path
		 *     A URL path for the cookie.
		 * @param {String} domain
		 *     A domain for the cookie.
		 * @param {Boolean} secure
		 *     A Boolean value indicating if the secure flag should be added.
		 * @return {String|MyQuery}
		 */
		cookie: function (name, value, expires, path, domain, secure) {
			var cookieName, cookieStart, cookieValue, cookieEnd, cookieText;
			if (value === undefined) {
				cookieName = encodeURIComponent(name) + "=";
				cookieStart = document.cookie.indexOf(cookieName);
				cookieValue = null;
				if (cookieStart > -1) {
					cookieEnd = document.cookie.indexOf(";", cookieStart);
					if (cookieEnd === -1) {
						cookieEnd = document.cookie.length;
					}
					cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
				}
				return cookieValue;
			} else {
				cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
				if (expires instanceof Date) {
					cookieText += "; expires=" + expires.toGMTString();
				}
				if (path) {
					cookieText += "; path=" + path;
				}
				if (domain) {
					cookieText += "; domain=" + domain;
				}
				if (secure) {
					cookieText += "; secure";
				}
				document.cookie = cookieText;
				return cookieText;
			}
		},
		/**
		 * MyQuery.removeCookie(name[, path[, domain[, secure]]])
		 *     Remove a specific cookie.
		 *
		 * @param {String} name
		 *     The name of the cookie.
		 * @param {String} path
		 *     A URL path for the cookie.
		 * @param {String} domain
		 *     A domain for the cookie.
		 * @param {Boolean} secure
		 *     A Boolean value indicating the secure flag.
		 */
		removeCookie: function (name, path, domain, secure) {
			MyQuery.cookie(name, "", new Date(0), path, domain, secure);
		},
		/**
		 * MyQuery.isEmpty(target)
		 *     Test whether the target object is a empty MyQuery object.
		 *
		 * @param {Object} target
		 *     The target you want to test.
		 */
		isEmpty: function (target) {
			if ((target instanceof MyQuery) && target.length > 0) {
				return false;
			} else {
				return true;
			}
		},
		/**
		 * MyQuery.create(selector)
		 * 		Create a document fragment containing the node hierarchy of specified selector.
		 * 
		 * @param {Selector} selector
		 * 
		 * @return {DocumentFragment}
		 */
		create: function (selector) {
			return create(selector);
		},
		/**
		 * MyQuery.match(element, selector[, context])
		 *     Determine whether an element matches a specified selector in a specific context.
		 *     
		 * @param {Element} element
		 * @param {String} selector
		 * @param {Element|String|Array} context
		 * 
		 * @return {Boolean}
		 */
		match: function (element, selector, context) {
			return match(element, selector, context);
		}
	});
	/*
	 * Expose MyQuery to the global object.
	 */
	window.$ = window.MyQuery = MyQuery;


	/*
	 * Selector Engine
	 */

	/**
	 * Converts an array-like object to an array.
	 *
	 * @param {Object|NodeList} collection
	 * @return {Array}
	 */
	function convertToArray(collection) {
		var array = null;
		try {
			array = Array.prototype.slice.call(collection, 0); // non-IE and IE9+
		} catch (e) {
			array = [];
			each(collection, function(element) {
				array.push(element);
			});
		}
		return array;
	}
	/**
	 * Parses the specified comma-separated selector.
	 *
	 * @param {String} selector
	 * @returns {Array}
	 */
	function parseSelector(selector) {
		var strings = [], selectors = [], parsedSelectors = [];

		// Saves all the quoted strings and removes all the backslashes in all escaped characters.
		// Eliminates the need of dealing with special characters which may possibly appear in the quoted strings.
		selectors = selector.replace(/'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"/g, function(match, offset, string) {
			strings.push(match.replace(/\\(.)/g, "$1"));
			return "\0";  // Replaces the quoted string with a character '\0' as a mark of position.
		}).replace(/\s*([\s>+~(),]|^|$)\s*/g, "$1")  // Trims all the redundant whitespaces. (e.g. " body > div ~ p a " --> "body>div~p a")
		.replace(/([\s>+~,]|[^(]\+|^)([\[#.:])/g, "$1*$2")  // Adds implied universal selector "*". (e.g. ".class" --> "*.class")
		.split(",");  // Splits the selector group into an array of selectors.

		each(selectors, function (selector) {
			var parsedSelector = {
					combinators: selector.match(/[ >+~](?![=\d])/g) || [],  // [ >+~] except ~= and an+b
					compoundSelectors: []
				};

			each(selector.split(/[ >+~](?![=\d])/), function (compoundSelector) {
				parsedSelector.compoundSelectors.push(parseCompoundSelector(compoundSelector, strings));
			});

			parsedSelectors.push(parsedSelector);
		});

		return parsedSelectors;
	}
	/**
	 * Parses the specified compound selector.
	 *
	 * @param {String} compoundSelector
	 * @param {Array} strings
	 * @return {Object}
	 */
	function parseCompoundSelector(compoundSelector, strings) {
		var simpleSelectors = compoundSelector.replace(/([\[:.#])/g, "\n$1").split("\n"),
			typeSelector = simpleSelectors.shift(),
			idSelector = "",
			attributeSelectors = [],
			pseudoSelectors = [];

		each(simpleSelectors, function(simpleSelector) {
			var attribute, pseudo;

			// Replaces all the placeholder character "\0" with the original quoted string.
			if (simpleSelector.indexOf("\0") !== -1) {
				simpleSelector = simpleSelector.replace("\0", strings.pop());
			}

			switch (simpleSelector.charAt(0)) {
				case "[":  // attribute selector
					attribute = simpleSelector.match(/^\[(-?[a-zA-Z_][\w-]*)(?:([~^$*|]?=)['"](.*)['"])?\]$/);
					attributeSelectors.push({
						attribute: attribute[1], // attribute[0] is the simple selector
						operator: attribute[2] || "",
						value: attribute[3]
					});
					break;
				case ":":  // pseudo selector
					pseudo = simpleSelector.match(/^:([\w_-]+)(?:\(((?:\d*n(?:[+-]\d+)?)|(?:[a-zA-Z]+))\))?$/);
					pseudoSelectors.push({
						name: pseudo[1], // pseudo[0] is the full simple selector
						parameter: pseudo[2]
					});
					break;
				case ".":  // class selector
					attributeSelectors.push({
						attribute: "className",
						operator: "~=",
						value: simpleSelector.substring(1)
					});
					break;
				case "#":  // id selector, only one
					idSelector = simpleSelector.substring(1);
					break;
			}
		});

		return {
			typeSelector: typeSelector,
			idSelector: idSelector,
			attributeSelectors: attributeSelectors,
			pseudoSelectors: pseudoSelectors
		};
	}
	/**
	 * Collection of utility functions used for attribute selector matching.
	 */
	isMatchedByAttributeSelector = {
		"": function(element, attribute) {
			return element[attribute] !== null;
		},
		"=": function(element, attribute, value) {
			return element[attribute] === value;
		},
		"~=": function(element, attribute, value) {
			return (" " + element[attribute] + " ").indexOf(" " + value + " ") !== -1;
		},
		"^=": function(element, attribute, value) {
			var attributeValue = element[attribute];
			return attributeValue !== null && attributeValue.indexOf(value) === 0;
		},
		"$=": function(element, attribute, value) {
			var attributeValue = element[attribute];
			return attributeValue !== null && attributeValue.substring(attributeValue.length - value.length) === value;
		},
		"*=": function(element, attribute, value) {
			var attributeValue = element[attribute];
			return attributeValue !== null && attributeValue.indexOf(value) !== -1;
		},
		"|=": function(element, attribute, value) {
			var attributeValue = element[attribute];
			return attributeValue !== null && (attributeValue === value || attributeValue.indexOf(value + "-") === 0);
		}
	};
	/**
	 * Determine whether a specified element is n-th child of its parent node.
	 *
	 * @param {Element} element
	 * @param {String} parameter
	 * @param {Boolean} reverse
	 * @param {String} tagName
	 */
	function isNthChild(element, parameter, reverse, tagName) {
		var parameters, a, b,
			counter = 1,  // Marks the position of the current element in the element child node of the parent node, counting from 1.
			current = element;

		if (parameter === "odd") {
			parameter = "2n+1";
		} else if (parameter === "even") {
			parameter = "2n";
		} else if (parameter === "n") {
			return true;
		}

		parameters = parameter.split("n");
		a = parameters[0] ? parseInt(parameters[0]) : 0;
		b = parameters[1] ? parseInt(parameters[1]) : 0;

		if (reverse) {
			if (tagName) {
				while (current.nextSibling !== null) {
					current = current.nextSibling;
					if (current.nodeType === 1 && (tagName === "*" || tagName.toLowerCase() === current.nodeName.toLowerCase())) {
						counter++;
					}
				}
			} else {
				while (current.nextSibling !== null) {
					current = current.nextSibling;
					if (current.nodeType === 1) {
						counter++;
					}
				}
			}
		} else {
			if (tagName) {
				while (current.previousSibling !== null) {
					current = current.previousSibling;
					if (current.nodeType === 1 && (tagName === "*" || tagName.toLowerCase() === current.nodeName.toLowerCase())) {
						counter++;
					}
				}
			} else {
				while (current.previousSibling !== null) {
					current = current.previousSibling;
					if (current.nodeType === 1) {
						counter++;
					}
				}
			}
		}
		if ((counter < a && counter === b) || ((counter - b) % a === 0)) {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * Collection of utility functions used for pseudo selector matching.
	 */
	isMatchedByPseudoSelector = {
		"root": function(element) {
			return element.nodeName.toLowerCase() === "html";
		},
		"nth-child": function(element, parameter) {
			return isNthChild(element, parameter);
		},
		"nth-last-child": function(element, parameter) {
			return isNthChild(element, parameter, true);
		},
		"nth-of-type": function(element, parameter) {
			return isNthChild(element, parameter, false, tagName);
		},
		"nth-last-of-type": function(element, parameter) {
			return isNthChild(element, parameter, true, tagName);
		},
		"first-child": function(element) {
			var firstChild = null;
			each(element.parentNode.childNodes, function(node) {
				if (node.nodeType === 1) {
					firstChild = node;
					return false;
				}
			});
			return element === firstChild;
		},
		"last-child": function(element) {
			var lastChild = null;
			each(element.parentNode.childNodes, function(node) {
				if (node.nodeType === 1) {
					lastChild = node;
					return false;
				}
			}, true);
			return element === lastChild;
		},
		"only-child": function(element) {
			var children = [];
			each(element.parentNode.childNodes, function(node) {
				if (node.nodeType === 1 && children.length <= 2) {
					children.push(node);
					return false;
				}
			});
			return children.length === 1 && element === children[0];
		},
		"only-of-type": function(element, tagName) {
			var children = [];
			each(element.parentNode.childNodes, function(node) {
				if (node.nodeType === 1 && children.length <= 2 && (tagName === "*" || tagName.toLowerCase() === current.nodeName.toLowerCase())) {
					children.push(node);
					return false;
				}
			});
			return children.length === 1 && element === children[0];
		},
		"empty": function(element) {
			return element.firstChild === null;
		},
		"link": function(element) {
			return element.nodeName.toLowerCase() === "a" && element.href;
		},
		"visited": function(element) {
			return element.nodeName.toLowerCase() === "a" && element.href && element.visited;
		},
		"active": function(element) {
			return element === element.activeElement;
		},
		"hover": function(element) {
			return element === element.hoverElement;
		},
		"focus": function(element) {
			return element === element.activeElement && element.hasFocus() && (element.type || element.href);
		},
		"target": function(element) {
			var hash = document.location ? document.location : "";
			return element.id && element.id === hash.substring(1);
		},
		"lang": function(element, parameter) {
			var lang = parameter.toLowerCase(),
				current = element,
				result = false;
			while (current.parentNode !== document) {
				if (current.lang.toLowerCase() === lang) {
					result = true;
					break;
				}
				current = current.parentNode;
			}
			return result;
		},
		"enabled": function(element) {
			return element.disabled === false && element.type !== "hidden";
		},
		"disabled": function(element) {
			return element.disabled === true;
		},
		"checked": function(element) {
			return element.checked === true;
		},
		"not": function(element, parameter) {
			return !isMatchedByCompoundSelector(element, parseCompoundSelector(parameter));
		}
	};
	/**
	 * Determine whether a specified element is descendant of another specified element.
	 *
	 * @param {Element} descendant
	 * @param {Element} element
	 */
	function isDescendantOf(descendant, element) {
		var current = descendant.parentNode, isDescendant = false;
		while ((current = current.parentNode) !== null) {
			if (current === element) {
				isDescendant = true;
				break;
			}
		}
		return isDescendant;
	}
	/**
	 * Determine whether a specified element matches a specified parsed compound selector.
	 *
	 * @param {Element} element
	 * @param {Object} compoundSelector
	 * @returns {Boolean}
	 */
	function isMatchedByCompoundSelector(element, compoundSelector) {
		var isMatched = true;
		if (compoundSelector.idSelector && compoundSelector.idSelector !== element.id) {
			isMatched = false;
		}
		if (isMatched && compoundSelector.typeSelector !== "*" && compoundSelector.typeSelector.toLowerCase() !== element.nodeName.toLowerCase()) {
			isMatched = false;
		}
		if (isMatched) {
			each(compoundSelector.attributeSelectors, function(attribute) {
				if (!isMatchedByAttributeSelector[attribute.operator](element, attribute.attribute, attribute.value)) {
					isMatched = false;
					return false;
				}
			});
		}
		if (isMatched) {
			each(compoundSelector.pseudoSelectors, function(pseudo) {
				if (!isMatchedByPseudoSelector[pseudo.name](element, pseudo.parameter, compoundSelector.typeSelector)) {
					isMatched = false;
					return false;
				}
			});
		}
		return isMatched;
	}
	/**
	 * Determine whether a specified element matches a specified parsed complex selector(WITHOUT the last compound selector).
	 *
	 * @param {Element} element
	 * @param {Object} complexSelector
	 * @returns {Boolean}
	 */
	function isMatchedByComplexSelector(element, complexSelector) {
		var current = element, // Marks the current element.
			isMatched = true;

		each(complexSelector.compoundSelectors, function(compoundSelector, index) {
			switch (complexSelector.combinators[index]) {
				case " ":
					while ((current = current.parentNode) !== document) {
						if (isMatchedByCompoundSelector(current, compoundSelector)) {
							break;
						}
					}
					if (current === document) {
						isMatched = false;
					}
					break;
				case ">":
					current = current.parentNode;
					if (current === null || !isMatchedByCompoundSelector(current, compoundSelector)) {
						isMatched = false;
					}
					break;
				case "+":
					while ((current = current.previousSibling) !== null && current.nodeType !== 1) { // ELEMENT_NODE
						// Traverse to the previous element sibling
					}
					if (current === null || !isMatchedByCompoundSelector(current, compoundSelector)) {
						isMatched = false;
					}
					break;
				case "~":
					while ((current = current.previousSibling) !== null && current.nodeType !== 1) { // ELEMENT_NODE
						if (current.nodeType === 1 && !isMatchedByCompoundSelector(current, compoundSelector)) {
							isMatched = false;
						}
					}
					if (current === null) {
						isMatched = false;
					}
					break;
			}
			if (!isMatched) {
				return false; // Ends the loop.
			}
		}, true); // Loops in reversed order.
		return isMatched;
	}
	/**
	 * Parses the specified selectors in a specified context or the current document, and retuns an array of matched Elements.
	 *
	 * A selector is a chain of one or more sequences of simple selectors separated by combinators. One pseudo-element may be appended to the last sequence of simple selectors in a selector. A sequence of simple selectors is a chain of
	 * simple selectors that are not separated by a combinator. It always begins with a type selector or a universal selector. No other type selector or universal selector is allowed in the sequence. A simple selector is either a type
	 * selector, universal selector, attribute selector, class selector, ID selector, or pseudo-class. Combinators are: whitespace, "greater-than sign" (U+003E, >), "plus sign" (U+002B, +) and "tilde" (U+007E, ~). White space may appear
	 * between a combinator and the simple selectors around it. Only the characters "space" (U+0020), "tab" (U+0009), "line feed" (U+000A), "carriage return" (U+000D), and "form feed" (U+000C) can occur in whitespace. Other space-like
	 * characters, such as "em-space" (U+2003) and "ideographic space" (U+3000), are never part of whitespace.
	 *
	 * Note: If you wish to use any of the meta-characters(such as !"#$%&'()*+,./:;<=>?@[\]^`{|}~) as a literal part of a name, you must escape the character with two backslashes: \\.
	 *
	 * Demo: selectors -> "body div.header, body div.footer" selector -> "body div.header" type selector -> "body" universal selector -> "*" attribute selector -> "[foo='bar']" class selector -> ".header" ID selector -> "#header"
	 * pseudo-class -> ":nth-child(2n)"
	 *
	 * Queries Elements using specified selectors and context, and retuns an array of matched Elements.
	 *
	 * @param {String} selector
	 * @param {Element|String|Array} context
	 * @return {Array}
	 */
	function find(selector, context) {
		var parsedSelectors = parseSelector(selector),
			contexts = [document],
			matchedElements = [];  // Elements found

		if (context !== undefined) {
			if (context.nodeType === 1) {  // Element
				contexts = [context];
			} else if (typeof context === "string"){
				contexts = find(context);
			} else if (context.length !== undefined){
				contexts = context;
			}
		}

		// Iterate over each complex selector
		each(parsedSelectors, function (parsedSelector) {
			// Pop the last compound selector.
			var lastCompoundSelector = parsedSelector.compoundSelectors.pop();
			// Iterate over each context
			each(contexts, function (context) {
				var elementsToBeFiltered = [];
				// Retrieve all candidate elements by the right most compound selector of each complex selector.
				if (lastCompoundSelector.idSelector) {
					element = document.getElementById(lastCompoundSelector.idSelector);
					lastCompoundSelector.idSelector = null;
					if (isMatchedByCompoundSelector(element, lastCompoundSelector) && isDescendantOf(element, context)) {
						elementsToBeFiltered.push(element);
					}
				} else {
					each(convertToArray(context.getElementsByTagName(lastCompoundSelector.typeSelector)), function (element) {
						if (isMatchedByCompoundSelector(element, lastCompoundSelector)) {
							elementsToBeFiltered.push(element);
						}
					});
				}
				// Filter all candidate elements
				each(elementsToBeFiltered, function(element, index) {
					if (element !== null && !isMatchedByComplexSelector(element, parsedSelector)) {
						elementsToBeFiltered[index] = null;
					}
				});
				// Add elements matched in current context to the result collection
				each(elementsToBeFiltered, function(element) {
					if (element !== null) {
						matchedElements.push(element);
					}
				});
			});
		});
		return matchedElements;
	}
	/**
	 * Create a document fragment containing the node hierarchy of specified selector.
	 *
	 * @param {Selector} selector
	 * @returns {DocumentFragment}
	 */
	function create(selector) {
		var fragment = document.createDocumentFragment();
		if (/^\w+$/.test(selector)) {  // tag
			fragment.appendChild(document.createElement(selector));
		} else {
			throw new Error("Not Implemented.");
		}
		return fragment;
	}
	/**
	 * Determine whether an element matches a specified selector in a specific context.
	 *
	 * @param {Element} element
	 * @param {String} selector
	 * @param {Element|String|Array} context
	 * @return {Boolean}
	 */
	function match(element, selector, context) {
		var contexts = [document], isMatched = false;

		if (context !== undefined) {
			if (context.nodeType === 1) {  // Element
				contexts = [context];
			} else if (typeof context === "string"){
				contexts = find(context);
			} else if (context.length !== undefined){
				contexts = context;
			}
		}

		each(parseSelector(selector), function (parsedSelector) {
			each(contexts, function (context) {
				if (isMatchedByComplexSelector(element, parsedSelector)) {
					isMatched = true;
					return false;  // Break current each
				}
			});
			if (isMatched) {
				return false;  // Break current each
			}
		});
		return isMatched;
	}

	/*
	 * Test whether cache is enabled.
	 */
	MyQuery.ready(function () {
		var fragment = document.createDocumentFragment(),
			div = document.createElement("div");
		MyQuery(fragment).bind("DOMSubtreeModified", function (event) {
			isCacheEnabled = true;
		});
		fragment.appendChild(div);
		if (isCacheEnabled) {}
		//window.setTimeout(function () {
		//	alert("isCacheEnabled=" + isCacheEnabled);
		//}, 5000);
	});
})(this);