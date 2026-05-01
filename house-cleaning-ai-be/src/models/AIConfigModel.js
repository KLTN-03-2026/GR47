import mongoose from 'mongoose';

const AIConfigSchema = new mongoose.Schema({
    Base_Price: {
        type: Number,
        required: true,
        default: 20000
    },
    Medium_Factor: {
        type: Number,
        required: true,
        default: 1.2
    },
    High_Factor: {
        type: Number,
        required: true,
        default: 1.5
    },
    Is_Active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

AIConfigSchema.pre('save', async function () {
    if (this.Is_Active) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { $set: { Is_Active: false } }
        );
    }
});

export default mongoose.model('AI_Config', AIConfigSchema);