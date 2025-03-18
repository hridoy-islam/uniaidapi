import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { sendEmail as sendEmailUtil } from "../../utils/sendEmail";
import emailConfig from "../email-configs/email-configs.model";
import Student from "../student/student.model";
 

const sendEmail = async (payload: any) => {
  const { emails, subject, body, emailConfigId } = payload;

  try {

    const EmailConfig = await emailConfig.findById(emailConfigId);
    if (!EmailConfig || !EmailConfig.email) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid emailConfigId or sender email not found");
    }
    if (!emails?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Recipient emails are missing");
    }

  
    const from = EmailConfig.email;
    const host = EmailConfig.host;
    const port = EmailConfig.port;
    const secure = EmailConfig.authentication;

    const to = emails[0];

    // const username = studentId.name;

    await sendEmailUtil(to, from, subject, body, host, port,secure);
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
