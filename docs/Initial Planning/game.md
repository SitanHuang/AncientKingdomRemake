# Technical Requirements
- decouple graphics from implementation
  - should allow future rewrite on any graphics technology
  - could allow running headless
- cross platform, allow later deployment as standalone
  - mobile first

- due to above reasons, unit testing should run without any
  web components

- port over all existing high level features from AK2 while
  rewriting all logic

- Minimal Viable Product tech stack:
  - prob SVG lib
    - [TwoJS](https://two.js.org/) allows agnostic rendering
      - no event handling except SVG renderer
      - allows webGL & potentially way better performance
    - [SVGjs](https://svgjs.dev/docs/3.2/)
      - need to investigate svg elements count (dynamic draw based on camera?)
    - [pixiJS](https://github.com/pixijs/pixijs)
      - no future limits; auto webGPU/webGL

- all user actions must be dedicated API calls
- all runtime API calls should be async
- API is responsible for returning feedback on changed map data
  - allows lazy update of graphics components

# Design

- tiles evaluated randomly, since some of them may bring accumulated production
  to zero

## Game Flow

Map Creation -> Scenario Creation (saved GameState)

## Terrain
- pop mod & econ mod straight from ak2
- maintenance mod
- upkeep mod
- defence mod
- speed mod

## Governance
- gov split into provincial / national
- each level of gov has following:
  - accumulated production (money in ak2) <- cannot be negative
  - own accounting system
  - capital
  - bureaucrats / advisors, & modifiers corresponding to all actions
    - persons should be unique nationwide to allow for possible transfers
  - a tab of auto transfers of production to other provinces / capital
  - permissions
    - can form military
    - can build buildings
- province can be set in arbitrary boundaries
  - not required to be in one continuous territory ("part"); connections auto
    handled by pathfinding
  - potentially allow to play a province or set a province to AI

- Steps:
  1. Create cities list
  2. Calculate parts map & assign partID
  3. Verify provincial validity:
    - If provincial capital no longer controlled/not a city, choose largest pop
      in province as supply center
    - If fails, delete province. Set tiles to national
  4. ???
  5. If province has AI, execute AI

## Production System
- each tile produces some production (income in ak2)
  - full money economy is possible in agricultural society
  - production used for:
    - gov maintenance
    - unit maintenance
    - buildings maintenance
- all upwards production transfers (tile to provicial capital, provincial
  capital to capital) are entropic - losses to efficiencies due to travel
  - tiles/units/buildings without any connection to provincial/national capital
    cannot contribute/consume anything

- production decay????

- Steps:
  1. Calculate travel weights map for A-star for each part
  2. Transfer: tile to capital based on provID (may be national); must cache
     for each weight query; increases accumulated production
  3. Transfer: all levels of gov "tabs" execute; nearest radius to capital goes
     first, capital goes last
  4. each level of gov consumes governance maintenance

## Consumption System

Tile-based (buildings):
  - population governance and building maintenance are allotted as fix-rate per
    taxation cycle
  - all tile expenses consume own production first, before provincial/national
    capitals

Units:
  - funded exclusively from controller (national and/or provincial) through
    pathfinding
  - disbands a certain % when maintenance cannot be met

## Buildings

- buildings created by adding a 0 HP building

- each building has:
  - HP: if <0%, deleted; if >0%, effectiveness decreases
  - HP has actual health points that vary by building
  - each turn, HP is increased by consuming production
  - damage order: only the building with highest order takes damage and gets
    deleted first
  - maintenance cost consumes prod; if cannot be fulfilled, takes hp damage

- fort: offers defence buffs, uses maintenance, decreases unit upkeep
- storage: increases accumulated production cap, uses maintenance
- workshop: increases production
- road: decreases entropic effects
- city: marks tile as city, uses maintenance

## Units
- permissions:
  - determine controller (national and/or provincial)
- basically a Rhine division
- has routes; consumes travel speed
- can be split/combined/disbanded
- attacks adjacent tiles only; if tile has no stationed troops, then just walk
  in; when others are below 30% in strength compared to at start of round,
  retreat; tile pop takes equal damage as military casualties (until reaching
  0); buildings take proportional HP damage

- recruited anywhere, max once per tile
  - starting at 150%, draws population from tile, decreases radially outward
    until recruit target is met (check pop first)
- pop is returned on disband to provincial/national capital

- consumes production every turn

# Features Outside MVP (Secondary roadmap)
- resources & market
- legacy/imperial points to modify provinces
- different unit types
- cultures
- oceans & navies

# Data

## Object: Game

- civs[]
- Map

### Object: Scenario
- basically a saved game
