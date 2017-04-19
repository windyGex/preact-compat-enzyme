'use strict';


	

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _preactCompat = window.preactCompat;

var _preactCompat2 = _interopRequireDefault(_preactCompat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var ATTR_KEY = typeof Symbol === 'function' ? Symbol['for']('preactattr') : '__preactattr_';
var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;
var Component = _preactCompat2['default'].Component;

function extend(base, props) {
	for (var key in props) {
		if (props.hasOwnProperty(key)) {
			base[key] = props[key];
		}
	}
	return base;
}

function createReactDOMComponent(node) {
	var childNodes = node.nodeType === 1 ? Array.from(node.childNodes) : [];
	var isText = node.nodeType === 3;
	return {
		_currentElement: isText ? node.textContent : {
			$$typeof: REACT_ELEMENT_TYPE,
			type: node.nodeName.toLowerCase(),
			// Here are different from the react
			// react contains children
			// but polyfill have not
			props: node[ATTR_KEY]
		},
		_renderedChildren: childNodes.map(function (child) {
			return child._component || child;
		}),
		getPublicInstance: function getPublicInstance() {
			return node;
		},

		_stringText: isText ? node.textContent : null
	};
}

function createReactCompositeComponent(component) {
	var _currentElement = createReactElement(component);
	var node = component.base;
	var ret = {
		_instance: component,
		_currentElement: _currentElement,
		getPublicInstance: function getPublicInstance() {
			return component;
		}
	};
	return updateReactComponent(ret, component);
}

function updateReactComponent(ret, component) {
	if (component._component) {
		ret._renderedComponent = createReactCompositeComponent(component._component);
	} else {
		ret._renderedComponent = createReactDOMComponent(component.base);
	}
	return ret;
}

function createReactElement(component) {
	return {
		$$typeof: REACT_ELEMENT_TYPE,
		type: component.constructor,
		key: component.key,
		ref: null,
		props: component.props,
		// dev mode, we don't need
		_store: {}
	};
}

function patch(component) {
	extend(component._reactInternalInstance, createReactCompositeComponent(component));
}

function PolyfillComponent(props, context, opts) {
	Component.call(this, props, context);
	this._reactInternalInstance = {};

	var component = this;
	var componentDidMount = component.componentDidMount;
	var componentDidUpate = component.componentDidUpate;
	this.componentDidMount = function () {
		patch(component);
		if (componentDidMount) {
			componentDidMount.apply(component, arguments);
		}
	};
	if (componentDidUpate) {
		this.componentDidUpdate = function () {
			patch(component);
			componentDidUpdate.apply(component, arguments);
		};
	}
}

PolyfillComponent.prototype = new Component();

PolyfillComponent.prototype.constructor = PolyfillComponent;

_preactCompat2['default'].Component = PolyfillComponent;

_preactCompat2['default'].unstable_batchedUpdates = function (cb) {
	cb();
};

var AUTOBIND_BLACKLIST = {
	constructor: 1,
	render: 1,
	shouldComponentUpdate: 1,
	componentWillReceiveProps: 1,
	componentWillUpdate: 1,
	componentDidUpdate: 1,
	componentWillMount: 1,
	componentDidMount: 1,
	componentWillUnmount: 1,
	componentDidUnmount: 1
};

var BYPASS_HOOK = {};

var DEV = typeof process === 'undefined' || !process.env || process.env.NODE_ENV !== 'production';

var currentComponent;

function F() {}

function createClass(obj) {
	function cl(props, context) {
		bindAll(this);
		PolyfillComponent.call(this, props, context, BYPASS_HOOK);
		newComponentHook.call(this, props, context);
	}

	obj = extend({ constructor: cl }, obj);

	// We need to apply mixins here so that getDefaultProps is correctly mixed
	if (obj.mixins) {
		applyMixins(obj, collateMixins(obj.mixins));
	}
	if (obj.statics) {
		extend(cl, obj.statics);
	}
	if (obj.propTypes) {
		cl.propTypes = obj.propTypes;
	}
	if (obj.defaultProps) {
		cl.defaultProps = obj.defaultProps;
	}
	if (obj.getDefaultProps) {
		cl.defaultProps = obj.getDefaultProps();
	}

	F.prototype = PolyfillComponent.prototype;
	cl.prototype = extend(new F(), obj);

	cl.displayName = obj.displayName || 'Component';

	return cl;
}

// Flatten an Array of mixins to a map of method name to mixin implementations
function collateMixins(mixins) {
	var keyed = {};
	for (var i = 0; i < mixins.length; i++) {
		var mixin = mixins[i];
		for (var key in mixin) {
			if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
				(keyed[key] || (keyed[key] = [])).push(mixin[key]);
			}
		}
	}
	return keyed;
}

// apply a mapping of Arrays of mixin methods to a component prototype
function applyMixins(proto, mixins) {
	for (var key in mixins) {
		if (mixins.hasOwnProperty(key)) {
			proto[key] = multihook(mixins[key].concat(proto[key] || ARR), key === 'getDefaultProps' || key === 'getInitialState' || key === 'getChildContext');
		}
	}
}

function bindAll(ctx) {
	for (var i in ctx) {
		var v = ctx[i];
		if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST.hasOwnProperty(i)) {
			(ctx[i] = v.bind(ctx)).__bound = true;
		}
	}
}

function callMethod(ctx, m, args) {
	if (typeof m === 'string') {
		m = ctx.constructor.prototype[m];
	}
	if (typeof m === 'function') {
		return m.apply(ctx, args);
	}
}

function multihook(hooks, skipDuplicates) {
	return function () {
		var ret = void 0;
		for (var i = 0; i < hooks.length; i++) {
			var r = callMethod(this, hooks[i], arguments);

			if (skipDuplicates && r != null) {
				if (!ret) ret = {};
				for (var key in r) {
					if (r.hasOwnProperty(key)) {
						ret[key] = r[key];
					}
				}
			} else if (typeof r !== 'undefined') ret = r;
		}
		return ret;
	};
}

function newComponentHook(props, context) {
	propsHook.call(this, props, context);
	this.componentWillReceiveProps = multihook([propsHook, this.componentWillReceiveProps || 'componentWillReceiveProps']);
	this.render = multihook([propsHook, beforeRender, this.render || 'render', afterRender]);
}

function propsHook(props, context) {
	if (!props) return;

	// React annoyingly special-cases single children, and some react components are ridiculously strict about this.
	var c = props.children;
	if (c && Array.isArray(c) && c.length === 1) {
		props.children = c[0];

		// but its totally still going to be an Array.
		if (props.children && _typeof(props.children) === 'object') {
			props.children.length = 1;
			props.children[0] = props.children;
		}
	}

	// add proptype checking
	if (DEV) {
		// let ctor = typeof this==='function' ? this : this.constructor,
		// 	propTypes = this.propTypes || ctor.propTypes;
		// if (propTypes) {
		// 	for (let prop in propTypes) {
		// 		if (propTypes.hasOwnProperty(prop) && typeof propTypes[prop]==='function') {
		// 			const displayName = this.displayName || ctor.name;
		// 			let err = propTypes[prop](props, prop, displayName, 'prop');
		// 			if (err) console.error(new Error(err.message || err));
		// 		}
		// 	}
		// }
	}
}

function beforeRender(props) {
	currentComponent = this;
}

function afterRender() {
	if (currentComponent === this) {
		currentComponent = null;
	}
}

_preactCompat2['default'].createClass = createClass;


window.preactCompat = _preactCompat2['default']