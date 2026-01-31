import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema(
  {
    profileId: {
      type: String,
      required: true,
      unique: true
    },

    onboarding: {
      comprehensionBreak: {
        type: String,
        enum: [
          "miss_key_terms",
          "lose_connection",
          "forget_steps",
          "overwhelmed_speed",
          "cant_retain"
        ],
        required: true
      },

      learningPreference: {
        type: String,
        enum: [
          "simple_words",
          "examples",
          "step_by_step",
          "visuals"
        ],
        required: true
      },

      struggleNote: {
        type: String,
        default: ""
      }
    },

    uiPreferences: {
      font: {
        type: String,
        default: "Atkinson Hyperlegible"
      },
      fontSize: {
        type: String,
        default: "medium"
      },
      colorMode: {
        type: String,
        default: "light"
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", UserProfileSchema);
