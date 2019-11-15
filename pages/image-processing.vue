<template>
  <div>
    <b-row>
      <b-col md="6">
        <b-form-select
          v-model="method"
          class="my-3"
          :options="methods">
          <template slot="first">
            <option value="null">
              Pilih Metode
            </option>
          </template>
        </b-form-select>
      </b-col>
      <b-col md="6">
        <template v-if="method === 'threshold'">
          <b-form-input
            v-model="thresholdValue"
            class="my-3"
            type="number"
            min="0"
            max="255" />
        </template>
        <template v-else-if="method === 'brightness'">
          <b-form-input
            v-model="brightnessValue"
            class="my-3"
            min="0"
            max="100"
            type="range"
            @change="process" />
          <div>
            <span>{{ brightnessValue }}</span>
          </div>
        </template>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <b-form-group label="Input">
          <b-form-file
            v-model="img"
            @change="onChange" />
        </b-form-group>
        <div class="w-100">
          <img
            :src="original"
            alt
            class="w-100"
            style="height:300px;object-fit:cover;">
        </div>
        <b-button
          variant="primary"
          class="float-right mt-3"
          @click="process">
          Proses
        </b-button>
      </b-col>
      <b-col md="6">
        <b-form-group label="Output">
          <div
            id="image"
            class="w-100 mt-5" />
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>
<script>
// import { toBase64 } from '@/utils/base64'
export default {
  data () {
    return {
      original       : null,
      base64         : null,
      img            : null,
      method         : null,
      thresholdValue : 0,
      brightnessValue: 0,
      methods        : [
        {
          text : 'Thresholding',
          value: 'threshold',
        },
        {
          text : 'Brightness',
          value: 'brightness',
        },
        {
          text : 'Grayscale',
          value: 'grayscale',
        },
        {
          text : 'Negative',
          value: 'invert',
        },
      ],
    }
  },
  methods: {
    getUrl (files) {
      try {
        return URL.createObjectURL(files)
      } catch (error) {
        console.error(error)
      }
    },
    getBase64 (files) {
      return new Promise((resolve, reject) => {
        const FR = new FileReader()

        FR.addEventListener('load', function () {
          resolve(FR.result)
        })

        FR.readAsDataURL(files)
      })
    },
    onChange (event) {
      const files   = event.target.files[0]
      this.original = this.getUrl(files)
    },
    process () {
      $('canvas').remove()

      const promise = this.getBase64(this.img)

      promise.then((response) => {
        if (this.method === 'threshold') this.threshold(response)
        else if (this.method === 'grayscale') this.grayscale(response)
        else if (this.method === 'brightness') this.brightness(response)
        else if (this.method === 'invert') this.invert(response)
      })
    },
    invert (base64) {
      const context = document.createElement('canvas').getContext('2d')
      const image   = new Image()

      image.addEventListener('load', function () {
        const width  = (context.canvas.width = image.width)
        const height = (context.canvas.height = image.height)

        context.drawImage(image, 0, 0, width, height)

        const data = context.getImageData(0, 0, width, height)

        for (let i = 0; i < data.data.length; i += 4) {
          data.data[i]     = 255 - data.data[i]
          data.data[i + 1] = 255 - data.data[i + 1]
          data.data[i + 2] = 255 - data.data[i + 2]
        }

        context.putImageData(data, 0, 0)
        document.querySelector('#image').append(context.canvas)
      })
      image.src = base64
    },
    brightness (base64) {
      const pixels  = this.brightnessValue
      const context = document.createElement('canvas').getContext('2d')
      const image   = new Image()

      image.addEventListener('load', function () {
        const width  = (context.canvas.width = image.width)
        const height = (context.canvas.height = image.height)

        context.drawImage(image, 0, 0, width, height)

        const data = context.getImageData(0, 0, width, height)
        let i      = 0

        if (pixels >= 0) {
          for (i = 0; i < data.data.length; i += 4) {
            data.data[i]     += 255 * (pixels / 100)
            data.data[i + 1] += 255 * (pixels / 100)
            data.data[i + 2] += 255 * (pixels / 100)
          }
        } else {
          for (i = 0; i < data.data.length; i += 4) {
            data.data[i]     -= pixels // Red
            data.data[i + 1] -= pixels // Green
            data.data[i + 2] -= pixels // Blue
          }
        }

        context.putImageData(data, 0, 0)
        document.querySelector('#image').append(context.canvas)
      })
      image.src = base64
    },
    threshold (base64) {
      const limit   = this.thresholdValue
      const context = document.createElement('canvas').getContext('2d')
      const image   = new Image()

      image.addEventListener('load', function () {
        const width  = (context.canvas.width = image.width)
        const height = (context.canvas.height = image.height)

        context.drawImage(image, 0, 0, width, height)

        const data = context.getImageData(0, 0, width, height)

        for (let i = 0; i < data.data.length; i += 4) {
          data.data[i] = data.data[i + 1] = data.data[i + 2]
            = data.data[i + 1] > limit ? 255 : 0
        }

        context.putImageData(data, 0, 0)
        document.querySelector('#image').append(context.canvas)
      })
      image.src = base64
    },
    grayscale (base64) {
      const context = document.createElement('canvas').getContext('2d')
      const image   = new Image()

      image.addEventListener('load', function () {
        const width  = (context.canvas.width = image.width)
        const height = (context.canvas.height = image.height)

        context.drawImage(image, 0, 0, width, height)

        const data = context.getImageData(0, 0, width, height)

        for (let i = 0; i < data.data.length; i += 4) {
          const avg = (data.data[i] = data.data[i + 1] = data.data[i + 2]) / 3

          data.data[i]     = avg
          data.data[i + 1] = avg
          data.data[i + 2] = avg
        }

        context.putImageData(data, 0, 0)
        document.querySelector('#image').append(context.canvas)
      })
      image.src = base64
    },
  },
}
</script>
