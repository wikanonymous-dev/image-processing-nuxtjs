const algorithm = {
  invert(base64) {
    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
      const width = (context.canvas.width = image.width);
      const height = (context.canvas.height = image.height);

      context.drawImage(image, 0, 0, width, height);

      const data = context.getImageData(0, 0, width, height);
      console.log(data)

      for (let i = 0; i < data.data.length; i += 4) {
        data.data[i] = 255 - data.data[i];
        data.data[i + 1] = 255 - data.data[i + 1];
        data.data[i + 2] = 255 - data.data[i + 2];
      }

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  },
  brightness(base64, value) {
    let pixels = value;
    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
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
          pixels = Math.abs(pixels)
          data.data[i] -= pixels;
          data.data[i + 1] -= pixels;
          data.data[i + 2] -= pixels;
        }
      }

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  },
  threshold(base64, value) {
    const limit = value;
    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
      const width = (context.canvas.width = image.width);
      const height = (context.canvas.height = image.height);

      context.drawImage(image, 0, 0, width, height);

      const data = context.getImageData(0, 0, width, height);

      for (let i = 0; i < data.data.length; i += 4) {
        data.data[i] = data.data[i + 1] = data.data[i + 2] =
          data.data[i + 1] > limit ? 255 : 0;
        //data.data[i] => Red
        //data.data[i+1] => Green
        //data.data[i+2] => Blue
      }

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  },
  grayscale(base64) {
    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
      const width = (context.canvas.width = image.width);
      const height = (context.canvas.height = image.height);

      context.drawImage(image, 0, 0, width, height);

      const data = context.getImageData(0, 0, width, height);
      console.log(data)

      for (let i = 0; i < data.data.length; i += 4) {
        const avg = (data.data[i] = data.data[i + 1] = data.data[i + 2]) / 3;

        data.data[i] = avg;
        data.data[i + 1] = avg;
        data.data[i + 2] = avg;
      }

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  },
  saturation(base64, value) {
    let pixels = value;
    pixels *= -0.01

    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
      const width = (context.canvas.width = image.width);
      const height = (context.canvas.height = image.height);

      context.drawImage(image, 0, 0, width, height);

      const data = context.getImageData(0, 0, width, height);
      let i = 0;
      for (i = 0; i < data.data.length; i += 4) {
        var max = Math.max(data.data[i], data.data[i + 1], data.data[i + 2])
        if (data.data[i] !== max) data.data[i] += (max - data.data[i]) * pixels
        if (data.data[i + 1] !== max) data.data[i + 1] += (max - data.data[i + 1]) * pixels
        if (data.data[i + 1] !== max) data.data[i + 2] += (max - data.data[i + 2]) * pixels
      }

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  },
  sharphening(base64, value = 100) {
    let amt = value
    amt /= 100

    let kernel = [0, -amt, 0, -amt, (4 * amt + 1), -amt, 0, -amt, 0]
    let katet = Math.round(Math.sqrt(kernel.length))
    let half = (katet * 0.5) | 0

    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
      const width = (context.canvas.width = image.width);
      const height = (context.canvas.height = image.height);

      context.drawImage(image, 0, 0, width, height);

      const data = context.getImageData(0, 0, width, height);
      let i = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0
      for (i = 0; i < kernel.length; i += 4) {
        sumR += data.data[i] * kernel[i]
        sumG += data.data[i + 1] * kernel[i]
        sumB += data.data[i + 2] * kernel[i]
      }

      if (sumR < 0) sumR *= -1
      if (sumG < 0) sumG *= -1
      if (sumB < 0) sumB *= -1

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  },
  vibrance(base64, value) {
    let adjust = value
    adjust *= -1

    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
      const width = (context.canvas.width = image.width);
      const height = (context.canvas.height = image.height);

      context.drawImage(image, 0, 0, width, height);

      const data = context.getImageData(0, 0, width, height);
      let i = 0;
      for (i = 0; i < data.data.length; i += 4) {
        var max = Math.max(data.data[i], data.data[i + 1], data.data[i + 2])
        var avg = (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3
        var amt = ((Math.abs(max - avg) * 2 / 255) * adjust) / 100


        if (data.data[i] !== max) data.data[i] += (max - data.data[i]) * amt
        if (data.data[i + 1] !== max) data.data[i + 1] += (max - data.data[i + 1]) * amt
        if (data.data[i + 1] !== max) data.data[i + 2] += (max - data.data[i + 2]) * amt
      }

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  },
  sepia(base64, value = 100) {
    let adjust = value
    adjust /= 100

    const context = document
      .getElementById("converted-canvas")
      .getContext("2d");
    const image = new Image();

    image.addEventListener("load", function () {
      const width = (context.canvas.width = image.width);
      const height = (context.canvas.height = image.height);

      context.drawImage(image, 0, 0, width, height);

      const data = context.getImageData(0, 0, width, height);
      let i = 0;
      for (i = 0; i < data.data.length; i += 4) {
        data.data[i] = Math.min(255, (data.data[i] * (1 - (0.607 * adjust))) + (data.data[i + 1] * (0.769 * adjust)) + (data.data[i + 2] * (0.189 * adjust)))
        data.data[i + 1] = Math.min(255, (data.data[i] * (0.349 * adjust)) + (data.data[i + 1] * (1 - (0.314 * adjust))) + (data.data[i + 2] * (0.168 * adjust)))
        data.data[i + 2] = Math.min(255, (data.data[i] * (0.272 * adjust)) + (data.data[i + 1] * (0.534 * adjust)) + (data.data[i + 2] * (1 - (0.869 * adjust))))
      }

      context.putImageData(data, 0, 0);
    });
    image.src = base64;
  }
}

export default algorithm
