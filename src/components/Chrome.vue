<template>
  <div role="application" aria-label="Chrome color picker" :class="['vc-chrome']">
    <select v-on:change="selectType($event);" value="pickerType">
      <option :selected="this.pickerType === this.CMYKString">{{ this.CMYKString }} </option>
      <option :selected="this.pickerType === this.RegString">{{ this.RegString }}</option>
    </select>
    <div v-if="this.pickerType === this.CMYKString" role="application" aria-label="Compact color picker" class="vc-chrome-boxes">
      <ul class="vc-chrome-colors" role="listbox">
        <li
          v-for="c in paletteCMYK"
          role="option"
          :aria-label="'color:' + c.name"
          :aria-selected="c.name === pick"
          class="vc-compact-color-item"
          :key="c"
          :class="{'vc-compact-color-item--white': c.name === 'white' || c.name === 'yellow'}"
          :style="{background: c.colorhex}"
          @click="handlerCMYKClick(c)"
        >
          <div class="vc-compact-dot" v-show="c.name === pick"></div>
        </li>
      </ul>
    </div>
    <div v-if="this.pickerType === this.RegString" role="application" aria-label="Compact color picker" class="vc-chrome-boxes">
      <ul class="vc-chrome-colors" role="listbox">
        <li
          v-for="c in paletteReg"
          role="option"
          :aria-label="'color:' + c.name"
          :aria-selected="c.name === pick"
          class="vc-compact-color-item"
          :key="c"
          :class="{'vc-compact-color-item--white': c.name === 'reg-white'}"
          :style="{background: c.colorhex}"
          @click="handlerRegClick(c)"
        >
          <div class="vc-compact-dot" v-show="c.name === pick"></div>
        </li>
      </ul>
    </div>
    <div class="vc-chrome-body">
      <div class="vc-chrome-controls">
        <div class="vc-chrome-color-wrap">
          <div :aria-label="`current color is ${colors.hex}`" class="vc-chrome-active-color" :style="{background: activeColor}"></div>
        </div>
      </div>      
      <div class="vc-chrome-fields-wrap">
        <div class="vc-chrome-fields">
          <!-- cmyk -->
          <div class="vc-chrome-field">
            <ed-in label="c" :value="cmyk.c" :min=0 :max=100 @change="inputChange"></ed-in>
          </div>
          <div class="vc-chrome-field">
            <ed-in label="m" :value="cmyk.m" :min=0 :max=100 @change="inputChange"></ed-in>
          </div>
          <div class="vc-chrome-field">
            <ed-in label="y" :value="cmyk.y" :min=0 :max=100 @change="inputChange"></ed-in>
          </div>
          <div class="vc-chrome-field">
            <ed-in label="k" :value="cmyk.k" :min=0 :max=100 @change="inputChange"></ed-in>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import colorMixin from '../mixin/colorCMYK'
import editableInput from './common/EditableInput.vue'
import saturation from './common/Saturation.vue'
import hue from './common/Hue.vue'
import alpha from './common/Alpha.vue'
import checkboard from './common/Checkboard.vue'

const defaultCMYKColors = [
  {
    cmyk: {c: 0, m: 0, y: 0, k: 100},
    colorhex: '#000000',
    name: 'black'
  },
  {
    cmyk: {c: 0, m: 0, y: 0, k: 75},
    colorhex: '#404040',
    name: 'grey75'
  },
  {
    cmyk: {c: 0, m: 0, y: 0, k: 50},
    colorhex: '#808080',
    name: 'grey50'
  },
  {
    cmyk: {c: 0, m: 0, y: 0, k: 25},
    colorhex: '#BFBFBF',
    name: 'grey25'
  },
  {
    cmyk: {c: 0, m: 0, y: 0, k: 0},
    colorhex: '#FFFFFF',
    name: 'white'
  },

  {
    cmyk: {c: 100, m: 0, y: 0, k: 0},
    colorhex: '#00FFFF',
    name: 'cyan'
  },

  {
    cmyk: {c: 100, m: 100, y: 0, k: 0},
    colorhex: '#0000FF',
    name: 'blue'
  },

  {
    cmyk: {c: 0, m: 100, y: 0, k: 0},
    colorhex: '#FF00FF',
    name: 'magenta'
  },

  {
    cmyk: {c: 0, m: 100, y: 100, k: 0},
    colorhex: '#FF0000',
    name: 'red'
  },

  {
    cmyk: {c: 0, m: 0, y: 100, k: 0},
    colorhex: '#FFFF00',
    name: 'yellow'
  },

  {
    cmyk: {c: 100, m: 0, y: 100, k: 0},
    colorhex: '#00FF00',
    name: 'green'
  }
]

