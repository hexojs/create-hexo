"use strict";

const { readFileSync, writeFileSync } = require("fs");

const pk = JSON.parse(readFileSync("package.json"));
pk.name = pk.name.startsWith("@") ? pk.name : `${process.env.SCOPE}/${pk.name}`;
writeFileSync("package.json", JSON.stringify(pk, null, 2));
console.log(pk.name);
