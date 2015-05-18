/// <reference path="../typings/tsd.d.ts" />

import _ = require('underscore');
import EventedClass = require('./EventedClass');
import core = require('./core');
import ready = require('./ready');

export interface IRequestWindow extends Window {
  show():void;
}

export interface IPostMessageEvent extends Event {
  data:any;
  origin:string;
  source:Window;
}

ready.whenReady.done(() => {
  if (core.isAvailable()) window.open = cordova.InAppBrowser.open;
});

export class BrowserRequest extends EventedClass.EventedClass {
  constructor(url:string) {
    super();
    this.windowOptions = ['toolbarposition=top', 'hidden=yes', 'location=no', 'closebuttoncaption=Close', 'toolbar=yes'];
    this.windowTarget = '_blank';
    this.openDelay = 1000;
    this.url = url;
    this.show = _.bind(this.show, this);
    this.close = _.bind(this.close, this);
    this.open = _.bind(this.open, this);
    this._onPostMessage = _.bind(this._onPostMessage, this);
    this._addWindowEvents = _.bind(this._addWindowEvents, this);
    this._onLoadStart = _.bind(this._onLoadStart, this);
    this._onLoadError = _.bind(this._onLoadError, this);
    this._onLoadStop = _.bind(this._onLoadStop, this);
    this._onExit = _.bind(this._onExit, this);
    this.onUnload = _.bind(this.onUnload, this);
  }

  url:string;
  windowTarget:string;
  windowOptions:string[];
  openDelay:number;
  window:IRequestWindow;
  windowShowTimeout:number;

  _addWindowEvents() {
    if (this.window && this.window.addEventListener) {
      this.window.addEventListener('loadstart', this._onLoadStart);
      this.window.addEventListener('loaderror', this._onLoadError);
      this.window.addEventListener('loadstop', this._onLoadStop);
      this.window.addEventListener('exit', this._onExit);
      this.window.addEventListener('unload', this.onUnload);
      return window.addEventListener('message', this._onPostMessage);
    }
  }

  removeWindowEvents():void {
    this.window.removeEventListener('loadstart', this._onLoadStart);
    this.window.removeEventListener('loaderror', this._onLoadError);
    this.window.removeEventListener('loadstop', this._onLoadStop);
    this.window.removeEventListener('exit', this._onExit);
    this.window.removeEventListener('unload', this.onUnload);
  }

  _onLoadStart(e:InAppBrowserEvent) {
    this.trigger('load:start', e);
    this.trigger('load:progress', e);
  }

  _onLoadStop(e:InAppBrowserEvent) {
    this.trigger('load:stop', e);
  }

  _onLoadError(e:InAppBrowserEvent) {
    if (e.code === -999) {
      this.trigger('load:cancelled', e);
    } else {
      this.trigger('load:error', e);
    }
  }

  _onPostMessage(e:IPostMessageEvent) {
    if (e.source === this.window) {
      this.trigger('load:progress', e.data);
    }
  }

  _onExit(e:InAppBrowserEvent) {
    this.trigger('exit');
  }

  private onUnload():void {
    setTimeout(() => {
      if (this.window.closed) {
        this.trigger('exit');
      }
    }, 500);
  }

  open(url:string = this.url) {
    this.window = window.open(url, this.windowTarget, this.windowOptions.join(','));
    this._addWindowEvents();
    if (this.openDelay === 0) {
      this.show();
    } else if (this.openDelay > 0) {
      return this.windowShowTimeout = setTimeout(this.show, this.openDelay);
    }
  }

  close() {
    if (this.window) {
      clearTimeout(this.windowShowTimeout);
      window.removeEventListener('message', this._onPostMessage);
      this.removeWindowEvents();
      try {
        return this.window.close();
      } finally {
        this.window = null;
      }
    }
  }

  show() {
    if (this.window && this.window.show) {
      this.window.show();
      return this.trigger('show');
    }
  }

}


