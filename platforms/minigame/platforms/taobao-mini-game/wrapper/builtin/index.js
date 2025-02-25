import * as _window from './window';
import { document } from './document';

const global = $global;

function inject () {
  // Expose the global canvas
  _window.canvas = $global.screencanvas;
  _window.document = document;

  _window.addEventListener = (type, listener) => {
    _window.document.addEventListener(type, listener);
  };
  _window.removeEventListener = (type, listener) => {
    _window.document.removeEventListener(type, listener);
  };
  _window.dispatchEvent = _window.document.dispatchEvent;

  const { platform } = my.getSystemInfoSync();

  // Developer tools cannot redefine window
  if (typeof __devtoolssubcontext === 'undefined' && platform === 'devtools') {
    for (const key in _window) {
      const descriptor = Object.getOwnPropertyDescriptor(global, key);

      if (!descriptor || descriptor.configurable === true) {
        Object.defineProperty(window, key, {
          value: _window[key],
        });
      }
    }

    for (const key in _window.document) {
      const descriptor = Object.getOwnPropertyDescriptor(global.document, key);

      if (!descriptor || descriptor.configurable === true) {
        Object.defineProperty(global.document, key, {
          value: _window.document[key],
        });
      }
    }
    window.parent = window;
  } else {
    for (const key in _window) {
      global[key] = _window[key];
    }
    global.window = _window;
    window = global;
    window.top = window.parent = window;
  }

  const windowInfo = my.getWindowInfoSync();
  let _innerHeight = windowInfo.windowHeight;
  let _innerWidth = windowInfo.windowWidth;
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    enumerable: true,
    get() {
      return _innerWidth;
    }
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    enumerable: true,
    get() {
      return _innerHeight;
    }
  });

  my.onWindowResize((res) => {
    _innerWidth = res.windowWidth;
    _innerHeight = res.windowHeight;
    const screen = window.screen;
    screen.width = _innerWidth;
    screen.height = _innerHeight;
    screen.availWidth = _innerWidth;
    screen.availHeight = _innerHeight;
  });

  global.setTimeout = setTimeout;
  global.clearTimeout = clearTimeout;
  global.setInterval = setInterval;
  global.clearInterval = clearInterval;
}

if (!global.__isAdapterInjected) {
  global.__isAdapterInjected = true;
  inject();
}

require('../../../../common/xmldom/dom-parser');
require('../unify');
