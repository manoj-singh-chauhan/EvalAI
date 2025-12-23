// import { Request, Response, NextFunction } from "express";

// export const requireAdmin = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const role = req.auth?.sessionClaims?.publicMetadata?.role;

//   if (role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Admin access only",
//     });
//   }

//   next();
// };
