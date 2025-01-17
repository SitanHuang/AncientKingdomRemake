
class Viewport {
  domElement;
  container;
  renderer;

  minPanThreshold;

  #onHoverCallbacks = new Map();
  #onBrushCallbacks = new Map();
  #onClickCallbacks = new Map();

  #pointersDown = [];

  #brushInProgress = false;
  #pinchInProgress = false;
  #panInProgress = false;
  #pinchDistLast; // enables pinch zoom
  #pinchCenterLast; // enables pinch zoom + pan

  #shiftKeyDown = false;

  #zoom = 1;

  #wheelSmoother = new ExponentialSmoother({ alpha: 150, duration: 250 });
  #wheelTarget;

  #inertiaVelocity =[0, 0];
  #inertiaVelocityLastUpdate = Date.now();
  #inertiaFriction = 0.9;
  #inertiaMinSpeed = 2.50;
  #inertiaMinTime = 50; // ms; holding beyond this time removes inertia

  log = Logger.get("Viewport");

  constructor({
    renderer,
    minPanThreshold
  }) {
    this.renderer = renderer;
    this.domElement = renderer.containerElement;

    this.minPanThreshold = minPanThreshold || 5;

    this.container = new PIXI.Container();
    this.container.sortableChildren = true;
    this.container.label = "Viewport";

    // PIXI bubbles events like DOM: child first
    this.container.eventMode = 'static';

    this.renderer.addTickerSequence(this.update);
  }

  get viewportWidth() {
    return this.domElement.clientWidth;
  }
  get viewportHeight() {
    return this.domElement.clientHeight;
  }

  update = (time) => {
    const deltaMS = time.deltaMS;

    const timeFactor = (deltaMS + 0.1) / 16.7;

    if (this.#wheelTarget) {
      this.zoom = this.#wheelSmoother.applySmoothing(
        deltaMS,
        this.#wheelTarget.orig,
        this.#wheelTarget.target
      );

      this.applyZoom([this.#wheelTarget.event.canvasX, this.#wheelTarget.event.canvasY]);

      if (this.#wheelSmoother.isStopped)
        this.#wheelTarget = null;
    }

    // Inertial panning
    if (
      !this.#pointersDown.length &&
      (Math.abs(this.#inertiaVelocity[0]) > 0.2 ||
        Math.abs(this.#inertiaVelocity[1]) > 0.2)
    ) {
      this.pan([
        this.#inertiaVelocity[0] * timeFactor,
        this.#inertiaVelocity[1] * timeFactor
      ]);
      // apply friction
      this.#inertiaVelocity[0] *= Math.min(0.99, this.#inertiaFriction / timeFactor);
      this.#inertiaVelocity[1] *= Math.min(0.99, this.#inertiaFriction / timeFactor);
    } else if (!this.#pointersDown.length) {
      // once below threshold, snap to zero to prevent drifting forever
      this.#inertiaVelocity = [0, 0];
    }
  };

  hookEvents() {
    // prevents zooming on IOS?
    window.addEventListener('gesturestart', e => e.preventDefault());
    window.addEventListener('gesturechange', e => e.preventDefault());
    window.addEventListener('gestureend', e => e.preventDefault());

    this.domElement.addEventListener('pointerdown', this.pointerDownHandler);
    this.domElement.addEventListener('pointermove', this.pointerMoveHandler);
    this.domElement.addEventListener('pointerup', this.pointerUpHandler);
    this.domElement.addEventListener('pointercancel', this.pointerUpHandler);
    this.domElement.addEventListener('pointerout', this.pointerUpHandler);
    this.domElement.addEventListener('pointerleave', this.pointerUpHandler);
    this.domElement.addEventListener('wheel', this.wheelHandler);

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
    window.addEventListener('blur', this.keyUpHandler);
  }

  destroy() {
    this.domElement.removeEventListener('pointerdown', this.pointerDownHandler);
    this.domElement.removeEventListener('pointermove', this.pointerMoveHandler);
    this.domElement.removeEventListener('pointerup', this.pointerUpHandler);
    this.domElement.removeEventListener('pointercancel', this.pointerUpHandler);
    this.domElement.removeEventListener('pointerout', this.pointerUpHandler);
    this.domElement.removeEventListener('pointerleave', this.pointerUpHandler);
    this.domElement.removeEventListener('wheel', this.wheelHandler);

    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    window.removeEventListener('blur', this.keyUpHandler);
  }

  resetTransientActions() {
    this.#brushInProgress && this.endBrush();
  }

  addChild(child) {
    this.container.addChild(child);
  }
  removeChild(child) {
    this.container.removeChild(child);
  }

  registerOnHover(id, callback) {
    this.#onHoverCallbacks.set(id, callback);
  }
  registerOnBrush(id, callback) {
    this.#onBrushCallbacks.set(id, callback);
  }
  registerOnClick(id, callback) {
    this.#onClickCallbacks.set(id, callback);
  }
  removeOnHover(id) {
    this.#onHoverCallbacks.delete(id);
  }
  removeOnBrush(id) {
    this.#onBrushCallbacks.delete(id);
  }
  removeOnClick(id) {
    this.#onClickCallbacks.delete(id);
  }

  beginBrush() {
    this.#brushInProgress = true;
  }
  endBrush() {
    this.#brushInProgress = false;
    this.#pointersDown = [];
  }

  keyDownHandler = (event) => {
    this.#shiftKeyDown = event.shiftKey;
  };
  keyUpHandler = (event) => {
    this.#shiftKeyDown = typeof event.shiftKey == 'boolean' ? event.shiftKey : false;
  };

  wheelHandler = (event) => {
    calcOffsetCoors(event);
    event.preventDefault();

    const step = 1 - event.deltaY / 200;

    this.#wheelTarget = {
      event: event,
      orig: this.zoom,
      target: this.zoom * step
    };
    this.#wheelSmoother.reset();
  }

  pointerDownHandler = (event) => {
    calcOffsetCoors(event);
    this.#pointersDown.push(event);

    // start/restart pinching on last 2 pointers
    if (this.#pointersDown.length >= 2) {
      const e2 = event;
      const e1 = this.#pointersDown.at(-2);

      e1._maskEvents = e2._maskEvents = true;

      this.#pinchInProgress = true;
      this.#pinchDistLast = Viewport.#pointerEventsDist(e1, e2);
      this.#pinchCenterLast = Viewport.#pointerEventsCenter(e1, e2);

      // disable events on children
      this.container.eventMode = 'none';
    }

    this.#inertiaVelocity = [0, 0];
  }

  pointerMoveHandler = (event) => {
    calcOffsetCoors(event);

    // Find this event in the cache and update its record with this event
    const index = this.#pointersDown.findIndex(
      (x) => x.pointerId === event.pointerId,
    );

    if (index == -1) {
      // hover only, didn't previously touch down

      this.#onHoverCallbacks.forEach((callback) => {
        callback(
          this.container.toLocal(new PIXI.Point(event.canvasX, event.canvasY)),
          event
        );
      });

      return;
    }

    if (this.#brushInProgress && this.#shiftKeyDown) {
      // previously touched down (index != -1)

      this.#onBrushCallbacks.forEach((callback) => {
        callback(
          this.container.toLocal(new PIXI.Point(event.canvasX, event.canvasY)),
          event
        );
      });

      return;
    }

