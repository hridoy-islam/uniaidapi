import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { sendEmail as sendEmailUtil } from "../../utils/sendEmail";

const sendEmail = async (payload:any) => {
  const { emails, subject, body } = payload;
  try {
    const to = emails[0];
    const from = "admin@caretimer.co.uk";

    await sendEmailUtil(to, from, subject, body);
  } catch (error: any) {
    console.error("Error in sendEmail:", error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to send email");
  }
};

export const EmailServices = {
  sendEmail,
};
