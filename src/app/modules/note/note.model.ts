import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import { TNote } from "./note.interface";

const CommentSchema = new Schema({
  user: { type: Types.ObjectId, ref: "User" }, 
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }, 
});

const NoteSchema = new Schema(
  {
    student: { type: Types.ObjectId, ref: "Student" }, 
    note: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User" }, 
    createdAt: { type: Date, default: Date.now }, 
    followUpBy: [{ type: Types.ObjectId, ref: "User" }], 
    comment: {type:[CommentSchema], default:[]}, 
    isFollowUp: {type: Boolean, default: false},
    status:{type: String , enum:["pending","complete","done"], default:"pending"}
  },

);

const Note = mongoose.model<TNote & Document>(
  "Note",
  NoteSchema
);
export default Note;
