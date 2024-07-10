import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Create Schema
const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  creatorId: {
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
        snapShotId: {
          type: String,
          required: false,
        },
        name: {
          type: String,
          required: true,
        },
        created: {
          type: Boolean,
          required: false,
          default: false,
        },
        followers: {
          type: [String],
          required: false,
        },
        contributions: {
          type: [
            {
              userId: {
                type: String,
                required: true,
              },
              tracks: {
                type: [String],
                required: false,
              },
            },
          ],
          required: false,
        },
      },
    ],
    required: false,
  },
  settings: {
    type: {
      songsPerMember: {
        type: Number,
        required: false,
        default: 5,
      },
      enabled: {
        type: Boolean,
        required: false,
        default: true,
      },
    },
    required: false,
    default: {
      songsPerMember: 5,
      enabled: true,
    },
  },
});

const Group = mongoose.model("groups", GroupSchema);
export default Group;