const defaultRegColors = [
  {
    cmyk: {c: 100, m: 100, y: 100, k: 100},
    colorhex: '#000000',
    name: 'reg-black'
  }
]

export default {
  name: 'Chrome',
  mixins: [colorMixin],
  props: {
    disableAlpha: {
      type: Boolean,
      default: false
    },
    paletteCMYK: {
      type: Array,
      default() {
        return defaultCMYKColors
      }
    },
    paletteReg: {
      type: Array,
      default() {
        return defaultRegColors
      }
    },
    pick: {
      type: String,
      default: 'black'
    }
  },
  components: {
    saturation,
    hue,
    alpha,
    'ed-in': editableInput,
    checkboard
  },
  data () {
    return {
      highlight: false,
      CMYKString: 'CMYK',
      RegString: 'Registration',
      pickerType: 'CMYK'
    }
  },
  computed: {
    cmyk () {
      console.debug("Chrome.computed.cmyk")
      //var cmyk = this.convertRGBtoCMYK(this.colors.rgba)
      var cmyk = this.getCMYK()
      return {
        c: cmyk.c,
        m: cmyk.m,
        y: cmyk.y,
        k: cmyk.k,
        source: 'cmyk'
      }
    },
    hex() {
      var hex = this.getHex()
      return {hex: hex}
    },
    activeColor () {
      console.debug("Chrome.computed.activeColor")
      const rgba = this.colors.rgba
      return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')'
    },
    hasAlpha () {
      return this.colors.a < 1
    }
  },
  methods: {
    computeBackground (cmyk) {
      return {
        background: '#FFFFFF'
      }
    },
    convertRGBtoCMYK(rgb) {
      console.debug("Chrome.convertRGBtoCMYK")
      return this.convertRGB_to_CMYK(rgb);
    },
    convertCMYKtoRGBHEX(cmyk) {
      console.debug("Chrome.convertCMYKtoRGBHEX") 
      return this.convertCMYK_to_RGBHEX(cmyk);
    },
    childChange (data) {
      console.debug("Chrome.childChange")
      this.colorChange(data)
    },
    selectType (type) {
      this.pickerType = type.target.value;
    },
    handlerCMYKClick (c) {
      this.pick = c.name;
      this.colorChange({
        cmyk: c.cmyk,
        source: 'cmyk'
      })
    },
    handlerRegClick (c) {
      this.pick = c.name;
      this.colorChange({
        cmyk: c.cmyk,
        source: 'cmyk'
      })
    },
    inputChange (data) {
      console.debug("Chrome.inputChange")
      this.pick = 'none'
      if (!data) {
        return
      }
      if (data.c || data.m || data.y || data.k) {  
        console.debug("CMYK: " + this.cmyk.c + ", " + this.cmyk.m + ", " + 
                        this.cmyk.y + ", " + this.cmyk.k);
        console.debug("data CMYK: " + data.c + ", " + data.m + ", " + 
                        data.y + ", " + data.k)
        var locCMYK = { cmyk: {
            c: data.c || this.cmyk.c,
            m: data.m || this.cmyk.m,
            y: data.y || this.cmyk.y,
            k: data.k || this.cmyk.k,
            source: "cmyk"
          }
        }
        console.debug("locCMYK: " + locCMYK.cmyk.c + ", " + locCMYK.cmyk.m + ", " + 
                        locCMYK.cmyk.y + ", " + locCMYK.cmyk.k)
        //var cmyk = this.convertRGBtoCMYK(this.color.rgba);
        this.colorChange(locCMYK)
      }
    },
    showHighlight () {
      this.highlight = true
    },
    hideHighlight () {
      this.highlight = false
    }
  }
}
</script>

