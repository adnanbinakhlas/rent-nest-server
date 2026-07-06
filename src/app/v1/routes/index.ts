import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";

const v1Router: Router = Router();

interface IRoutes {
  path: string;
  router: Router;
}

const routes: IRoutes[] = [{ path: "/users", router: userRoutes }];

routes.forEach((route) => {
  v1Router.use(route.path, route.router);
});

export default v1Router;
