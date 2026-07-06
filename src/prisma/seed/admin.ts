/* eslint-disable no-console */
import bcrypt from "bcrypt";
import prisma from "../../app/libs/prisma";
import { UserRole, UserStatus } from "../generated/prisma/client";
import env from "../../app/configs/env";

const seedAdmin = async () => {
  try {
    await prisma.$connect();
    const isAdminExists = await prisma.user.findUnique({
      where: {
        email: env.ADMIN_EMAIL,
      },
    });

    if (isAdminExists) {
      console.log("✅ Admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      env.ADMIN_PASSWORD,
      Number(env.BCRYPT_SALT),
    );

    await prisma.user.create({
      data: {
        fullname: "Super Admin",
        email: env.ADMIN_EMAIL,
        password: hashedPassword,
        phone: "+8801700000000",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    console.log("✅ Admin seeded successfully.");
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Failed to seed admin:", error);
    await prisma.$disconnect();
  }
};

seedAdmin();
