"use strict";

const Hapi = require("@hapi/hapi");
const fs = require("fs");
const Joi = require("@hapi/joi");

const init = async () => {
  const server = Hapi.server({
    port: 8001,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello ! this is an Blog Service.";
    },
  });

  server.route({
    method: "POST",
    path: "/upload",
    options: {
      payload: {
        maxBytes: 1048576 * 100,
        parse: true,
        output: "stream",
        allow: "multipart/form-data",
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          file: Joi.any().required(),
        }),
      },
    },
    handler: (request, h) => {
      const data = request.payload;
      if (data.file) {
        const name = data.file.hapi.filename;
        const path = __dirname + "/uploads/" + name;
        const file = fs.createWriteStream(path);

        file.on("error", (err) => console.error(err));

        data.file.pipe(file);

        data.file.on("end", (err) => {
          const ret = {
            filename: data.file.hapi.filename,
            headers: data.file.hapi.headers,
          };
          return JSON.stringify(ret);
        });
      }
      return { message: "upload success." };
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
