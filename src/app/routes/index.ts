import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.router";
import { InstitutionRoutes } from "../modules/institution/institution.route";
import { CourseRoutes } from "../modules/course/course.route";
import { AcademicYearsRoutes } from "../modules/academic-years/academicYears.route";
import { TermRoutes } from "../modules/term/term.route";
import { EmailConfigRoutes } from "../modules/email-configs/email-configs.route";
import { EmailDraftRoutes } from "../modules/email-drafts/email-drafts.route";

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
  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
