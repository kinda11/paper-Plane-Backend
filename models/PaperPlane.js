// Import required modules
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema } = mongoose;

// Custom pagination labels
const myCustomLabels = {
  totalDocs: "itemCount",
  docs: "data",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
};

// Set custom labels for mongoose-paginate
mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

// Define the schema
const schema = new Schema(
  {
    fullName: { type: String },
    userEmail: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address",
      },
    },
    age: { type: Number },
    totalCoins: { type: Number },
    remainingCoins: { type: Number },
    redeemed: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Modify the toJSON method
schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  return object;
});

// Apply pagination plugin
schema.plugin(mongoosePaginate);

// Export the model
const PaperPlane = mongoose.model("PaperPlane", schema);
export default PaperPlane;
