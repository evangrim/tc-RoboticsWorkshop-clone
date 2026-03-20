// Adapted from Thames & Kosmos & Gigotools (Gigotoys).
// References:
//   Two-point calibration: https://learn.adafruit.com/calibrating-sensors/two-point-calibration
//   TCS34725 driver & DN40 IR correction: https://github.com/adafruit/Adafruit_TCS34725
//   Colour finder tutorial: https://github.com/systembolaget/Physical-computing-sensor-servo-tutorial-6a-Colour-finder-with-ams-TCS34725-and-HD-1900A

enum PingUnit {
    //% block="cm"
    Centimeters,
    //% block="μs"
    MicroSeconds,
    //% block="inches"
    Inches
}
enum MotorChannel {
    //% block="A"
    MotorA = 1,
    //% block="B"
    MotorB = 2,
    //% block="C"
    MotorC = 3,
    //% block="D"
    MotorD = 4
}
enum MotorDirection {
    //% block="forward"
    Forward = 0,
    //% block="reverse"
    Reverse = 1
}
enum RGBLedColors {
    //% block=off
    Off = 0x000000,
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF

}
//% weight=0 color=#3CB371 icon="\uf2db" block="IsaacWorkshop"
//% groups='["Motor", "Ultrasonic Sensor", "RGB LED", "1. Color Setup", "2. Color Calibrate", "3. Color Scan", "4. Color Match"]'
namespace IsaacWorkshop {

    ////////////////////////////////
    //          DDM Motor         //
    ////////////////////////////////


    /**Motor channel definition annotation
    A(1,2)
    B(8,13)
    C(14,15)
    D(16,0)
    I2C(20,19)
    */
    //% blockId=DDMmotor2 block="motor channel %MotorPin|speed (0~100) %MSpeedValue|direction %direction" blockExternalInputs=false
    //% MSpeedValue.min=0 MSpeedValue.max=100
    //% group="Motor"
    export function DDMmotor2(MotorPin: MotorChannel, MSpeedValue: number, direction: MotorDirection): void {
        MSpeedValue = Math.clamp(0, 100, MSpeedValue);
        switch (MotorPin) {
            case MotorChannel.MotorA:
                pins.analogWritePin(AnalogPin.P1, pins.map(MSpeedValue, 0, 100, 0, 1000));
                pins.digitalWritePin(DigitalPin.P2, direction);
                break;
            case MotorChannel.MotorB:
                pins.analogWritePin(AnalogPin.P8, pins.map(MSpeedValue, 0, 100, 0, 1000));
                pins.digitalWritePin(DigitalPin.P13, direction);
                break;
            case MotorChannel.MotorC:
                pins.analogWritePin(AnalogPin.P14, pins.map(MSpeedValue, 0, 100, 0, 1000));
                pins.digitalWritePin(DigitalPin.P15, direction);
                break;
            case MotorChannel.MotorD:
                pins.analogWritePin(AnalogPin.P16, pins.map(MSpeedValue, 0, 100, 0, 1000));
                pins.digitalWritePin(DigitalPin.P0, direction);
                break;

        }
    }
    /**Motor pinout automatically declared
      */
    //% blockId=DDMmotor block="speed pin %MSpeedPin|speed (0~255) %MSpeedValue|direction pin %McontrolPin|direction %direction" blockExternalInputs=false
    //% MSpeedValue.min=0 MSpeedValue.max=255
    //% MSpeedPin.fieldEditor="gridpicker" MSpeedPin.fieldOptions.columns=4
    //% MSpeedPin.fieldOptions.tooltips="false" MSpeedPin.fieldOptions.width="300"
    //% McontrolPin.fieldEditor="gridpicker" McontrolPin.fieldOptions.columns=4
    //% McontrolPin.fieldOptions.tooltips="false" McontrolPin.fieldOptions.width="300"
    //% group="Motor"
    export function DDMmotor(MSpeedPin: AnalogPin, MSpeedValue: number, McontrolPin: DigitalPin, direction: MotorDirection): void {
        MSpeedValue = Math.clamp(0, 255, MSpeedValue);
        pins.analogWritePin(MSpeedPin, pins.map(MSpeedValue, 0, 255, 0, 1020));
        pins.digitalWritePin(McontrolPin, direction);

    }