    const oldEvent = this.#pointersDown[index];

    if (this.#pinchInProgress && this.#pointersDown.length >= 2) {
      // pinch
      const e2 = this.#pointersDown.at(-1);
      const e1 = this.#pointersDown.at(-2);

      const newDist = Viewport.#pointerEventsDist(e1, e2);
      const newCenter = Viewport.#pointerEventsCenter(e1, e2);

      const zoomFactor = newDist / this.#pinchDistLast;
      this.pinchFrom(zoomFactor, newCenter);
      this.pan([
        newCenter[0] - this.#pinchCenterLast[0],
        newCenter[1] - this.#pinchCenterLast[1]
      ]);

      event._maskEvents = true;

      this.#pinchDistLast = newDist;
      this.#pinchCenterLast = newCenter;
    } else if (oldEvent) {
      // detect pan
      const diff = [
        event.canvasX - oldEvent.canvasX,
        event.canvasY - oldEvent.canvasY
      ];

      if (!this.#panInProgress && Math.sqrt(
          Math.pow(diff[0], 2) +
          Math.pow(diff[1], 2)
        ) >= this.minPanThreshold) {
        this.#panInProgress = true;
        // disable events on children
        this.container.eventMode = 'none';
      }

      if (this.#panInProgress) {
        event._maskEvents = true;

        this.#inertiaVelocity = diff;
        this.#inertiaVelocityLastUpdate = Date.now();

        this.pan(this.#inertiaVelocity);
      }
    }