<style>
.vc-chrome {
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 0 2px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.3);
  box-sizing: initial;
  width: 225px;
  font-family: Menlo;
  background-color: #fff;
}
.vc-chrome-boxes {
  padding-top: 5px;
  padding-left: 5px;
  width: 225px;
  border-radius: 2px;
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(0,0,0,.12), 0 2px 5px rgba(0,0,0,.16);
  background-color: #fff;
}
.vc-chrome-colors {
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.vc-chrome-controls {
  display: flex;
}
.vc-chrome-active-color {
  position: center;
  width: 45px;
  height: 45px;
  border-radius: 15px;
  overflow: hidden;
  z-index: 1;
}
.vc-chrome-color-wrap .vc-checkerboard {
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-size: auto;
}
.vc-chrome-sliders {
  flex: 1;
}
.vc-chrome-fields-wrap {
  display: flex;
  padding-top: 16px;
}
.vc-chrome-fields {
  display: flex;
  margin-left: -6px;
  flex: 1;
}
.vc-chrome-field {
  padding-left: 6px;
  width: 100%;
}
.vc-chrome-toggle-btn {
  width: 32px;
  text-align: right;
  position: relative;
}
.vc-chrome-toggle-icon {
  margin-right: -4px;
  margin-top: 12px;
  cursor: pointer;
  position: relative;
  z-index: 2;
}
.vc-chrome-toggle-icon-highlight {
  position: absolute;
  width: 24px;
  height: 28px;
  background: #eee;
  border-radius: 4px;
  top: 10px;
  left: 12px;
}
.vc-chrome-hue-wrap {
  position: relative;
  height: 10px;
  margin-bottom: 8px;
}
.vc-chrome-alpha-wrap {
  position: relative;
  height: 10px;
}
.vc-chrome-hue-wrap .vc-hue {
  border-radius: 2px;
}
.vc-chrome-alpha-wrap .vc-alpha-gradient {
  border-radius: 2px;
}
.vc-chrome-hue-wrap .vc-hue-picker, .vc-chrome-alpha-wrap .vc-alpha-picker {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  transform: translate(-6px, -2px);
  background-color: rgb(248, 248, 248);
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.37);
}
.vc-chrome-body {
  padding: 16px 16px 12px;
  background-color: #fff;
}
.vc-chrome-saturation-wrap {
  width: 100%;
  padding-bottom: 55%;
  position: relative;
  border-radius: 2px 2px 0 0;
  overflow: hidden;
}
.vc-chrome-saturation-wrap .vc-saturation-circle {
  width: 12px;
  height: 12px;
}

.vc-chrome-fields .vc-input__input {
  font-size: 11px;
  color: #333;
  width: 100%;
  border-radius: 2px;
  border: none;
  box-shadow: inset 0 0 0 1px #dadada;
  height: 21px;
  text-align: center;
}
.vc-chrome-fields .vc-input__label {
  text-transform: uppercase;
  font-size: 11px;
  line-height: 11px;
  color: #969696;
  text-align: center;
  display: block;
  margin-top: 12px;
}

.vc-chrome__disable-alpha .vc-chrome-active-color {
  width: 18px;
  height: 18px;
}
.vc-chrome__disable-alpha .vc-chrome-color-wrap {
  width: 30px;
}
.vc-chrome__disable-alpha .vc-chrome-hue-wrap {
  margin-top: 4px;
  margin-bottom: 4px;
}



.vc-compact {
  padding-top: 5px;
  padding-left: 5px;
  width: 245px;
  border-radius: 2px;
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(0,0,0,.12), 0 2px 5px rgba(0,0,0,.16);
  background-color: #fff;
}
.vc-compact-colors {
  overflow: hidden;
  padding: 0;
  margin: 0;
}
.vc-compact-color-item {
  list-style: none;
  width: 15px;
  height: 15px;
  float: left;
  margin-right: 5px;
  margin-bottom: 5px;
  position: relative;
  cursor: pointer;
}
.vc-compact-color-item--white {
  box-shadow: inset 0 0 0 1px #ddd;
}
.vc-compact-color-item--white .vc-compact-dot {
  background: #000;
}

.vc-compact-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  bottom: 5px;
  left: 5px;
  border-radius: 50%;
  opacity: 1;
  background: #fff;
}

</style>
