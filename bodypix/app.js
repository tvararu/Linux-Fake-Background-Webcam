const bodyPix = require("@tensorflow-models/body-pix");
const tf = require("@tensorflow/tfjs-node");
const http = require("http");
const PORT = process.env.PORT || 9000;

(async () => {
  const net = await bodyPix.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });

  const server = http.createServer();
  server.on("request", async (req, res) => {
    var chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", async () => {
      const image = tf.node.decodeImage(Buffer.concat(chunks));
      segmentation = await net.segmentPerson(image, {
        flipHorizontal: false,
        internalResolution: "medium",
        segmentationThreshold: 0.75,
      });
      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.write(Buffer.from(segmentation.data));
      res.end();
      tf.dispose(image);
    });
  });
  server.listen(PORT);
  console.log("Listening on http://localhost:%s", PORT);
})();
