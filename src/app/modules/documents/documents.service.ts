import { Storage } from "@google-cloud/storage";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import Student from "../student/student.model";
import Remit from "../remit/remit.model";
import { User } from "../user/user.model";
import config from "../../config";


const storage = new Storage({
  keyFilename: "./work.json", // Update this path if necessary
  projectId: "vast-pride-453709-n7",
});
const bucketName = config.bucket as string; // Make sure this bucket exists

const bucket = storage.bucket(bucketName);

const UploadDocumentToGCS = async (file: any, payload: any) => {
  const { entityId, file_type,   } = payload;
  try {
    if (!file) throw new AppError(httpStatus.BAD_REQUEST, "No file provided");

    const fileName = `${Date.now()}-${file.originalname}`;
    const gcsFile = bucket.file(fileName);

    await new Promise((resolve, reject) => {
      const stream = gcsFile.createWriteStream({
        metadata: { contentType: file.mimetype }, // Set metadata to determine file type
      });

      stream.on("error", (err) => {
        console.error("Error during file upload:", err);
        reject(err);
      });

      stream.on("finish", async () => {
        try {
          // Make the file publicly accessible
          await gcsFile.makePublic();
          resolve(true);
        } catch (err) {
          console.error("Error making the file public:", err);
          reject(err);
        }
      });

      // Send the file buffer to GCS
      stream.end(file.buffer);
    });

    // Construct the public URL for the uploaded file
    const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    // Check file type and determine where to save the file URL
    if (file_type === "profile") {
      // For student profile, save to Student model
      const student = await Student.findById(entityId);
      if (!student) throw new AppError(httpStatus.NOT_FOUND, "Student not found");

      student.imageUrl = fileUrl; // Save the file URL
      await student.save();

      return { entityId, file_type, fileUrl };
    } else if (file_type === "userProfile") {
      const user = await User.findById(entityId); // Use remitId here instead of studentId
      if (!user) throw new AppError(httpStatus.NOT_FOUND, "profile not found");

      user.imgUrl = fileUrl; 
      await user.save();

      return { entityId, file_type, fileUrl };
    } else {
      // For other document types, add to Student model's documents array
      const student = await Student.findById(entityId);
      if (!student) throw new AppError(httpStatus.NOT_FOUND, "Student not found");

      student.documents.push({ file_type, fileUrl });
      await student.save();

      return { entityId, file_type, fileUrl };
    }
  } catch (error) {
    console.error("File upload failed:", error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
  }
};

export const UploadDocumentService = {
  UploadDocumentToGCS,
};
