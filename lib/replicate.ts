const Replicate = require("replicate");

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});