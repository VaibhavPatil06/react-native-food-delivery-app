import express from "express";
import { getCategories } from "../controller/category.controller.js";

const categoryRoutes = express.Router();

categoryRoutes.get("/", getCategories);

export default categoryRoutes;
