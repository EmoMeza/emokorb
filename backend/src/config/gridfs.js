import mongoose from "mongoose";

let bucket;

export const initGridFS = () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "boletas",
  });
};

export const getBucket = () => bucket;
