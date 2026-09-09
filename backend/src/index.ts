import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import logger from "morgan";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import env from "./environments";

import mountPaymentsEndpoints from "./handlers/payments";
import mountUserEndpoints from "./handlers/users";
import mountNotificationEndpoints from "./handlers/notifications";
import mountPlaceEndpoints from "./handlers/places";

import "./types/session";

const dbName = env.mongo_db_name;

const mongoUri =
  `mongodb+srv://${encodeURIComponent(env.mongo_user)}:` +
  `${encodeURIComponent(env.mongo_password)}@` +
  `${env.mongo_host}/${dbName}?retryWrites=true&w=majority`;

const mongoClientOptions = {
  authSource: "admin",
  auth: {
    username: env.mongo_user,
    password: env.mongo_password,
  },
};

const app: express.Application = express();

app.use(logger("dev"));

app.use(
  logger("common", {
    stream: fs.createWriteStream(
      path.join(
        __dirname,
        "..",
        "log",
        "access.log",
      ),
      { flags: "a" },
    ),
  }),
);

app.use(express.json());

app.use(
  cors({
    origin: env.frontend_url,
    credentials: true,
  }),
);

app.use(cookieParser());

app.set("trust proxy", 1);

app.use(
  session({
    secret: env.session_secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      mongoOptions: mongoClientOptions,
      dbName: dbName,
      collectionName: "user_sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
  }) as unknown as express.RequestHandler,
);

// Payments
const paymentsRouter = express.Router();
mountPaymentsEndpoints(paymentsRouter);
app.use("/payments", paymentsRouter);

// Users
const userRouter = express.Router();
mountUserEndpoints(userRouter);
app.use("/user", userRouter);

// Notifications
const notificationRouter = express.Router();
mountNotificationEndpoints(
  notificationRouter,
);
app.use(
  "/notifications",
  notificationRouter,
);

// Places
const placesRouter = express.Router();
mountPlaceEndpoints(placesRouter);
app.use("/api", placesRouter);

// Hello World
app.get("/", async (_, res) => {
  res.status(200).send({
    message: "Hello, World!",
  });
});

const start = async () => {
  try {
    const client = await MongoClient.connect(
      mongoUri,
      mongoClientOptions,
    );

    const db = client.db(dbName);

    app.locals.orderCollection =
      db.collection("orders");

    app.locals.userCollection =
      db.collection("users");

    app.locals.placeCollection =
      db.collection("places");

    console.log(
      "Connected to MongoDB",
    );

    app.listen(env.port, () => {
      console.log(
        `PioneerMap Backend listening on port ${env.port}!`,
      );

      console.log(
        `CORS configured for ${env.frontend_url}`,
      );
    });
  } catch (err) {
    console.error(
      "Connection to MongoDB failed:",
      err,
    );

    process.exit(1);
  }
};

start();
