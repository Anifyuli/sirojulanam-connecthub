#!/usr/bin/env node
/**
 * Module dependencies.
 */

import createDebug from "debug";
import http from "node:http";
import { initEntityManager } from "../lib/entityManager";

const debug = createDebug("api:server");

let server: http.Server;
let port: number | string | false;

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  if (!addr) return;
  
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);

  const serverPort = typeof addr === "string" ? addr : addr.port;
  console.log(`
  API Server ready at:

  - Local:   http://localhost:${serverPort}/
  - Network: http://127.0.0.1:${serverPort}/

  `);
}

/**
 * Initialize database connection BEFORE loading app
 */

const hasDbConfig = process.env.DB_NAME && process.env.DB_USER;

async function bootstrap() {
  if (hasDbConfig) {
    console.log("Initializing database connection...");
    try {
      await Promise.race([
        initEntityManager(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout after 5s")), 5000),
        ),
      ]);
      console.log("Database connected");
    } catch (error) {
      console.error(
        "Database connection failed:",
        error instanceof Error ? error.message : error,
      );
      if (error instanceof Error && error.stack) {
        console.error("Stack trace:", error.stack);
      }
      console.log("Continuing without database (some features may not work)");
    }
  } else {
    console.log(
      "No database credentials found (set DB_NAME, DB_USER in .env)",
    );
    console.log("Running without database connection");
  }

  // Now import app (controllers will have access to EntityManager)
  const app = (await import("../app.js")).default;

  /**
   * Get port from environment and store in Express.
   */

  port = normalizePort(process.env.PORT || "3000");
  app.set("port", port);

  /**
   * Create HTTP server.
   */

  server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  console.log(`Attempting to listen on port ${port}...`);
  server.listen(port);
  server.on("error", onError);
  server.on("listening", onListening);
}

bootstrap();
