import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import {courseRelationSearchableFields } from "./courseRelation.constant";
import { TCourseRelation } from "./courseRelation.interface";
import CourseRelation from "./courseRelation.model";
import Student from "../student/student.model";
import mongoose, { Types } from "mongoose";



const createCourseRelationIntoDB = async (payload: TCourseRelation) => {
  try {
    const existingCourse = await CourseRelation.findOne({
      term: payload.term,
      course: payload.course, 
      institute:payload.institute
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

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllCourseRelationFromDB = async (query: Record<string, unknown>) => {
  const CourseRelationQuery = new QueryBuilder(CourseRelation.find().populate('institute') 
  .populate('course') 
  .populate('term'), query)
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
  const result = await CourseRelation.findById(id).populate('institute') 
  .populate('course') 
  .populate('term');
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


const updateCourseRelationIntoDB = async (id: string, payload: Partial<TCourseRelation>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if course relation exists
    const courseRelation = await CourseRelation.findById(id).session(session);
    
    if (!courseRelation) {
      throw new AppError(httpStatus.NOT_FOUND, "CourseRelation not found");
    }

    if (payload.years) {
      const existingYears = courseRelation.years.map(year => ({
        _id: year._id,
        year: year.year,
        sessions: year.sessions.map(session => ({
          _id: session._id,
          sessionName: session.sessionName,
          invoiceDate: session.invoiceDate,
          type: session.type,
          rate: session.rate,
          status: session.status 
        }))
      }));

      // Process the new years in the payload
      payload.years.forEach(newYear => {
        const existingYearIndex = existingYears.findIndex(
          y => y.year === newYear.year
        );

        if (existingYearIndex !== -1) {
          // If the year exists, merge sessions
          const existingSessions = existingYears[existingYearIndex].sessions;

          newYear.sessions?.forEach(newSession => {
            const existingSessionIndex = existingSessions.findIndex(
              s => s.sessionName === newSession.sessionName
            );

            if (existingSessionIndex !== -1) {
              // Update the session if it exists
              existingSessions[existingSessionIndex] = {
                _id: existingSessions[existingSessionIndex]._id,
                sessionName: newSession.sessionName || existingSessions[existingSessionIndex].sessionName,
                invoiceDate: newSession.invoiceDate || existingSessions[existingSessionIndex].invoiceDate,
                type: newSession.type || existingSessions[existingSessionIndex].type,
                rate: newSession.rate || existingSessions[existingSessionIndex].rate,
                status: newSession.status || existingSessions[existingSessionIndex].status 
              };
            } else {
              // If session doesn't exist, add it
              existingSessions.push({
                _id: new Types.ObjectId(),
                sessionName: newSession.sessionName,
                invoiceDate: newSession.invoiceDate,
                type: newSession.type,
                rate: newSession.rate,
                status: newSession.status 
              });
            }
          });
        } else {
          // If the year doesn't exist, add it
          existingYears.push({
            _id: new Types.ObjectId(),
            year: newYear.year,
            sessions: newYear.sessions?.map(session => ({
              _id: new Types.ObjectId(),
              sessionName: session.sessionName,
              invoiceDate: session.invoiceDate,
              type: session.type,
              rate: session.rate,
              status: session.status 
            })) || []
          });
        }
      });

      // Update the payload with the merged years
      payload.years = existingYears;
    }

    // Update the course relation in the database
    const result = await CourseRelation.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true, session }
    );

    // Now, update student accounts
    if (payload.years) {
      const students = await Student.find({
        'accounts.courseRelationId': id
      }).session(session);

      const updatePromises = students.map(async (student) => {
        const accountIndex = student.accounts.findIndex(
          acc => acc.courseRelationId.toString() === id
        );

        if (accountIndex !== -1) {
          // Create a safe copy of the existing years in the student's account
          const existingAccountYears = student.accounts[accountIndex].years.map(year => ({
            _id: year._id || new Types.ObjectId(),
            year: year.year,
            sessions: year.sessions?.map(session => ({
              _id: session._id || new Types.ObjectId(),
              sessionName: session.sessionName,
              invoiceDate: session.invoiceDate,
              type: session.type,
              rate: session.rate,
              status: session.status // Ensure status is included
            })) || []
          }));

          payload.years?.forEach(newYear => {
            const existingYearIndex = existingAccountYears.findIndex(
              y => y.year === newYear.year
            );

            if (existingYearIndex !== -1) {
              const existingSessions = existingAccountYears[existingYearIndex].sessions;

              newYear.sessions?.forEach(newSession => {
                const existingSessionIndex = existingSessions.findIndex(
                  s => s.sessionName === newSession.sessionName
                );

                if (existingSessionIndex !== -1) {
                  // Update the existing session
                  existingSessions[existingSessionIndex] = {
                    _id: existingSessions[existingSessionIndex]._id,
                    sessionName: newSession.sessionName || existingSessions[existingSessionIndex].sessionName,
                    invoiceDate: newSession.invoiceDate || existingSessions[existingSessionIndex].invoiceDate,
                    type: newSession.type || existingSessions[existingSessionIndex].type,
                    rate: newSession.rate || existingSessions[existingSessionIndex].rate,
                    status: newSession.status || existingSessions[existingSessionIndex].status // Merge status
                  };
                } else {
                  existingSessions.push({
                    _id: new Types.ObjectId(),
                    sessionName: newSession.sessionName,
                    invoiceDate: newSession.invoiceDate,
                    type: newSession.type,
                    rate: newSession.rate,
                    status: newSession.status // Add the status to new sessions
                  });
                }
              });
            } else {
              // If the year doesn't exist, add it
              existingAccountYears.push({
                _id: new Types.ObjectId(),
                year: newYear.year,
                sessions: newYear.sessions?.map(session => ({
                  _id: new Types.ObjectId(),
                  sessionName: session.sessionName,
                  invoiceDate: session.invoiceDate,
                  type: session.type,
                  rate: session.rate,
                  status: session.status // Add the status to the new year
                })) || []
              });
            }
          });

          // Update the student's account with the merged years and sessions
          student.accounts[accountIndex].years = existingAccountYears;
          await student.save({ session });
        }
      });

      await Promise.all(updatePromises);
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
  createCourseRelationIntoDB
  

};
