import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.router";
import { InstitutionRoutes } from "../modules/institution/institution.route";
import { CourseRoutes } from "../modules/course/course.route";
import { AcademicYearsRoutes } from "../modules/academic-years/academicYears.route";
import { TermRoutes } from "../modules/term/term.route";
import { EmailConfigRoutes } from "../modules/email-configs/email-configs.route";
import { EmailDraftRoutes } from "../modules/email-drafts/email-drafts.route";
import { CourseRelationRoutes } from "../modules/course-relation/courseRelation.route";
import { StudentRoutes } from "../modules/student/student.route";
import { AgentCourseRoutes } from "../modules/agent-course/agentCourse.route";
import { NoteRoutes } from "../modules/note/note.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/institutions",
    route: InstitutionRoutes,
  },
  {
    path: "/courses",
    route: CourseRoutes,
  },
  {
    path: "/academic-years",
    route: AcademicYearsRoutes,
  },
  {
    path: "/terms",
    route: TermRoutes,
  },
  {
    path: "/email-configs",
    route: EmailConfigRoutes,
  },
  {
    path: "/email-drafts",
    route: EmailDraftRoutes,
  },
  {
    path: "/course-relations",
    route: CourseRelationRoutes,
  },
  {
    path: "/students",
    route: StudentRoutes,
  },
  {
    path: "/agent-courses",
    route: AgentCourseRoutes,
  },
  {
    path: "/notes",
    route: NoteRoutes,
  },
  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
