import preact from 'preact-compat';
const ATTR_KEY = '__preactattr_';
const REACT_ELEMENT_TYPE = (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) || 0xeac7;
const Component = preact.Component;

function extend(base, props) {
	for (let key in props) {
		if (props.hasOwnProperty(key)) {
			base[key] = props[key];
		}
	}
	return base;
}

Object.defineProperty(Component.prototype, '_reactInternalInstance', {
	get() {
		return patch(this);
	}
});

function patch(component) {
	return createReactCompositeComponent(component);
}

function createReactCompositeComponent(component) {
	const _currentElement = createReactElement(component);
	let ret = {
		_instance: component,
		_currentElement,
		getPublicInstance() {
			return component;
		}
	};
	return updateReactComponent(ret, component);
}

function updateReactComponent(ret, component) {
	if (component._component) {
		ret._renderedComponent = createReactCompositeComponent(component._component);
	}
	else {
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
	const childNodes = node.nodeType === 1 ? [].slice.call(node.childNodes) : [];
	const isText = node.nodeType === 3;
	const object = {
		_currentElement: isText ? node.textContent : {
			$$typeof: REACT_ELEMENT_TYPE,
			type: node.nodeName.toLowerCase(),
			props: node[ATTR_KEY]
		},
		_renderedChildren: childNodes.map(child => {
			if (child._component) {
				return createReactCompositeComponent(child._component);
			}
			return createReactDOMComponent(child);
		}),
		getPublicInstance() {
			return node;
		},
		_stringText: isText ? node.textContent : null
	};
	if (!isText) {
		node.__reactInternalInstance$mock = object;
	}
	return object;
}

preact.unstable_batchedUpdates = function(cb) {
    cb();
}

export default preact;
