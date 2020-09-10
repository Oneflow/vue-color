import tinycolor from 'tinycolor2'

function _convertRGBtoCMYK(rgb) {
  console.debug("color._convertRGBtoCMYK")
  var rPrime = rgb.r / 255.0;
  console.debug("color._convertRGBtoCMYK.rPrime: " + rPrime)
  var gPrime = rgb.g / 255.0;
  console.debug("color._convertRGBtoCMYK.gPrime: " + gPrime)
  var bPrime = rgb.b / 255.0;
  console.debug("color._convertRGBtoCMYK.bPrime: " + bPrime)
  var k = 1 - Math.max(rPrime, gPrime, bPrime);
  console.debug("color._convertRGBtoCMYK.k: " + k)

  var retCMYK;

  if (k === 1) {
    retCMYK = {
      c: 0,
      m: 0,
      y: 0,
      k: 100
    }
  } else {
    retCMYK = {
      c: Math.round(((1-rPrime-k)*100) / (1-k)),
      m: Math.round(((1-gPrime-k)*100) / (1-k)),
      y: Math.round(((1-bPrime-k)*100) / (1-k)),
      k: Math.round(k*100)
    }
  }

  console.debug("color._convertRGBtoCMYK returning cmyk: " + retCMYK.c + ", " + retCMYK.m + ", " +
                retCMYK.y + ", " + retCMYK.k)
  return retCMYK;
}

function _convertCMYKtoRGB(cmyk) {
  console.debug("color._convertCMYKtoRGB")
  var oneMinusK = 1-(cmyk.k/100);
  var r = Math.round(255 * (1 - cmyk.c/100) * oneMinusK);
  console.debug("color._convertCMYKtoRGB.r: " + r)
  var g = Math.round(255 * (1 - cmyk.m/100) * oneMinusK);
  console.debug("color._convertCMYKtoRGB.g: " + g)
  var b = Math.round(255 * (1 - cmyk.y/100) * oneMinusK);
  console.debug("color._convertCMYKtoRGB.b: " + b)

  var retRGB = {
    r: r,
    g: g,
    b: b
  }

  console.debug("color._convertCMYKtoRGB returning rgb: " + retRGB.r + ", " + retRGB.g + ", " + retRGB.b)

  return retRGB;
}

function _decimalToHex(num, pad) {
  var hex = num.toString(16);  

  while (hex.length < pad) {
      hex = "0" + hex;
  }

  return hex;
}
function _convertCMYKtoRGBHEX(cmyk) {
  console.debug("color._convertCMYKtoRGBHEX")

  var rgb = _convertCMYKtoRGB(cmyk);

  return '#' + _decimalToHex(rgb.r, 2) + _decimalToHex(rgb.g, 2) + _decimalToHex(rgb.b, 2);
}

