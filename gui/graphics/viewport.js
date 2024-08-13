
class Viewport {
  domElement;
  container;
  renderer;

  viewportWidth;
  viewportHeight;

  minPanThreshold;

  #onHoverCallbacks = new Map();
  #onBrushCallbacks = new Map();

  #pointersDown = [];

  #brushInProgress = false;
  #pinchInProgress = false;
  #panInProgress = false;
  #pinchDistLast; // enables pinch zoom
  #pinchCenterLast; // enables pinch zoom + pan

  #zoom = 1;

  #wheelSmoother = new ExponentialSmoother({ alpha: 150, duration: 250 });
  #wheelTarget;

  log = Logger.get("Viewport");

  constructor({
    renderer,
    viewportWidth,
    viewportHeight,
    minPanThreshold
  }) {
    this.renderer = renderer;
    this.domElement = renderer.containerElement;

    this.viewportWidth = viewportWidth || this.domElement.canvasX;
    this.viewportHeight = viewportHeight || this.domElement.canvasY;

    this.minPanThreshold = minPanThreshold || 5;

    this.container = new PIXI.Container();
    this.container.sortableChildren = true;
    this.container.label = "Viewport";

    // PIXI bubbles events like DOM: child first
    this.container.eventMode = 'static';

    this.renderer.addTickerSequence(this.update);
  }

  update = (time) => {
    if (this.#wheelTarget) {
      this.zoom = this.#wheelSmoother.applySmoothing(
        time.deltaMS,
        this.#wheelTarget.orig,
        this.#wheelTarget.target
      );

      this.applyZoom([this.#wheelTarget.event.canvasX, this.#wheelTarget.event.canvasY]);

      if (this.#wheelSmoother.isStopped)
        this.#wheelTarget = null;
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
  }

  destroy() {
    this.domElement.removeEventListener('pointerdown', this.pointerDownHandler);
    this.domElement.removeEventListener('pointermove', this.pointerMoveHandler);
    this.domElement.removeEventListener('pointerup', this.pointerUpHandler);
    this.domElement.removeEventListener('pointercancel', this.pointerUpHandler);
    this.domElement.removeEventListener('pointerout', this.pointerUpHandler);
    this.domElement.removeEventListener('pointerleave', this.pointerUpHandler);
    this.domElement.removeEventListener('wheel', this.wheelHandler);
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
  removeOnHover(id) {
    this.#onHoverCallbacks.delete(id);
  }
  removeOnBrush(id) {
    this.#onBrushCallbacks.delete(id);
  }

  beginBrush() {
    this.#brushInProgress = true;
  }
  endBrush() {
    this.#brushInProgress = false;
    this.#pointersDown = [];
  }

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
        callback(this.container.toLocal(new PIXI.Point(event.offsetX, event.offsetY)));
      });

      return;
    }

    if (this.#brushInProgress) {
      // previously touched down (index != -1)

      this.#onBrushCallbacks.forEach((callback) => {
        callback(this.container.toLocal(new PIXI.Point(event.offsetX, event.offsetY)));
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

        this.pan([
          event.canvasX - oldEvent.canvasX,
          event.canvasY - oldEvent.canvasY
        ]);
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
    this.#zoom = Math.max(0.05, Math.min(2, zoom));
  }

  pan([canvasX, canvasY]) {
    this.container.x += canvasX;
    this.container.y += canvasY;
  }

  pinchFrom(zoomFactor, pt) {
    this.zoom *= zoomFactor

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

    this.#pinchInProgress = false;
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