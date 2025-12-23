// import { Request, Response } from "express";
// import { clerkClient } from "@clerk/clerk-sdk-node";
// import QuestionPaper from "../question/question.model";
// import AnswerSheet from "../answer/answer.model";

// export class AdminController {

//   static async getAllUsers(req: Request, res: Response) {
//     const users = await clerkClient.users.getUserList({
//       limit: 100,
//     });

//     return res.json({
//       success: true,
//       users,
//     });
//   }

//   static async getUserActivity(req: Request, res: Response) {
//     const { userId } = req.params;

//     const questionPapers = await QuestionPaper.findAll({
//       where: { createdBy: userId },
//     });

//     const answerSheets = await AnswerSheet.findAll({
//       include: [{
//         model: QuestionPaper,
//         where: { createdBy: userId },
//       }],
//     });

//     return res.json({
//       success: true,
//       questionPapers,
//       answerSheets,
//     });
//   }
// }
