# Isaac's Robotics Workshop

Provides a modest suite of MakeCode Micro:Bit sensor blocks, designed for Thames & Kosmos Robotics Workshop and Sensor Expansion. Adapted from code provided by Thames & Kosmos for Robotics Workshop with Micro:Bit, originally developed by Gigotoys.

## Color Sensor Guide

### Calibrating the Sensor

Calibration teaches the sensor what "dark" and "white" look like in your environment so that color readings are accurate. Do this every time lighting conditions change.

**In "on start":**
1. `initialize color sensor`
2. Place the sensor over a dark/black surface → `calibrate color sensor on dark surface`
3. Place the sensor over a white surface → `calibrate color sensor on white surface`

> **Tip:** Use `pause (ms) 1000` between steps to give yourself time to position the sensor. You can also trigger calibration steps with button presses instead.

### IR Correction (Advanced — may not be needed in controlled environments)

The sensor includes an infrared correction algorithm from the TCS34725 datasheet. This is **off by default** because the sensor's built-in white LED produces virtually no infrared light, and the correction would incorrectly reduce red and blue readings.

**Only enable IR correction** if you are using the sensor without its LED, under sunlight or incandescent bulbs:
- In "on start", add: `color sensor enable IR correction true`

If colors look wrong (reds reading as green, blues disappearing), make sure IR correction is **off** (the default).

### Comparing Colors

There are two main approaches: **match a specific color** and **find the closest color**.

#### Approach 1: Does this match a specific color?

Use this when you need a yes/no answer, e.g. "is this red?"

**Setup (in "on start", after calibration):**
1. Place a red object under the sensor → `color sensor record Red`
2. Place a blue object under the sensor → `color sensor record Blue`
3. Repeat for each color you want to recognize

**In "forever" or your main loop:**
1. `color sensor scan color` — always call this first to take a fresh reading
2. `if color sensor matches stored Red` → do something
3. `else if color sensor matches stored Blue` → do something else

> **Tip:** If matches are too strict or too loose, use the advanced block `color sensor set match tolerance` (default 30). Lower = stricter, higher = more forgiving.

#### Approach 2: Which color is this closest to?

Use this when you have several recorded colors and want to know which one the sensor sees.

**Setup:** Same as above — record reference colors in "on start".

**In your loop:**
1. `color sensor scan color`
2. `set myColor to color sensor closest stored color` — returns whichever recorded color (Red, Blue, etc.) is the nearest match
3. Use `if myColor = Red` / `else if myColor = Blue` / etc. to branch

> **Note:** This only considers colors you have recorded. If you only recorded Red and Blue, it will always return one of those two — even if the surface is green.

#### Approach 3: Match by hue only (Advanced)

If lighting varies and you want to ignore brightness differences, use hue matching:

1. `color sensor scan color`
2. `if color sensor hue matches stored Red within 30 degrees` → match

This compares only the color wheel angle (0–360°), so a dim red and a bright red both match. It returns false for gray/white/black surfaces automatically.

### Color Scanning Tips

  - Keep distance constant — the sensor-to-surface gap matters a lot. That's where a servo jig like yours helps                                             
  - Same lighting — calibrate and record under the same light you'll scan under. The built-in LED helps here since it's consistent
  - Use hue matching for color identity — RGB distance (matches stored) is sensitive to brightness variations. Hue matching (hue matches stored) ignores    
  brightness and just asks "is this red vs blue vs green?" which is more robust                                                                             
  - Use RGB matching for shade precision — if you need to distinguish light blue from dark blue, hue won't help; RGB distance will                          
  - Tighter tolerance = fewer false positives but you need more consistent positioning                                                                      
  - Distinct colors are easier — red vs blue vs green is very reliable; red vs orange is harder and needs tighter tolerances and good calibration           


## License

* MIT


## Supported targets


```package
RoboticsWorkshop=github:evangrim/tc-RoboticsWorkshop-clone
```

## Makecode docs

https://makecode.com/defining-blocks
