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

function _colorChange (data) {
  console.debug("color._colorChange")
  var color
  var cmyk

  // hsl is better than hex between conversions
  if (data && data.cmyk) {
    cmyk = data.cmyk;
    color = tinycolor(_convertCMYKtoRGB(data.cmyk));
    console.debug("color._colorChange computed color:" + color)
  } 
  else {
    color = tinycolor(data)
  }

  if (cmyk) {
    console.debug("color._colorChange leaving CMYK alonge")
  } else {
    console.debug("color._colorChange recomputing CMYK from RGB")
    var rgb = color.toRgb();
    cmyk = _convertRGBtoCMYK(rgb);
  }
  console.debug("color._colorChange color.cmyk: " + cmyk.c + ", " + cmyk.m + ", " + 
                  cmyk.y + ", " + cmyk.k);

  console.debug("color._colorChange color:" + color);

  return {
    // hsl: hsl,
    hex: color.toHexString().toUpperCase(),
//    hex8: color.toHex8String().toUpperCase(),
    rgba: color.toRgb(),
    // hsv: hsv,
    // oldHue: data.h || oldHue || hsl.h,
    source: data.source,
    // a: data.a || color.getAlpha(),
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
    getCMYK() {
      return this.colors.cmyk;
    },
    convertRGB_to_CMYK(cmyk) {
      console.debug("color.convertRGB_to_CMYK")
      return _convertRGBtoCMYK(cmyk);
    },
    convertCMYK_to_RGBHEX(cmyk) {
      console.debug("color.convertCMYK_to_RGB")
      return _convertCMYKtoRGBHEX(cmyk);
    },
    colorChange (data, oldHue) {
      console.debug("color.colorChange")
      this.colors = _colorChange(data)
    },
    getHex() {
      return this.colors.hex;
    }
    // isValidHex (hex) {
    //   console.debug("color.isValidHex")
    //   return tinycolor(hex).isValid()
    // }
    // simpleCheckForValidColor (data) {
    //   console.debug("color.simpleCheckForValidColor")
    //   var keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'l', 'v']
    //   var checked = 0
    //   var passed = 0

    //   for (var i = 0; i < keysToCheck.length; i++) {
    //     var letter = keysToCheck[i]
    //     if (data[letter]) {
    //       checked++
    //       if (!isNaN(data[letter])) {
    //         passed++
    //       }
    //     }
    //   }

    //   if (checked === passed) {
    //     return data
    //   }
    // },
    // paletteUpperCase (palette) {
    //   console.debug("color.paletteUpperCase")
    //   return palette.map(c => c.toUpperCase())
    // },
    // isTransparent (color) {
    //   console.debug("color.isTransparent")
    //   return tinycolor(color).getAlpha() === 0
    // }
  }
}
