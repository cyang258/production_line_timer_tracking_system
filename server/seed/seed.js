import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";
import Build from "../model/buildModel.js";
import LoginId from "../model/loginIdModel.js";
import Session from "../model/sessionModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

const seedBuilds = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log(chalk.cyan("Connected to MongoDB..."));
    // initialize collections
    await Build.deleteMany();
    await LoginId.deleteMany();
    await Session.deleteMany();
    // build seed data
    const buildData = [
      {
        buildNumber: "build-001",
        numberOfParts: 10,
        timePerPart: 5,
      },
      {
        buildNumber: "build-002",
        numberOfParts: 20,
        timePerPart: 4,
      },
    ];

    for (const build of buildData) {
      const exists = await Build.findOne({ buildNumber: build.buildNumber });
      if (!exists) {
        await Build.create(build);
        console.log(chalk.green(`Inserted build: ${build.buildNumber}`));
      } else {
        console.log(chalk.yellow(`Build ${build.buildNumber} already exists, skipping...`));
      }
    }

    // login seed data
    const loginIdData = [
      {
        loginId: "User-001"
      }
    ];

    for (const id of loginIdData) {
      const exists = await LoginId.findOne({ loginId: id.loginId });
      if (!exists) {
        await LoginId.create(id);
        console.log(chalk.green(`Inserted loginId: ${id.loginId}`));
      } else {
        console.log(chalk.yellow(`LoginId ${id.loginId} already exists, skipping...`));
      }
    }

    console.log(chalk.bold.green("✅ Seeding completed."));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("❌ Seeding failed:"), error);
    process.exit(1);
  }
};

seedBuilds();
