import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { AmenityRoutes } from "../modules/amenity/amenity.route";
import { PropertyRoutes } from "../modules/property/property.route";

const v1Routes: Router = Router();

interface IRoutes {
  path: string;
  router: Router;
}

const routes: IRoutes[] = [
  { path: "/users", router: UserRoutes },
  { path: "/auth", router: AuthRoutes },
  { path: "/categories", router: CategoryRoutes },
  { path: "/amenities", router: AmenityRoutes },
  { path: "/properties", router: PropertyRoutes },
];

routes.forEach((route) => {
  v1Routes.use(route.path, route.router);
});

export default v1Routes;
