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
            min="-100"
            max="100"
            type="range"
            @change="process"
          />
          <div>
            <span>{{ brightnessValue }}</span>
          </div>
        </template>
        <template v-else-if="method === 'saturation'">
          <b-form-input
            v-model="saturationValue"
            class="my-3"
            min="-100"
            max="100"
            type="range"
            @change="process"
          />
          <div>
            <span>{{ saturationValue }}</span>
          </div>
        </template>
        <template v-else-if="method === 'vibrance'">
          <b-form-input
            v-model="vibranceValue"
            class="my-3"
            min="-100"
            max="100"
            type="range"
            @change="process"
          />
          <div>
            <span>{{ vibranceValue }}</span>
          </div>
        </template>
        <template v-else-if="method === 'sharpen'">
          <b-form-input
            v-model="sharpenValue"
            class="my-3"
            min="0"
            max="100"
            type="range"
            @change="process"
          />
          <div>
            <span>{{ sharpenValue }}</span>
          </div>
        </template>
        <template v-else-if="method === 'sepia'">
          <b-form-input
            v-model="sepiaValue"
            class="my-3"
            min="0"
            max="100"
            type="range"
            @change="process"
          />
          <div>
            <span>{{ sepiaValue }}</span>
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
        <div v-if="img">
          <b-button variant="danger" class="float-left mt-3" style="width:45%" @click="init">Remove</b-button>
          <b-button
            variant="primary"
            class="float-right mt-3"
            style="width:45%"
            @click="process"
          >Process</b-button>
        </div>
      </b-col>
      <b-col md="6">
        <b-form-group label="Output">
          <div id="image" class="w-100 mt-5">
            <canvas id="converted-canvas"></canvas>
          </div>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <div v-if="img" class="w-100 mt-3">
          <b-form-group label="Filter Histogram">
            <b-button variant="danger" @click="amplify('red')">Red</b-button>
            <b-button variant="success" @click="amplify('green')">Green</b-button>
            <b-button variant="primary" @click="amplify('blue')">Blue</b-button>
            <b-button variant="secondary" @click="amplify('blend')">Blend</b-button>
          </b-form-group>
        </div>
        <div class="w-100">
          <svg width="1" height="1" />
        </div>
      </b-col>
      <b-col md="6"></b-col>
    </b-row>
  </div>
</template>
<script>
import * as d3 from "d3";
import algorithm from "@/utils/algorithms";

export default {
  data() {
    return {
      original: null,
      base64: null,
      img: null,
      method: null,
      thresholdValue: 0,
      brightnessValue: 0,
      saturationValue: 0,
      vibranceValue: 0,
      sharpenValue: 0,
      sepiaValue: 0,
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
        },
        {
          text: "Saturation",
          value: "saturation"
        },
        {
          text: "Vibrance",
          value: "vibrance"
        },
        {
          text: "Sharpening",
          value: "sharpen"
        },
        {
          text: "Sepia",
          value: "sepia"
        }
      ]
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      $("g").remove();
      const canvas = document.getElementById("original-canvas");
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
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
        img.src = reader.result; //File dalam bentuk base64
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
      this.histogram({ pixelSum, rD, gD, bD });
    },
    histogram(data) {
      let yAxis = false;
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
      q.style.width = "100%";
      q.style.height = H;

      if (yAxis) {
        d3.selectAll("g.y-axis").remove();
        yAxis = false;
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
        if (!yAxis) {
          yAxis = true;
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
    amplify(e) {
      let activeColor = "red";
      const colors = ["red", "green", "blue"];
      const boost = e;
      if (boost == "blend") {
        document.querySelectorAll("rect").forEach(bar => {
          bar.style.opacity = 0.7;
        });
      } else {
        activeColor = boost;
        const deaden = colors.filter(e => e !== boost);
        document.querySelectorAll(".bar-" + boost).forEach(bar => {
          bar.style.opacity = 1.0;
        });
        deaden.forEach(color => {
          document.querySelectorAll(".bar-" + color).forEach(bar => {
            bar.style.opacity = 0.2;
          });
        });
      }
    },
    process() {
      const promise = this.getBase64(this.img);

      promise.then(response => {
        if (this.method === "threshold")
          algorithm.threshold(response, this.thresholdValue);
        else if (this.method === "grayscale") algorithm.grayscale(response);
        else if (this.method === "brightness")
          algorithm.brightness(response, this.brightnessValue);
        else if (this.method === "invert") algorithm.invert(response);
        else if (this.method === "saturation")
          algorithm.saturation(response, this.saturationValue);
        else if (this.method === "sharpen")
          algorithm.sharphening(response, this.sharpenValue);
        else if (this.method === "vibrance")
          algorithm.vibrance(response, this.vibranceValue);
        else if (this.method === "sepia")
          algorithm.sepia(response, this.sepiaValue);
      });
    }
  }
};
</script>
