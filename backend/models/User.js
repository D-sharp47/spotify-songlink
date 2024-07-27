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
  refreshToken: {
    type: String,
    required: false,
  },
  friends: {
    type: [
      {
        friendId: {
          type: String,
          required: true,
        },
        friendName: {
          type: String,
          required: true,
        },
        friendProfileImages: {
          type: [
            {
              type: Schema.Types.Mixed,
            },
          ],
          required: false,
        },
        status: {
          type: String,
          enum: ["req_out", "req_in", "friends"],
          required: true,
        },
      },
    ],
    required: false,
  },
  groups: {
    type: [
      {
        id: {
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
    required: false,
  },
  topSongs: {
    type: {
      short_term: {
        type: {
          created: {
            type: Boolean,
            required: true,
            default: false,
          },
          playlistId: {
            type: String,
            required: true,
          },
        },
        required: false,
      },
      medium_term: {
        type: {
          created: {
            type: Boolean,
            required: true,
            default: false,
          },
          playlistId: {
            type: String,
            required: true,
          },
        },
        required: false,
      },
      long_term: {
        type: {
          created: {
            type: Boolean,
            required: true,
            default: false,
          },
          playlistId: {
            type: String,
            required: true,
          },
        },
        required: false,
      },
    },
    required: false,
  },
  settings: {
    type: {
      autoUnfollowPlaylistsOnCreate: {
        type: Boolean,
        required: true,
      },
      autoUnfollowPlaylistsOnLeave: {
        type: Boolean,
        required: true,
      },
    },
    required: true,
    default: {
      autoUnfollowPlaylistsOnCreate: true,
      autoUnfollowPlaylistsOnLeave: false,
    },
  },
});

const User = mongoose.model("users", UserSchema);
export default User;
