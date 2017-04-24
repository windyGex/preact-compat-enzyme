'use strict';


	

var _preactCompat = window.preactCompat;

var _preactCompat2 = _interopRequireDefault(_preactCompat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var ATTR_KEY = '__preactattr_';
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

Object.defineProperty(Component.prototype, '_reactInternalInstance', {
	get: function get() {
		return patch(this);
	}
});

function patch(component) {
	return createReactCompositeComponent(component);
}

function createReactCompositeComponent(component) {
	var _currentElement = createReactElement(component);
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

function createReactDOMComponent(node) {
	var childNodes = node.nodeType === 1 ? [].slice.call(node.childNodes) : [];
	var isText = node.nodeType === 3;
	var object = {
		_currentElement: isText ? node.textContent : {
			$$typeof: REACT_ELEMENT_TYPE,
			type: node.nodeName.toLowerCase(),
			props: node[ATTR_KEY]
		},
		_renderedChildren: childNodes.map(function (child) {
			if (child._component) {
				return createReactCompositeComponent(child._component);
			}
			return createReactDOMComponent(child);
		}),
		getPublicInstance: function getPublicInstance() {
			return node;
		},

		_stringText: isText ? node.textContent : null
	};
	if (!isText) {
		node.__reactInternalInstance$mock = object;
	}
	return object;
}

_preactCompat2['default'].unstable_batchedUpdates = function (cb) {
	cb();
};


window.preactCompat = _preactCompat2['default']