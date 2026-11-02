import mongoose from 'mongoose';
import User from '../models/userModel.js';

const entrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const Entry = mongoose.model('Entry', entrySchema);



export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAll = async () => Entry.find().lean();

export const findByEmail = async (email) => User.findOne({ email }).lean();

export const findById = async (id) => User.findById(id).lean();

export const create = async (data) => (await User.create(data)).toObject();

export const updateById = async (id, data) =>
  Entry.findByIdAndUpdate(id, data, { new: true }).lean();

export const removeById = async (id) => {
  await Entry.findByIdAndDelete(id);
};
