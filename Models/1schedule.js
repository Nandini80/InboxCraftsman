const mongo = require("mongoose");

const Tt = mongo.Schema({
    TimeStamp: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
});

module.exports = new mongo.model("EmailSchedule", Tt);