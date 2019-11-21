<template>
  <div class="mb-5">
    <b-row>
      <b-col md="6">
        <b-form-select v-model="method" class="my-3" :options="methods">
          <template slot="first">
            <option value="null">Pilih Metode</option>
          </template>
        </b-form-select>
      </b-col>
      <b-col md="6">
        <template v-if="method === 'threshold'">
          <b-form-input v-model="thresholdValue" class="my-3" type="number" min="0" max="255" />
        </template>
        <template v-else-if="method === 'brightness'">
          <b-form-input
            v-model="brightnessValue"
            class="my-3"
            min="0"
            max="100"
            type="range"
            @change="process"
          />
          <div>
            <span>{{ brightnessValue }}</span>
          </div>
        </template>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <b-form-group label="Input">
          <b-form-file v-model="img" @change="onChange" />
        </b-form-group>
        <div class="w-100">
          <!-- <img :src="original" alt class="w-100" style="height:300px;object-fit:cover;" /> -->
          <canvas id="original-canvas"></canvas>
        </div>
        <b-button variant="primary" class="float-right mt-3 w-100" @click="process">Proses</b-button>
      </b-col>
      <b-col md="6">
        <b-form-group label="Output">
          <div id="image" class="w-100 mt-5">
            <canvas id="converted-canvas"></canvas>
          </div>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import * as d3 from "d3";