function _colorChange (data, oldHue) {
  console.debug("color._colorChange")
  var alpha = data && data.a
  var color
  var cmyk

  // hsl is better than hex between conversions
  if (data && data.hsl) {
    color = tinycolor(data.hsl)
  } else if (data && data.hex && data.hex.length > 0) {
    color = tinycolor(data.hex)
  } else if (data && data.hsv) {
    color = tinycolor(data.hsv)
  } else if (data && data.rgba) {
    color = tinycolor(data.rgba)
  } else if (data && data.rgb) {
    color = tinycolor(data.rgb)
  } else if (data && data.cmyk) {
    color = tinycolor(_convertCMYKtoRGB(data.cmyk));
    console.debug("color._colorChange computed color:" + color)
  } else {
    color = tinycolor(data)
  }

  if (color && (color._a === undefined || color._a === null)) {
    color.setAlpha(alpha || 1)
  }

  var hsl = color.toHsl()
  var hsv = color.toHsv()

  if (cmyk) {
    console.debug("color._colorChange leaving CMYK alonge")
  } else {
    console.debug("color._colorChange recomputing CMYK from RGB")
    var rgb = color.toRgb();
    cmyk = _convertRGBtoCMYK(rgb);
  }
  console.debug("color._colorChange color.cmyk: " + cmyk.c + ", " + cmyk.m + ", " + 
                  cmyk.y + ", " + cmyk.k);

  if (hsl.s === 0) {
    hsv.h = hsl.h = data.h || (data.hsl && data.hsl.h) || oldHue || 0
  }

  console.debug("color._colorChange color:" + color);

  /* --- comment this block to fix #109, may cause #25 again --- */
  // when the hsv.v is less than 0.0164 (base on test)
  // because of possible loss of precision
  // the result of hue and saturation would be miscalculated
  // if (hsv.v < 0.0164) {
  //   hsv.h = data.h || (data.hsv && data.hsv.h) || 0
  //   hsv.s = data.s || (data.hsv && data.hsv.s) || 0
  // }

  // if (hsl.l < 0.01) {
  //   hsl.h = data.h || (data.hsl && data.hsl.h) || 0
  //   hsl.s = data.s || (data.hsl && data.hsl.s) || 0
  // }
  /* ------ */

  return {
    hsl: hsl,
    hex: color.toHexString().toUpperCase(),
    hex8: color.toHex8String().toUpperCase(),
    rgba: color.toRgb(),
    hsv: hsv,
    oldHue: data.h || oldHue || hsl.h,
    source: data.source,
    a: data.a || color.getAlpha(),
    cmyk: {c: cmyk.c, m: cmyk.m, y: cmyk.y, k: cmyk.k}
  }
}

export default {
  props: ['value'],
  data () {
    return {
      val: _colorChange(this.value)
    }
  },
  computed: {
    colors: {
      get () {
        console.debug("color.computed.colors.get")
        return this.val
      },
      set (newVal) {
        console.debug("color.computed.colors.set")
        this.val = newVal
        this.$emit('input', newVal)
      }
    }
  },
  watch: {
    value (newVal) {
      console.debug("color.watch.value")
      this.val = _colorChange(newVal)
    }
  },
  methods: {
    convertRGB_to_CMYK(cmyk) {
      console.debug("color.convertRGB_to_CMYK")
      return _convertRGBtoCMYK(cmyk);
    },
    convertRGB_to_RGBHEX(cmyk) {
      console.debug("color.convertCMYK_to_RGB")
      return _convertCMYKtoRGBHEX(cmyk);
    },
    // convertCMYKtoRGB(cmyk) {
    //   var oneMinusK = 1-(cmyk.k/100);
    //   var r = 255 * (1 - c/100) * oneMinusK;
    //   var g = 255 * (1 - m/100) * oneMinusK;
    //   var b = 255 * (1 - y/100) * oneMinueK;

    //   return {
    //     r: r,
    //     g: g,
    //     b: b
    //   }
    // },
    colorChange (data, oldHue) {
      console.debug("color.colorChange")
      this.oldHue = this.colors.hsl.h
      this.colors = _colorChange(data, oldHue || this.oldHue)
    },
    isValidHex (hex) {
      console.debug("color.isValidHex")
      return tinycolor(hex).isValid()
    },
    simpleCheckForValidColor (data) {
      console.debug("color.simpleCheckForValidColor")
      var keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'l', 'v']
      var checked = 0
      var passed = 0

      for (var i = 0; i < keysToCheck.length; i++) {
        var letter = keysToCheck[i]
        if (data[letter]) {
          checked++
          if (!isNaN(data[letter])) {
            passed++
          }
        }
      }

      if (checked === passed) {
        return data
      }
    },
    paletteUpperCase (palette) {
      console.debug("color.paletteUpperCase")
      return palette.map(c => c.toUpperCase())
    },
    isTransparent (color) {
      console.debug("color.isTransparent")
      return tinycolor(color).getAlpha() === 0
    }
  }
}
