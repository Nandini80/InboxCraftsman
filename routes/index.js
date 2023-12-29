const { Router } = require("express");
const UploadRoute = Router();
const path = require("express");

UploadRoute.get("/", async (req, res) => {
    res.send("hii humans!!");
});

module.exports = {
    UploadRoute
};