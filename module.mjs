// @ts-check
import { module } from "@prisma/composer";
import monsmainService from "./service.mjs";

export default module("monsmain", ({ provision }) => {
  provision(monsmainService);
});
