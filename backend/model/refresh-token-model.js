const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        refreshToken: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
