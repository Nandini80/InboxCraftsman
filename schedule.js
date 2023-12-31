const Tt = require("./Models/1schedule");
const { SendMail } = require("./sendmail");

async function ParticularDate() {
    const schedule = require("node-schedule");

   

    var j = schedule.scheduleJob("*/1 * * * *", async function () {
         const getTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
        console.log("Schedule running");
        const T1 = await Tt.find();

        if (T1) {
            for (ee of T1) {
                const TimeSt = Math.floor(ee.TimeStamp / 1000); // Convert to seconds
                const Mail = ee.Email;
console.log(getTimestampInSeconds);
                console.log(TimeSt);
                if (TimeSt == getTimestampInSeconds) {
                    console.log("sending mails");
                    
                    
                   await SendMail(Mail);
                }
            }
        }
    })
}

module.exports = {
    ParticularDate
}
