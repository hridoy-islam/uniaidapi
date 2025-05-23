import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { courseRelationSearchableFields } from "./courseRelation.constant";
import { TCourseRelation } from "./courseRelation.interface";
import CourseRelation from "./courseRelation.model";
import Student from "../student/student.model";
import mongoose, { Types } from "mongoose";
import AgentCourse from "../agent-course/agentCourse.model";

const createCourseRelationIntoDB = async (payload: TCourseRelation) => {
  try {
    const existingCourse = await CourseRelation.findOne({
      term: payload.term,
      course: payload.course,
      institute: payload.institute,
    });

    if (existingCourse) {
      throw new AppError(httpStatus.BAD_REQUEST, "This Course already exists");
    }

    const result = await CourseRelation.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createCourseRelationIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Category"
    );
  }
};

const getAllCourseRelationFromDB = async (query: Record<string, unknown>) => {
  const CourseRelationQuery = new QueryBuilder(
    CourseRelation.find()
      .populate("institute")
      .populate("course")
      .populate("term"),
    query
  )
    .search(courseRelationSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await CourseRelationQuery.countTotal();
  const result = await CourseRelationQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleCourseRelationFromDB = async (id: string) => {
  const result = await CourseRelation.findById(id)
    .populate("institute")
    .populate("course")
    .populate("term");
  return result;
};

// const updateCourseRelationIntoDB = async (id: string, payload: Partial<TCourseRelation>) => {
//   const courseRelation = await CourseRelation.findById(id);

//   if (!courseRelation) {
//     throw new AppError(httpStatus.NOT_FOUND, "CourseRelation not found");
//   }

//   const result = await CourseRelation.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   });

//   return result;
// };

const updateCourseRelationIntoDB = async (
  id: string,
  payload: Partial<TCourseRelation>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if course relation exists
    const courseRelation = await CourseRelation.findById(id).session(session);

    if (!courseRelation) {
      throw new AppError(httpStatus.NOT_FOUND, "CourseRelation not found");
    }

    // Track if Year 1 sessions are being updated
    let year1Updated = false;
    let year1Sessions: Array<{ sessionName: string; invoiceDate: Date }> = [];

    if (payload.years) {
      const existingYears = courseRelation.years.map((year) => ({
        _id: year._id,
        year: year.year,
        sessions: year.sessions.map((session) => ({
          _id: session._id,
          sessionName: session.sessionName,
          invoiceDate: session.invoiceDate,
          type: session.type,
          rate: session.rate,
          status: session.status,
        })),
      }));

      // Process the new years in the payload
      payload.years.forEach((newYear) => {
        const existingYearIndex = existingYears.findIndex(
          (y) => y.year === newYear.year
        );

        if (existingYearIndex !== -1) {
          // If the year exists, merge sessions
          const existingSessions = existingYears[existingYearIndex].sessions;

          newYear.sessions?.forEach((newSession) => {
            const existingSessionIndex = existingSessions.findIndex(
              (s) => s.sessionName === newSession.sessionName
            );

            if (existingSessionIndex !== -1) {
              // Check if invoiceDate is being updated for Year 1
              if (
                newYear.year === "Year 1" &&
                newSession.invoiceDate &&
                existingSessions[existingSessionIndex].invoiceDate !==
                  newSession.invoiceDate
              ) {
                year1Updated = true;
              }

              // Update the session if it exists
              existingSessions[existingSessionIndex] = {
                _id: existingSessions[existingSessionIndex]._id,
                sessionName:
                  newSession.sessionName ||
                  existingSessions[existingSessionIndex].sessionName,
                invoiceDate:
                  newSession.invoiceDate ||
                  existingSessions[existingSessionIndex].invoiceDate,
                type:
                  newSession.type ||
                  existingSessions[existingSessionIndex].type,
                rate:
                  newSession.rate ||
                  existingSessions[existingSessionIndex].rate,
                status:
                  newSession.status ||
                  existingSessions[existingSessionIndex].status,
              };
            } else {
              // If session doesn't exist, add it
              existingSessions.push({
                _id: new Types.ObjectId(),
                sessionName: newSession.sessionName,
                invoiceDate: newSession.invoiceDate,
                type: newSession.type,
                rate: newSession.rate,
                status: newSession.status,
              });

              // Track if we're adding to Year 1
              if (newYear.year === "Year 1") {
                year1Updated = true;
              }
            }
          });
        } else {
          // If the year doesn't exist, add it
          existingYears.push({
            _id: new Types.ObjectId(),
            year: newYear.year,
            sessions:
              newYear.sessions?.map((session) => ({
                _id: new Types.ObjectId(),
                sessionName: session.sessionName,
                invoiceDate: session.invoiceDate,
                type: session.type,
                rate: session.rate,
                status: session.status,
              })) || [],
          });

          // Track if we're adding Year 1
          if (newYear.year === "Year 1") {
            year1Updated = true;
          }
        }

        // Store Year 1 sessions if this is Year 1
        if (newYear.year === "Year 1") {
          year1Sessions =
            existingYears[existingYearIndex]?.sessions?.map((s) => ({
              sessionName: s.sessionName,
              invoiceDate: s.invoiceDate,
            })) || [];
        }
      });

      payload.years = existingYears;
    }

    const result = await CourseRelation.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });

    // Update related students, agent courses, and agent payments (Year 1 only)
    if (payload.years) {
      // Update students
      const students = await Student.find({
        $or: [
          { "accounts.courseRelationId": id },
          { "agentPayments.courseRelationId": id },
        ],
      }).session(session);

      const studentUpdatePromises = students.map(async (student) => {
        let isModified = false;

        // Update accounts (can include all years)
        const accountIndex = student.accounts.findIndex(
          (acc) => acc.courseRelationId.toString() === id
        );

        if (accountIndex !== -1) {
          const existingAccountYears = student.accounts[accountIndex].years.map(
            (year) => ({
              _id: year._id || new Types.ObjectId(),
              year: year.year,
              sessions:
                year.sessions?.map((session) => ({
                  _id: session._id || new Types.ObjectId(),
                  sessionName: session.sessionName,
                  invoiceDate: session.invoiceDate,
                  type: session.type,
                  rate: session.rate,
                  status: session.status,
                })) || [],
            })
          );

          payload.years?.forEach((newYear) => {
            const existingYearIndex = existingAccountYears.findIndex(
              (y) => y.year === newYear.year
            );

            if (existingYearIndex !== -1) {
              const existingSessions =
                existingAccountYears[existingYearIndex].sessions;

              newYear.sessions?.forEach((newSession) => {
                const existingSessionIndex = existingSessions.findIndex(
                  (s) => s.sessionName === newSession.sessionName
                );

                if (existingSessionIndex !== -1) {
                  existingSessions[existingSessionIndex] = {
                    _id: existingSessions[existingSessionIndex]._id,
                    sessionName:
                      newSession.sessionName ||
                      existingSessions[existingSessionIndex].sessionName,
                    invoiceDate:
                      newSession.invoiceDate ||
                      existingSessions[existingSessionIndex].invoiceDate,
                    type:
                      newSession.type ||
                      existingSessions[existingSessionIndex].type,
                    rate:
                      newSession.rate ||
                      existingSessions[existingSessionIndex].rate,
                    status:
                      newSession.status ||
                      existingSessions[existingSessionIndex].status,
                  };
                } else {
                  existingSessions.push({
                    _id: new Types.ObjectId(),
                    sessionName: newSession.sessionName,
                    invoiceDate: newSession.invoiceDate,
                    type: newSession.type,
                    rate: newSession.rate,
                    status: newSession.status,
                  });
                }
              });
            } else {
              existingAccountYears.push({
                _id: new Types.ObjectId(),
                year: newYear.year,
                sessions:
                  newYear.sessions?.map((session) => ({
                    _id: new Types.ObjectId(),
                    sessionName: session.sessionName,
                    invoiceDate: session.invoiceDate,
                    type: session.type,
                    rate: session.rate,
                    status: session.status,
                  })) || [],
              });
            }
          });

          student.accounts[accountIndex].years = existingAccountYears;
          isModified = true;
        }

        // Update agentPayments (Year 1 only)
        const paymentIndex = student.agentPayments.findIndex(
          (payment) => payment.courseRelationId.toString() === id
        );

        if (paymentIndex !== -1) {
          // Get only Year 1 data from payload
          const year1Data = payload.years?.find((y) => y.year === "Year 1");

          if (year1Data) {
            const existingPaymentYears = student.agentPayments[
              paymentIndex
            ].years.map((year) => ({
              _id: year._id || new Types.ObjectId(),
              year: year.year,
              sessions:
                year.sessions?.map((session) => ({
                  _id: session._id || new Types.ObjectId(),
                  sessionName: session.sessionName,
                  invoiceDate: session.invoiceDate,
                  type: session.type,
                  rate: session.rate,
                  status: session.status,
                })) || [],
            }));

            const existingYearIndex = existingPaymentYears.findIndex(
              (y) => y.year === "Year 1"
            );

            if (existingYearIndex !== -1) {
              const existingSessions =
                existingPaymentYears[existingYearIndex].sessions;

              year1Data.sessions?.forEach((newSession) => {
                const existingSessionIndex = existingSessions.findIndex(
                  (s) => s.sessionName === newSession.sessionName
                );

                if (existingSessionIndex !== -1) {
                  existingSessions[existingSessionIndex] = {
                    _id: existingSessions[existingSessionIndex]._id,
                    sessionName:
                      newSession.sessionName ||
                      existingSessions[existingSessionIndex].sessionName,
                    invoiceDate:
                      newSession.invoiceDate ||
                      existingSessions[existingSessionIndex].invoiceDate,
                    type:
                      newSession.type ||
                      existingSessions[existingSessionIndex].type,
                    rate:
                      newSession.rate ||
                      existingSessions[existingSessionIndex].rate,
                    status:
                      newSession.status ||
                      existingSessions[existingSessionIndex].status,
                  };
                } else {
                  existingSessions.push({
                    _id: new Types.ObjectId(),
                    sessionName: newSession.sessionName,
                    invoiceDate: newSession.invoiceDate,
                    type: newSession.type,
                    rate: newSession.rate,
                    status: newSession.status,
                  });
                }
              });
            } else {
              existingPaymentYears.push({
                _id: new Types.ObjectId(),
                year: "Year 1",
                sessions:
                  year1Data.sessions?.map((session) => ({
                    _id: new Types.ObjectId(),
                    sessionName: session.sessionName,
                    invoiceDate: session.invoiceDate,
                    type: session.type,
                    rate: session.rate,
                    status: session.status,
                  })) || [],
              });
            }

            // Ensure we only have Year 1 in agentPayments
            student.agentPayments[paymentIndex].years =
              existingPaymentYears.filter((y) => y.year === "Year 1");
            isModified = true;
          }
        }

        if (isModified) {
          try {
            await student.save({ session });
          } catch (error) {
            if (error.name === "ValidationError") {
              console.error(
                "Validation error when saving student:",
                error.message
              );
              // Handle validation errors specifically for agentPayments
              if (error.errors?.agentPayments) {
                // Remove any non-Year 1 data that might have slipped through
                student.agentPayments.forEach((payment) => {
                  payment.years = payment.years.filter(
                    (y) => y.year === "Year 1"
                  );
                });
                await student.save({ session }); // Try saving again
              }
            } else {
              throw error;
            }
          }
        }
      });

      // console.log(year1Sessions);
      console.log(year1Updated);

      // Update agent courses if Year 1 was updated
      if (year1Updated && year1Sessions.length > 0) {
        // await AgentCourse.updateMany(
        //   { courseRelationId: id },
        //   {
        //     $set: {
        //       "year.$[elem1].invoiceDate": year1Sessions[0].invoiceDate,
        //       "year.$[elem2].invoiceDate": year1Sessions[1].invoiceDate,
        //       "year.$[elem3].invoiceDate": year1Sessions[2].invoiceDate,
        //     },
        //   },
        //   {
        //     session,
        //     arrayFilters: [
        //       { "elem1.sessionName": year1Sessions[0].sessionName },
        //       { "elem2.sessionName": year1Sessions[1].sessionName },
        //       { "elem3.sessionName": year1Sessions[2].sessionName },
        //     ],
        //   }
        // );

        for (const sessionData of year1Sessions) {
          const { sessionName, invoiceDate } = sessionData;

          // Step 1: Try to update the session if it exists
          await AgentCourse.updateMany(
            {
              courseRelationId: id,
              "year.sessionName": sessionName,
            },
            {
              $set: {
                "year.$[elem].invoiceDate": invoiceDate,
              },
            },
            {
              session,
              arrayFilters: [{ "elem.sessionName": sessionName }],
            }
          );

          // Step 2: If not found, insert the session
          await AgentCourse.updateMany(
            {
              courseRelationId: id,
              "year.sessionName": { $ne: sessionName },
            },
            {
              $push: {
                year: {
                  sessionName,
                  invoiceDate,
                },
              },
            },
            { session }
          );
        }

        // Update students' agentPayments that reference these agent courses (Year 1 only)
        const agentCourses = await AgentCourse.find({
          courseRelationId: id,
        }).session(session);

        for (const agentCourse of agentCourses) {
          const agentStudents = await Student.find({
            agent: agentCourse.agentId,
            "agentPayments.courseRelationId": agentCourse.courseRelationId,
          }).session(session);

          for (const student of agentStudents) {
            let isModified = false;

            for (const payment of student.agentPayments) {
              if (
                payment.courseRelationId.toString() !==
                agentCourse.courseRelationId.toString()
              )
                continue;

              // Filter to only Year 1 sessions
              const year1Payment = payment.years.find(
                (y) => y.year === "Year 1"
              );
              if (!year1Payment) continue;

              for (const session of year1Payment.sessions) {
                const updatedSession = agentCourse.year?.find(
                  (s) => s.sessionName === session.sessionName
                );

                if (
                  updatedSession &&
                  session.invoiceDate.toISOString() !==
                    updatedSession.invoiceDate.toISOString()
                ) {
                  session.invoiceDate = updatedSession.invoiceDate;
                  isModified = true;
                }
              }
            }

            if (isModified) {
              await student.save({ session });
            }
          }
        }
      }

      await Promise.all(studentUpdatePromises);
    }

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const CourseRelationServices = {
  getAllCourseRelationFromDB,
  getSingleCourseRelationFromDB,
  updateCourseRelationIntoDB,
  createCourseRelationIntoDB,
};
