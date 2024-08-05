# Technical Requirements
- decouple graphics from implementation
  - should allow future rewrite on any graphics technology
  - could allow running headless
- cross platform, allow later deployment as standalone

- due to above reasons, unit testing should run without any
  web components

- port over all existing high level features from AK2 while
  rewriting all logic

- Minimal Viable Product tech stack:
  - prob SVG lib
    - [TwoJS](https://two.js.org/) allows agnostic rendering
      - no event handling except SVG renderer
    - [SVGjs](https://svgjs.dev/docs/3.2/)

# Data

## Object: Game

- civs[]
- Map

### Object: Scenario
- basically a saved game