export default {
  data() {
    return {
      original: null,
      base64: null,
      img: null,
      method: null,
      thresholdValue: 0,
      brightnessValue: 0,
      yAxis: false,
      methods: [
        {
          text: "Thresholding",
          value: "threshold"
        },
        {
          text: "Brightness",
          value: "brightness"
        },
        {
          text: "Grayscale",
          value: "grayscale"
        },
        {
          text: "Negative",
          value: "invert"
        }
      ]
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.original = null;
      this.base64 = null;
      this.img = null;
      this.method = null;
    },
    getUrl(files) {
      try {
        return URL.createObjectURL(files);
      } catch (error) {
        console.error(error);
      }
    },
    getBase64(files) {
      return new Promise((resolve, reject) => {
        const FR = new FileReader();

        FR.addEventListener("load", function() {
          resolve(FR.result);
        });

        FR.readAsDataURL(files);
      });
    },
    onChange(event) {
      const files = event.target.files[0];
      this.original = this.getUrl(files);
      this.handleFile(files);
    },
    handleFile(files) {
      var that = this;
      var data = files;
      var img = new Image();
      var reader = new FileReader();

      reader.addEventListener("load", () => {
        img.src = reader.result;
      });

      if (data) reader.readAsDataURL(data);

      img.onload = function() {
        that.calcAndGraph(img);
      };
    },
    calcAndGraph(img) {
      let rD = {},
        gD = {},
        bD = {};
      let cv = document.getElementById("original-canvas");
      let ctx = cv.getContext("2d");
      cv.width = img.width;
      cv.height = img.height;
      ctx.drawImage(img, 0, 0);
      let pixelSum = {};
      const iD = ctx.getImageData(0, 0, cv.width, cv.height).data;
      for (var i = 0; i < 256; i++) {
        rD[i] = 0;
        gD[i] = 0;
        bD[i] = 0;
      }
      for (var i = 0; i <= 765; i++) {
        pixelSum[i] = 0;
      }
      for (var i = 0; i < iD.length; i += 4) {
        pixelSum[iD[i] + iD[i + 1] + iD[i + 2]]++;
        rD[iD[i]]++;
        gD[iD[i + 1]]++;
        bD[iD[i + 2]]++;
      }
      // this.histogram({ pixelSum, rD, gD, bD });
    },
    histogram(data) {
      let W = 800;
      let H = W / 1.8;

      const svg = d3.select("svg");
      const margin = {
        top: 20,
        bottom: 30,
        right: 20,
        left: 50
      };
      const width = W - margin.left - margin.right;
      const height = H - margin.top - margin.bottom;

      let q = document.querySelector("svg");
      q.style.width = W;
      q.style.height = H;

      if (this.yAxis) {
        d3.selectAll("g.y-axis").remove();
        this.yAxis = false;
      }
      function graphComponent(data, color) {
        d3.selectAll(".bar-" + color).remove();
        var data = Object.keys(data).map(function(key) {
          return { freq: data[key], idx: +key };
        });
        var x = d3
          .scaleLinear()
          .range([0, width])
          .domain([
            0,
            d3.max(data, function(d) {
              return d.idx;
            })
          ]);
        var y = d3
          .scaleLinear()
          .range([height, 0])
          .domain([
            0,
            d3.max(data, function(d) {
              return d.freq;
            })
          ]);
        var g = svg
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );
        if (!this.yAxis) {
          this.yAxis = true;
          g.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + -2 + ",0)")
            .call(
              d3
                .axisLeft(y)
                .ticks(10)
                .tickSizeInner(10)
                .tickSizeOuter(2)
            );
        }
        g.selectAll(".bar-" + color)
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "bar-" + color)
          .attr("fill", color)
          .attr("x", function(d) {
            return x(d.idx);
          })
          .attr("y", function(d) {
            return y(d.freq);
          })
          .attr("width", 2)
          .attr("opacity", 0.8)
          .attr("height", function(d) {
            return height - y(d.freq);
          });
      }
      graphComponent(data.gD, "green");
      graphComponent(data.bD, "blue");
      graphComponent(data.rD, "red");
    },
    process() {
      const promise = this.getBase64(this.img);

      promise.then(response => {
        if (this.method === "threshold") this.threshold(response);
        else if (this.method === "grayscale") this.grayscale(response);
        else if (this.method === "brightness") this.brightness(response);
        else if (this.method === "invert") this.invert(response);
      });
    },
    invert(base64) {
      const context = document
        .getElementById("converted-canvas")
        .getContext("2d");
      const image = new Image();

      image.addEventListener("load", function() {
        const width = (context.canvas.width = image.width);
        const height = (context.canvas.height = image.height);

        context.drawImage(image, 0, 0, width, height);

        const data = context.getImageData(0, 0, width, height);

        for (let i = 0; i < data.data.length; i += 4) {
          data.data[i] = 255 - data.data[i];
          data.data[i + 1] = 255 - data.data[i + 1];
          data.data[i + 2] = 255 - data.data[i + 2];
        }

        context.putImageData(data, 0, 0);
        // document.querySelector("#image").append(context.canvas);
      });
      image.src = base64;
    },
    brightness(base64) {
      const pixels = this.brightnessValue;
      const context = document
        .getElementById("converted-canvas")
        .getContext("2d");
      const image = new Image();

      image.addEventListener("load", function() {
        const width = (context.canvas.width = image.width);
        const height = (context.canvas.height = image.height);

        context.drawImage(image, 0, 0, width, height);

        const data = context.getImageData(0, 0, width, height);
        let i = 0;

        if (pixels >= 0) {
          for (i = 0; i < data.data.length; i += 4) {
            data.data[i] += 255 * (pixels / 100);
            data.data[i + 1] += 255 * (pixels / 100);
            data.data[i + 2] += 255 * (pixels / 100);
          }
        } else {
          for (i = 0; i < data.data.length; i += 4) {
            data.data[i] -= pixels; // Red
            data.data[i + 1] -= pixels; // Green
            data.data[i + 2] -= pixels; // Blue
          }
        }

        context.putImageData(data, 0, 0);
        // document.querySelector("#image").append(context.canvas);
      });
      image.src = base64;
    },
    threshold(base64) {
      const limit = this.thresholdValue;
      const context = document
        .getElementById("converted-canvas")
        .getContext("2d");
      const image = new Image();

      image.addEventListener("load", function() {
        const width = (context.canvas.width = image.width);
        const height = (context.canvas.height = image.height);

        context.drawImage(image, 0, 0, width, height);

        const data = context.getImageData(0, 0, width, height);

        for (let i = 0; i < data.data.length; i += 4) {
          data.data[i] = data.data[i + 1] = data.data[i + 2] =
            data.data[i + 1] > limit ? 255 : 0;
        }

        context.putImageData(data, 0, 0);
        // document.querySelector("#image").append(context.canvas);
      });
      image.src = base64;
    },
    grayscale(base64) {
      const context = document
        .getElementById("converted-canvas")
        .getContext("2d");
      const image = new Image();

      image.addEventListener("load", function() {
        const width = (context.canvas.width = image.width);
        const height = (context.canvas.height = image.height);

        context.drawImage(image, 0, 0, width, height);

        const data = context.getImageData(0, 0, width, height);

        for (let i = 0; i < data.data.length; i += 4) {
          const avg = (data.data[i] = data.data[i + 1] = data.data[i + 2]) / 3;

          data.data[i] = avg;
          data.data[i + 1] = avg;
          data.data[i + 2] = avg;
        }

        context.putImageData(data, 0, 0);
        // document.querySelector("#image").append(context.canvas);
      });
      image.src = base64;
    }
  }
};
</script>
