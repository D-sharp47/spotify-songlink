import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  _json: {
    display_name: {
      type: String,
      required: true,
    },
    external_urls: {
      spotify: {
        type: String,
        required: true,
      },
    },
    href: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    images: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    type: {
      type: String,
      required: true,
    },
    uri: {
      type: String,
      required: true,
    },
    followers: {
      href: String,
      total: {
        type: Number,
        required: true,
      },
    },
  },
  friends: {
    type: [String],
    required: false,
  },
});

const User = mongoose.model("users", UserSchema);
export default User;
