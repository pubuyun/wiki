import { interviewMap, queryInterviewPages } from "../utils/interviews";

export default defineEventHandler(async () =>
    interviewMap(await queryInterviewPages(false)),
);
