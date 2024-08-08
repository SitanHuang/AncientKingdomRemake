class ExponentialSmoother {

  elapsed = 0;

  alpha;
  duration;

  #denominator;

  constructor(opts={
    alpha: 10,
    duration: 300, // ms
  }) {
    Object.assign(this, opts);

    this.#denominator = Math.log(this.alpha + 1);
  }

  applySmoothing(deltaMS, from, to) {
    const range = to - from;
    this.elapsed += deltaMS;

    const x = this.elapsed / this.duration;

    return from + range * Math.log(this.alpha * x + 1) / this.#denominator;
  }

  reset() {
    this.elapsed = 0;
  }

  get isStopped() {
    return this.elapsed >= this.duration;
  }
}