import { Plan } from "./plan.model";
import { sequelize } from "../../config/db";

const seed = async () => {
  await sequelize.authenticate();
  await Plan.sync({ alter: true });

  const plans = [
    { name: "Pro Monthly", code: "pro_monthly", price: 499, duration: 30 },
    { name: "Pro Yearly", code: "pro_yearly", price: 3999, duration: 365 },
  ];

  for (const p of plans) {
    await Plan.findOrCreate({ where: { code: p.code }, defaults: p });
  }
  console.log("Plans added to Database");
};

seed();