    if (this.#panInProgress || this.#pinchInProgress) {
      this.#pointersDown[index] = event;
    }
  }

  get zoom() {
    return this.#zoom;
  }
  set zoom(zoom) {
    this.#zoom = Math.max(0.05, Math.min(3, zoom));
  }

  pan([canvasX, canvasY]) {
    // this is a getter/setter, so we better use it only when necessary
    const x0 = this.container.x;
    const y0 = this.container.y;

    let x = x0, y = y0;
    x += canvasX;
    y += canvasY;

    const containerW = this.container.width;
    const containerH = this.container.height;

    const minX = -containerW + this.viewportHeight * 0.2;
    const maxX = this.viewportWidth - this.viewportHeight * 0.2;
    const minY = -containerH + this.viewportHeight * 0.2;
    const maxY = this.viewportHeight * 0.8;

    x = Math.max(Math.min(x, maxX), minX);
    y = Math.max(Math.min(y, maxY), minY);

    if (x != x0)
      this.container.x = x;
    if (y != y0)
      this.container.y = y;
  }

  pinchFrom(zoomFactor, pt) {
    this.zoom *= zoomFactor;

    this.applyZoom(pt);
  }

  applyZoom([x, y]=[0, 0]) {
    const screenCoor = new PIXI.Point(x, y);
    const oldPoint = this.container.toLocal(screenCoor);

    this.container.scale = this.zoom;

    const newPoint = this.container.toGlobal(oldPoint);
    this.container.x += screenCoor.x - newPoint.x;
    this.container.y += screenCoor.y - newPoint.y;
  }

  /**
   * Resets the container so it fits entirely in the viewport and is centered.
   * If centerX/centerY are given, that unscaled coordinate will be placed
   * in the middle of the viewport instead.
   *
   * @param {object} options
   * @param {number} [options.centerX] - Unscaled x-coordinate to center on
   * @param {number} [options.centerY] - Unscaled y-coordinate to center on
   */
  resetView({ centerX = null, centerY = null } = {}) {
    const unscaledW = this.container.width / this.zoom;
    const unscaledH = this.container.height / this.zoom;

    const vpW = this.viewportWidth;
    const vpH = this.viewportHeight;

    // "Fit in" scale.  Pick the smaller ratio so the entire container fits.
    const scale = Math.min(vpW / unscaledW, vpH / unscaledH);

    this.container.scale = this.zoom = scale;

    if (centerX !== null && centerY !== null) {
      this.container.x = vpW / 2 - centerX * scale;
      this.container.y = vpH / 2 - centerY * scale;
    } else {
      this.container.x = (vpW - unscaledW * scale) / 2;
      this.container.y = (vpH - unscaledH * scale) / 2;
    }
  }

  pointerUpHandler = (event) => {
    calcOffsetCoors(event);

    // remove event from pointersDown list
    const index = this.#pointersDown.findIndex(
      x => x.pointerId === event.pointerId,
    );

    // upHandler may be called multiple times for the same event, and we detect
    // this when the pointersDown tracking is already lost for that pointerId
    const oldEvent = index == -1 ? null : this.#pointersDown.splice(index, 1)[0];

    if (
      (oldEvent &&
      this.#pointersDown.findIndex(x => x._maskEvents) == -1) ||
      (!this.#pinchInProgress && !this.#panInProgress && !this.#brushInProgress)
    ) {
      // hand over interactivity back to children
      this.container.eventMode = 'passive';
    }

    // If no more pointers are down and we didn't pinch or pan
    // we consider either a 'click' or a single 'brush' action.
    if (
      oldEvent &&
      this.#pointersDown.length === 0 &&
      !this.#pinchInProgress && !this.#panInProgress
    ) {
      const localPt = this.container.toLocal(new PIXI.Point(event.canvasX, event.canvasY));

       if (this.#brushInProgress) {
        // If in brush mode, interpret click as a brush action
        this.#onBrushCallbacks.forEach((callback) => {
          callback(localPt, event);
        });
      } else {
        // Otherwise, it's a normal "click"
        this.#onClickCallbacks.forEach((callback) => {
          callback(localPt, event);
        });
      }
    }

    if (this.#panInProgress) {
      if (
        Math.abs(this.#inertiaVelocity[0]) < this.#inertiaMinSpeed ||
        Math.abs(this.#inertiaVelocity[1]) < this.#inertiaMinSpeed ||
        Date.now() - this.#inertiaVelocityLastUpdate > this.#inertiaMinTime
      ) {
        this.#inertiaVelocity = [0, 0];
      }

      this.#pinchInProgress = false;
    }

    this.#panInProgress = false;
  }

  static #pointerEventsDist(e1, e2, min=0.1) {
    return Math.max(min, Math.sqrt(
      Math.pow(e1.canvasX - e2.canvasX, 2) +
      Math.pow(e1.canvasY - e2.canvasY, 2)
    ));
  }
  static #pointerEventsCenter(e1, e2) {
    return [
      (e1.canvasX + e2.canvasX) / 2,
      (e1.canvasY + e2.canvasY) / 2,
    ]
  }
}