    ////////////////////////////////
    //          Ultrasound            //
    ////////////////////////////////
    /**Ultrasonic annotations
     * Send a ping and get the echo time (in microseconds) as a result
     * @param trig tigger pin
     * @param echo echo pin
     * @param unit desired conversion unit
     * @param maxCmDistance maximum distance in centimeters (default is 500)
     */

    //% blockId=sonar_ping block="trig pin %trig|echo pin %echo|unit %unit"
    //% group="Ultrasonic Sensor"
    export function ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.Centimeters: return Math.idiv(d, 58);
            case PingUnit.Inches: return Math.idiv(d, 148);
            default: return d;
        }
    }
    ////////////////////////////////
    //          RGB LEDS          //
    ////////////////////////////////
    /**
         * Create a  RGB LED Pin.
         */
    //% blockId="RGBLED_create" block="pin %pin|"
    //% weight=100 blockGap=8
    //% trackArgs=0,2
    //% blockSetVariable=RGBLED
    //% group="RGB LED"
    export function RGBLED_create(pin: DigitalPin): HaloHd {
        let RGBLED = new HaloHd();
        RGBLED.buf = pins.createBuffer(1 * 3);
        RGBLED.start = 0;
        RGBLED._length = 1;/*LED數量*/
        RGBLED.RGBLED_set_brightness(128)
        RGBLED.pin = pin;
        pins.digitalWritePin(RGBLED.pin, 0);
        return RGBLED;
    }
    export class HaloHd {
        buf: Buffer;
        pin: DigitalPin;
        brightness: number;
        start: number;
        _length: number;

        /**
         * Shows whole ZIP Halo display as a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the LED
         */
        //% group="RGB LED"
        //% block="%RGBLED|show color %rgb=RGBLED_colors"
        //% weight=99 blockGap=8
        RGBLED_set_color(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }



        /**
         * Send all the changes to the ZIP Halo display.
         */
        //% group="RGB LED"
        /* blockId="kitronik_halo_hd_display_show" block="%RGBLED|show" blockGap=8 */
        //% weight=96
        show() {
            //use the Kitronik version which respects brightness for all
            //ws2812b.sendBuffer(this.buf, this.pin, this.brightness);
            // Use the pxt-microbit core version which now respects brightness (10/2020)
            light.sendWS2812BufferWithBrightness(this.buf, this.pin, this.brightness);
        }

        /**
         * Turn off all LEDs on the ZIP Halo display.
         * You need to call ``show`` to make the changes visible.
         */
        //% group="RGB LED"
        /* blockId="kitronik_halo_hd_display_clear" block="%RGBLED|clear" */
        //% weight=95 blockGap=8
        clear(): void {
            this.buf.fill(0, this.start * 3, this._length * 3);
        }

        /**
         * Set the brightness of the ZIP Halo display. This flag only applies to future show operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% group="RGB LED"
        //% block="%RGBLED|set brightness %brightness" blockGap=8
        //% weight=92
        //% brightness.min=0 brightness.max=255
        RGBLED_set_brightness(brightness: number): void {
            //Clamp incoming variable at 0-255 as values out of this range cause unexpected brightnesses as the lower level code only expects a byte.
            if (brightness < 0) {
                brightness = 0
            }
            else if (brightness > 255) {
                brightness = 255
            }
            this.brightness = brightness & 0xff;
            basic.pause(1) //add a pause to stop wierdnesses
        }

        //Sets up the buffer for pushing LED control data out to LEDs
        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            this.buf[offset + 0] = green;
            this.buf[offset + 1] = red;
            this.buf[offset + 2] = blue;
        }

        //Separates out Red, Green and Blue data and fills the LED control data buffer for all LEDs
        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * 3, red, green, blue)
            }
        }

        //Separates out Red, Green and Blue data and fills the LED control data buffer for a single LED
        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 3;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            this.setBufferRGB(pixeloffset, red, green, blue)
        }
    }



    /**
     * Converts wavelength value to red, green, blue channels
     * @param wavelength value between 470 and 625. eg: 500
     */
    //% group="RGB LED"
    //% weight=1 blockGap=8
    /* blockId="kitronik_halo_hd_wavelength" block="wavelength %wavelength|nm" */
    //% wavelength.min=470 wavelength.max=625
    export function wavelength(wavelength: number): number {
        /*  The LEDs we are using have centre wavelengths of 470nm (Blue) 525nm(Green) and 625nm (Red)
        * 	 We blend these linearly to give the impression of the other wavelengths.
        *   as we cant wavelength shift an actual LED... (Ye canna change the laws of physics Capt)*/
        let r = 0;
        let g = 0;
        let b = 0;
        if ((wavelength >= 470) && (wavelength < 525)) {
            //We are between Blue and Green so mix those
            g = pins.map(wavelength, 470, 525, 0, 255);
            b = pins.map(wavelength, 470, 525, 255, 0);
        }
        else if ((wavelength >= 525) && (wavelength <= 625)) {
            //we are between Green and Red, so mix those
            r = pins.map(wavelength, 525, 625, 0, 255);
            g = pins.map(wavelength, 525, 625, 255, 0);
        }
        return packRGB(r, g, b);
    }

    /**
     * Converts hue (0-360) to an RGB value.
     * Does not attempt to modify luminosity or saturation.
     * Colours end up fully saturated.
     * @param hue value between 0 and 360
     */
    //% group="RGB LED"
    //% weight=1 blockGap=8
    /* blockId="kitronik_halo_hd_hue" block="hue %hue" */
    //% hue.min=0 hue.max=360
    export function hueToRGB(hue: number): number {
        let redVal = 0
        let greenVal = 0
        let blueVal = 0
        let hueStep = 2.125
        if ((hue >= 0) && (hue < 120)) { //RedGreen section
            greenVal = Math.floor((hue) * hueStep)
            redVal = 255 - greenVal
        }
        else if ((hue >= 120) && (hue < 240)) { //GreenBlueSection
            blueVal = Math.floor((hue - 120) * hueStep)
            greenVal = 255 - blueVal
        }
        else if ((hue >= 240) && (hue < 360)) { //BlueRedSection
            redVal = Math.floor((hue - 240) * hueStep)
            blueVal = 255 - redVal
        }
        return ((redVal & 0xFF) << 16) | ((greenVal & 0xFF) << 8) | (blueVal & 0xFF);
    }

    /*  The LEDs we are using have centre wavelengths of 470nm (Blue) 525nm(Green) and 625nm (Red)
    * 	 We blend these linearly to give the impression of the other wavelengths.
    *   as we cant wavelength shift an actual LED... (Ye canna change the laws of physics Capt)*/

    /**
     * Converts value to red, green, blue channels
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% group="RGB LED"
    //% weight=1 blockGap=8
    //% blockId="rgb" block="red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% group="RGB LED"
    //% weight=2 blockGap=8
    //% blockId="RGBLED_colors" block="%color"
    export function colors(color: RGBLedColors): number {
        return color;
    }

    //Combines individual RGB settings to be a single number
    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    //Separates red value from combined number
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    //Separates green value from combined number
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    //Separates blue value from combined number
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     */
    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$ = 0;
        let g$ = 0;
        let b$ = 0;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    /**
     * Options for direction hue changes, used by rainbow block (never visible to end user)
     */
    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    ////////////////////////////////
    //          Color sensor        //
    ////////////////////////////////

    // TCS34725 register constants
    const TCS_ADDR         = 41;     // 0x29 — I2C address
    const TCS_INIT_ATIME   = 0x819C; // cmd byte 0x81 (ATIME reg) + value 0x9C (~240ms integration)
    const TCS_INIT_ENABLE  = 0x8003; // cmd byte 0x80 (ENABLE reg) + value 0x03 (PON | AEN)
    const TCS_CMD_CDATAL   = 0xB2;   // 0x80|0x20|0x12 — clear data low, auto-increment
    const TCS_CMD_RDATAL   = 0xB6;   // 0x80|0x20|0x16 — red data low
    const TCS_CMD_GDATAL   = 0xB8;   // 0x80|0x20|0x18 — green data low
    const TCS_CMD_BDATAL   = 0xBA;   // 0x80|0x20|0x1A — blue data low
    const TCS_CONTROL_REG  = 0x8F;   // CONTROL register for gain setting

    // Calibration state — raw uncalibrated readings for order-independent two-point cal
    let rawBlackR = 0; let rawBlackG = 0; let rawBlackB = 0;
    let rawWhiteR = 0; let rawWhiteG = 0; let rawWhiteB = 0;
    let blackCalibrated = false;
    let whiteCalibrated = false;

    let forkrange = 30;
    let nowReadColor = [0, 0, 0];
    let colorReadValid = false;
    let colorSensorInitialized = false;
    let irCorrectionEnabled = false;
    let colorRecorded = [false, false, false, false, false, false, false, false];

    // Auto-initialize the sensor if not already done
    function ensureInit(): void {
        if (!colorSensorInitialized) {
            ColorSensorinit();
        }
    }

    // Read the clear channel from TCS34725
    function readClearChannel(): number {
        ensureInit();
        pins.i2cWriteNumber(TCS_ADDR, TCS_CMD_CDATAL, NumberFormat.Int8LE, true);
        return pins.i2cReadNumber(TCS_ADDR, NumberFormat.UInt16LE, false);
    }

    // Read normalized RGB without black/white calibration (for calibration routines)
    function readRawRGBUncalibrated(): number[] {
        ensureInit();
        pins.i2cWriteNumber(TCS_ADDR, TCS_CMD_CDATAL, NumberFormat.Int8LE, true);
        let clear = pins.i2cReadNumber(TCS_ADDR, NumberFormat.UInt16LE, false);
        pins.i2cWriteNumber(TCS_ADDR, TCS_CMD_RDATAL, NumberFormat.Int8LE, true);
        let red   = pins.i2cReadNumber(TCS_ADDR, NumberFormat.UInt16LE, false);
        pins.i2cWriteNumber(TCS_ADDR, TCS_CMD_GDATAL, NumberFormat.Int8LE, true);
        let green = pins.i2cReadNumber(TCS_ADDR, NumberFormat.UInt16LE, false);
        pins.i2cWriteNumber(TCS_ADDR, TCS_CMD_BDATAL, NumberFormat.Int8LE, true);
        let blue  = pins.i2cReadNumber(TCS_ADDR, NumberFormat.UInt16LE, false);
        // IR correction (Adafruit DN40): R and B filters leak IR; subtract estimated IR component
        // Disabled by default — the sensor's built-in LED produces no IR, so the correction
        // mistakenly strips real red/blue signal. Enable only for sunlight/incandescent use.
        if (irCorrectionEnabled) {
            let ir = (red + green + blue > clear) ? Math.idiv(red + green + blue - clear, 2) : 0;
            red   = Math.max(0, red - ir);
            blue  = Math.max(0, blue - ir);
        }
        let normR = 0, normG = 0, normB = 0;
        if (clear > 0) {
            normR = (red   / clear) * 255;
            normG = (green / clear) * 255;
            normB = (blue  / clear) * 255;
        }
        return [normR, normG, normB, clear];
    }

    // Read calibrated RGB applying two-point [black, white] -> [0, 255] mapping
    function readRawRGB(): number[] {
        let raw = readRawRGBUncalibrated();
        let r = raw[0], g = raw[1], b = raw[2];

        let bR = blackCalibrated ? rawBlackR : 0;
        let bG = blackCalibrated ? rawBlackG : 0;
        let bB = blackCalibrated ? rawBlackB : 0;

        if (whiteCalibrated) {
            let rangeR = rawWhiteR - bR;
            let rangeG = rawWhiteG - bG;
            let rangeB = rawWhiteB - bB;
            r = rangeR > 0 ? (r - bR) / rangeR * 255 : 0;
            g = rangeG > 0 ? (g - bG) / rangeG * 255 : 0;
            b = rangeB > 0 ? (b - bB) / rangeB * 255 : 0;
        } else if (blackCalibrated) {
            r = r - bR;
            g = g - bG;
            b = b - bB;
        }

        r = Math.min(255, Math.max(0, Math.round(r)));
        g = Math.min(255, Math.max(0, Math.round(g)));
        b = Math.min(255, Math.max(0, Math.round(b)));

        return [r, g, b, raw[3]];
    }

    // If ColorSensorReadColor was called, reuse that read; otherwise read fresh
    function ensureRead(): void {
        if (!colorReadValid) {
            let raw = readRawRGB();
            nowReadColor = [raw[0], raw[1], raw[2]];
        }
    }

    // Euclidean distance between two RGB colors
    function colorDistance(a: number[], b: number[]): number {
        let dr = a[0] - b[0];
        let dg = a[1] - b[1];
        let db = a[2] - b[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    // Convert RGB to hue (0–360 degrees)
    function rgbToHue(r: number, g: number, b: number): number {
        let max = Math.max(r, Math.max(g, b));
        let min = Math.min(r, Math.min(g, b));
        let delta = max - min;
        if (delta == 0) return 0;
        let h = 0;
        if (max == r)      h = (g - b) / delta;
        else if (max == g) h = (b - r) / delta + 2;
        else               h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        return h < 0 ? h + 360 : h;
    }

    // Convert RGB to saturation percentage (0–100)
    function rgbToSaturation(r: number, g: number, b: number): number {
        let max = Math.max(r, Math.max(g, b));
        if (max == 0) return 0;
        return Math.round(((max - Math.min(r, Math.min(g, b))) / max) * 100);
    }

    // Return the stored reference color for the given ColorPart
    function getStoredColor(colorpart: number): number[] {
        switch (colorpart) {
            case ColorPart.Red:     return ReadRedColor;
            case ColorPart.Green:   return ReadGreenColor;
            case ColorPart.Blue:    return ReadBlueColor;
            case ColorPart.Yellow:  return ReadYellowColor;
            case ColorPart.Purple:  return ReadPurpleColor;
            case ColorPart.Custom1: return ReadCustom1Color;
            case ColorPart.Custom2: return ReadCustom2Color;
            case ColorPart.Custom3: return ReadCustom3Color;
        }
        return [0, 0, 0];
    }

    /** Turn on the color sensor. Place this in "on start" before any other color sensor blocks. */
    //% weight=100
    //% block="initialize color sensor"
    //% group="1. Color Setup"
    export function ColorSensorinit(): void {
        pins.i2cWriteNumber(TCS_ADDR, TCS_INIT_ATIME, NumberFormat.UInt16BE, false)
        pins.i2cWriteNumber(TCS_ADDR, TCS_INIT_ENABLE, NumberFormat.UInt16BE, false)
        basic.pause(200);
        colorSensorInitialized = true;
    }

    export enum ColorSensorGain {
        //% block="1x (bright)"
        x1  = 0,
        //% block="4x"
        x4  = 1,
        //% block="16x"
        x16 = 2,
        //% block="60x (dim)"
        x60 = 3
    }

    /** Adjust sensor sensitivity. Higher gain helps in dim lighting. Resets calibration. */
    //% weight=90
    //% block="set color sensor gain %gain"
    //% group="1. Color Setup"
    //% advanced=true
    export function ColorSensorSetGain(gain: ColorSensorGain): void {
        ensureInit();
        pins.i2cWriteNumber(TCS_ADDR, (TCS_CONTROL_REG << 8) | gain, NumberFormat.UInt16BE, false);
        blackCalibrated = false;
        whiteCalibrated = false;
    }

    /** Enable IR correction only if using the sensor in sunlight or incandescent light (not the built-in LED). */
    //% weight=89
    //% block="color sensor enable IR correction %enabled"
    //% group="1. Color Setup"
    //% advanced=true
    export function ColorSensorSetIRCorrection(enabled: boolean): void {
        irCorrectionEnabled = enabled;
    }

    /** How much light the sensor sees right now (0 = dark, 100 = very bright). */
    //% weight=88
    //% block="color sensor brightness (0–100)"
    //% group="1. Color Setup"
    //% advanced=true
    export function ColorSensorReadBrightness(): number {
        let rawClear = readClearChannel();
        return Math.min(100, Math.round(rawClear / 655));
    }

    /** Returns a gain setting (1x, 4x, 16x, or 60x) for the current lighting. Use with "set color sensor gain". */
    //% weight=87
    //% block="color sensor suggested gain"
    //% group="1. Color Setup"
    //% advanced=true
    export function ColorSensorSuggestedGain(): ColorSensorGain {
        let rawClear = readClearChannel();
        if (rawClear < 1000)  return ColorSensorGain.x60;
        if (rawClear < 8000)  return ColorSensorGain.x16;
        if (rawClear < 20000) return ColorSensorGain.x4;
        return ColorSensorGain.x1;
    }

    /** Automatically picks the best gain for the current lighting. Resets calibration. */
    //% weight=86
    //% block="color sensor auto-set gain"
    //% group="1. Color Setup"
    //% advanced=true
    export function ColorSensorAutoGain(): void {
        ColorSensorSetGain(ColorSensorSuggestedGain());
    }

    /** Hold the sensor over a white surface and run this to set the bright end of calibration. Do this before scanning colors for best accuracy. */
    //% weight=100
    //% block="calibrate on white surface"
    //% group="2. Color Calibrate"
    export function ColorSensorCalibrateWhite(): void {
        let rgb = readRawRGBUncalibrated();
        rawWhiteR = rgb[0];
        rawWhiteG = rgb[1];
        rawWhiteB = rgb[2];
        whiteCalibrated = true;
    }

    /** Hold the sensor over a dark/black surface and run this to set the dark end of calibration. Do this before scanning colors for best accuracy. */
    //% weight=99
    //% block="calibrate on dark surface"
    //% group="2. Color Calibrate"
    export function ColorSensorCalibrateBlack(): void {
        let rgb = readRawRGBUncalibrated();
        rawBlackR = rgb[0];
        rawBlackG = rgb[1];
        rawBlackB = rgb[2];
        blackCalibrated = true;
    }

    /** Scan the surface under the sensor. Returns a combined color number. Call this before using any "scanned..." blocks. */
    //% weight=100
    //% block="scan color"
    //% group="3. Color Scan"
    export function ColorSensorReadColor(): number {
        colorReadValid = false;
        let raw = readRawRGB();
        nowReadColor = [raw[0], raw[1], raw[2]];
        colorReadValid = true;
        return packRGB(raw[0], raw[1], raw[2]);
    }

    export enum Channel {
        //% block="red"
        Red = 1,
        //% block="green"
        Green = 2,
        //% block="blue"
        Blue = 3
    }

    /** Get the red, green, or blue value (0–255) from the last scan. Use "scan color" first. */
    //% weight=99
    //% block="scanned %channel value (0–255)"
    //% group="3. Color Scan"
    export function ColorSensorRead(channel: Channel = 1): number {
        ensureRead();
        switch (channel) {
            case Channel.Red:   return nowReadColor[0];
            case Channel.Green: return nowReadColor[1];
            case Channel.Blue:  return nowReadColor[2];
        }
        return 0;
    }

    /** The color wheel angle from the last scan: 0=red, 120=green, 240=blue. Use "scan color" first. */
    //% weight=90
    //% block="scanned hue (0–360°)"
    //% group="3. Color Scan"
    //% advanced=true
    export function ColorSensorReadHue(): number {
        ensureRead();
        return rgbToHue(nowReadColor[0], nowReadColor[1], nowReadColor[2]);
    }

    /** How vivid the scanned color is: 0%=gray/white, 100%=pure color. Use "scan color" first. */
    //% weight=89
    //% block="scanned saturation (0–100%)"
    //% group="3. Color Scan"
    //% advanced=true
    export function ColorSensorReadSaturation(): number {
        ensureRead();
        return rgbToSaturation(nowReadColor[0], nowReadColor[1], nowReadColor[2]);
    }

    /** True if the surface has little color (e.g. white, gray, or black). */
    //% weight=88
    //% block="scanned color is gray (saturation below %threshold\\%)"
    //% threshold.min=0 threshold.max=100
    //% group="3. Color Scan"
    //% advanced=true
    export function ColorSensorIsGray(threshold: number = 20): boolean {
        ensureRead();
        return rgbToSaturation(nowReadColor[0], nowReadColor[1], nowReadColor[2]) < threshold;
    }

    export enum ColorPart {
        //% block="Red"
        Red = 1,
        //% block="Green"
        Green = 2,
        //% block="Blue"
        Blue = 3,
        //% block="Yellow"
        Yellow = 4,
        //% block="Purple"
        Purple = 5,
        //% block="Custom1"
        Custom1 = 6,
        //% block="Custom2"
        Custom2 = 7,
        //% block="Custom3"
        Custom3 = 8
    }

    let ReadRedColor = [0, 0, 0]
    let ReadGreenColor = [0, 0, 0]
    let ReadBlueColor = [0, 0, 0]
    let ReadYellowColor = [0, 0, 0]
    let ReadPurpleColor = [0, 0, 0]
    let ReadCustom1Color = [0, 0, 0]
    let ReadCustom2Color = [0, 0, 0]
    let ReadCustom3Color = [0, 0, 0]

    /** Save the current surface color as a reference. Use "scanned color matches stored" to compare against it later. */
    //% weight=100
    //% block="record color %colorpart"
    //% group="4. Color Match"
    export function ColorSensorRecord(colorpart: ColorPart = 1): void {
        let raw = readRawRGB();
        let rgb = [raw[0], raw[1], raw[2]];
        switch (colorpart) {
            case ColorPart.Red:     ReadRedColor     = rgb; break;
            case ColorPart.Green:   ReadGreenColor   = rgb; break;
            case ColorPart.Blue:    ReadBlueColor    = rgb; break;
            case ColorPart.Yellow:  ReadYellowColor  = rgb; break;
            case ColorPart.Purple:  ReadPurpleColor  = rgb; break;
            case ColorPart.Custom1: ReadCustom1Color = rgb; break;
            case ColorPart.Custom2: ReadCustom2Color = rgb; break;
            case ColorPart.Custom3: ReadCustom3Color = rgb; break;
        }
        colorRecorded[colorpart - 1] = true;
    }

    /** How close a color must be to count as a match. Lower = stricter, higher = more forgiving. */
    //% weight=90 blockGap=8
    //% block="set match tolerance %range"
    //% range.min=1 range.max=100
    //% group="4. Color Match"
    //% advanced=true
    export function setColorTolerance(range: number = 30): void {
        forkrange = Math.clamp(1, 100, range);
    }

    /** True/false: is the last scanned color close to the recorded reference? Use "scan color" first, and "record color" to save a reference. */
    //% weight=99
    //% block="scanned color matches stored %colorpart"
    //% group="4. Color Match"
    export function ColorSensorMatchesStored(colorpart: ColorPart): boolean {
        ensureRead();
        return colorDistance(nowReadColor, getStoredColor(colorpart)) < forkrange;
    }

    /** True if the last scanned color is close to the given R/G/B values (each 0–255). */
    //% weight=89
    //% block="scanned color matches R %r G %g B %b"
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% group="4. Color Match"
    //% advanced=true
    export function ColorSensorMatchesRGB(r: number, g: number, b: number): boolean {
        ensureRead();
        return colorDistance(nowReadColor, [r, g, b]) < forkrange;
    }

    /** Like "matches stored" but compares only the hue (color wheel angle), ignoring brightness. Returns false for grays. */
    //% weight=88
    //% block="scanned hue matches stored %colorpart within %hueTolerance degrees"
    //% hueTolerance.min=1 hueTolerance.max=180
    //% group="4. Color Match"
    //% advanced=true
    export function ColorSensorMatchesStoredByHue(colorpart: ColorPart, hueTolerance: number = 30): boolean {
        ensureRead();
        if (rgbToSaturation(nowReadColor[0], nowReadColor[1], nowReadColor[2]) < 15) return false;
        let ref = getStoredColor(colorpart);
        if (rgbToSaturation(ref[0], ref[1], ref[2]) < 15) return false;
        let h1 = rgbToHue(nowReadColor[0], nowReadColor[1], nowReadColor[2]);
        let h2 = rgbToHue(ref[0], ref[1], ref[2]);
        let diff = Math.abs(h1 - h2);
        return (diff > 180 ? 360 - diff : diff) <= hueTolerance;
    }

    /** Returns the name (Red, Green, Blue, etc.) of whichever recorded color best matches the last scan. Only considers colors you have recorded. Use "scan color" first. */
    //% weight=98
    //% block="closest stored color name"
    //% group="4. Color Match"
    export function ColorSensorClosestMatch(): ColorPart {
        ensureRead();
        let bestPart = ColorPart.Red;
        let bestDist = 999999;
        for (let i = 1; i <= 8; i++) {
            if (!colorRecorded[i - 1]) continue;
            let ref = getStoredColor(i);
            let d = colorDistance(nowReadColor, ref);
            if (d < bestDist) { bestDist = d; bestPart = i; }
        }
        return bestPart;
    }

    /** Display the last scanned color on an RGB LED — useful for debugging. */
    //% weight=87
    //% block="show scanned color on %led"
    //% group="3. Color Scan"
    //% advanced=true
    export function ColorSensorShowOnLED(led: HaloHd): void {
        ensureRead();
        led.RGBLED_set_color(packRGB(nowReadColor[0], nowReadColor[1], nowReadColor[2]));
    }

}
