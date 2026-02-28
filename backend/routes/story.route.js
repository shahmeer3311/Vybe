import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { createStory, getAllStories,getStoryByUserName,viewStory } from "../controllers/story.controller.js";

const storyRouter = express.Router();

storyRouter.post("/create", isAuth, createStory);
storyRouter.get("/all", isAuth, getAllStories);
storyRouter.get("/:storyId/view", isAuth, viewStory);
storyRouter.get("/:userName/stories", isAuth, getStoryByUserName); // get stories by username

export default storyRouter;
