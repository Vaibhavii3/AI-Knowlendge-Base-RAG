const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 0
  }
});

metricSchema.statics.increment = function (key) {
  return this.findOneAndUpdate(
    { key },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model("Metric", metricSchema);
