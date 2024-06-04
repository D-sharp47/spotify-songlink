import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Create Schema
const GroupSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  members: {
    type: [
      {
        userId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["invited", "member", "admin"],
          required: true,
        },
      },
    ],
  },
  playlists: {
    type: [
      {
        playlistId: {
          type: String,
          required: false,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    required: false,
  },
  setting: {
    type: {
      songsPerMember: {
        type: Number,
        default: 5,
        required: true,
      },
      enabled: {
        type: Boolean,
        default: true,
        required: true,
      },
    },
  },
});

const Group = mongoose.model("groups", GroupSchema);
export default Group;
