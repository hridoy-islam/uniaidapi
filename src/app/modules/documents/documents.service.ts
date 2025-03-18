import { Storage } from "@google-cloud/storage";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import Student from "../student/student.model";


const storage = new Storage({
  keyFilename: "./vast-pride-453709-n7-31c7a3a936b1.json", // Update this path if necessary
  projectId: "vast-pride-453709-n7",
});
const bucketName = "uniaid"; // Make sure this bucket exists
const bucket = storage.bucket(bucketName);

const UploadDocumentToGCS = async (file: any, payload: any) => {
  const { studentId, file_type } = payload;

  try {
    if (!file) throw new AppError(httpStatus.BAD_REQUEST, "No file provided");

    // Generating a unique file name for the upload
    const fileName = `${Date.now()}-${file.originalname}`;
    const gcsFile = bucket.file(fileName);

    // Start the file upload process using streams
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

    // Find the student document by ID
    const student = await Student.findById(studentId);
    if (!student) throw new AppError(httpStatus.NOT_FOUND, "Student not found");

    // Handle file types (profile image or other documents)
    if (file_type == "profile") {
      student.imageUrl = fileUrl; // Save the file URL instead of the entire file object
    } else {
      student.documents.push({ file_type, fileUrl });
    }

    // Save the student document with the updated information
    await student.save();

    return { studentId, file_type, fileUrl };
  } catch (error) {
    console.error("File upload failed:", error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
  }
};

export const UploadDocumentService = {
  UploadDocumentToGCS,
};
