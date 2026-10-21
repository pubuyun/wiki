import { interviewMap, queryInterviewPages } from "../utils/interviews";

export default defineEventHandler(async (event) =>
    interviewMap(await queryInterviewPages(event, true)),
);
