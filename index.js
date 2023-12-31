require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const { UploadRoute } = require("./routes/index");
let fileUploadPath = "./public/uploads/";
const fs = require("fs");
const csv = require("csv-parser");
const { SendMail } = require("./sendmail");
const { ParticularDate } = require("./schedule");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
      fileUploadPath += file.originalname;
    }
  });

  const upload = multer({ storage: storage });

mongoose.connect(process.env.Mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("connected to mongo!!");
}).catch((err) => {
    console.log("Error connecting to mongo!", err);
});

const db = mongoose.connection;
const csvSchema = {};
let CSVModel;

function createOrUpdateModel(csvSchema) {
    if (mongoose.models.CSVData) {
        delete mongoose.model('CSVData', new mongoose.Schema(csvSchema))
    }

    CSVModel = mongoose.model("CSVData", new mongoose.Schema(csvSchema));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/routes", UploadRoute);
app.use(express.static(path.join(__dirname, "./public/frontend")));

// html files 
app.get("/", async (req, res) => {
  res.sendFile(path.resolve(path.join(__dirname, "./public/frontend", "index.html" )));
});

app.get("/register", (req, res) =>  {
    res.sendFile(path.resolve(path.join(__dirname, "./public/frontend", "register.html")));
})

app.get("/contact", (req, res) =>  {
    res.sendFile(path.resolve(path.join(__dirname, "./public/frontend", "contact.html")));
})

app.get("/display", (req, res) =>  {
    res.sendFile(path.resolve(path.join(__dirname, "./public/frontend", "Display.html")));
});

app.get("/features", (req, res) => {
  res.sendFile(path.resolve(path.join(__dirname, "./public/frontend", "features.html")));
})


app.post('/upload', upload.single('csvFile'), async (req, res) => {

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    console.log("File received!!");
    
    res.send('File uploaded successfully.');
  
    const results = [];
    const filename = fileUploadPath;
  
    fs.createReadStream(filename)
      .pipe(csv())
      .on('headers', (headers) => {
        headers.forEach((header) => {
          csvSchema[header] = String;
        });
      })
      .on('data',  (data) => results.push(data))
      .on('end', async () => {
        console.log('CSV file data:');
        console.log(results);
         
         createOrUpdateModel(csvSchema);

       await CSVModel.deleteMany();
           
        CSVModel.insertMany(results)
          .then(() => {
            console.log('Data inserted into MongoDB.');
           

          })
          .catch((err) => {
            console.error('Error inserting data into MongoDB:', err);
          });
         // res.send('File uploaded successfully.');
      });
  })

  app.get('/all-data', async (req, res) => {
    try {
      const allData = await CSVModel.find({}); 
      res.json(allData); 
    } catch (error) {
      console.error('Error fetching all data:', error);
      res.status(500).send('Error fetching all data.');
    }
  });

  app.post('/delete-data', async (req, res) => {
    const idsToDelete = req.body.ids;
    console.log(idsToDelete);
    try {
        const deleteResult = await CSVModel.deleteMany({ _id: { $in: idsToDelete } }); // Delete data items by IDs
        console.log('Deleted data:', deleteResult);
        res.status(200).send('Data deleted successfully');
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).send('Error deleting data');
    }
});

app.post("/mail-data", async (req, res) => {
    const IdsToSendMail = req.body.ids;
    
    console.log(IdsToSendMail);
    const len = IdsToSendMail.length;

    for (let i = 0; i < len; i++) {
        try {
            const J1 = await CSVModel.findOne({
                _id: IdsToSendMail[i]
            });
            if (J1) {
                const mail = await J1.Email;
                console.log(mail);
                await SendMail(mail);
                console.log("mail sent!!");
               
            }
        }
        catch (error) {
            console.error('Error Sending Mailss:', error);
            res.status(500).send('Error Sending Mails');
        }
        
    }
    res.status(200).send("Mail sent successfully!!");
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

//====================scheduling====================
app.post("/getPArticularDate", async (req, res) => {
  const data = req.body.ids;
  const timestamp = req.query.timestamp;
  const T1 = require("./Models/1schedule");

  console.log(data);
  const len = data.length;

  for (let i = 0; i < len; i++) {
    try {
        const J1 = await CSVModel.findOne({
            _id: data[i]
        });
        if (J1) {
            const mail = await J1.Email;
            console.log(mail);
            const tt = await T1.findOneAndUpdate({
              Email: mail,
             },{
              Email: mail,
              TimeStamp: timestamp,
             },{
              upsert: true,
              new: true,
             });
             console.log(tt);
            } // added to database of every timestamp!!; 
    }
    catch (error) {
        console.error('Error Sending Mailss:', error);
        res.status(500).send('Error Sending Mails');
    }
    // res.status(200).send("Mail sent successfully!!");
    await ParticularDate();   
}
});


// const schedule = require("node-schedule");
// const date = new Date('2023-12-29T22:13:08.000+5:30');
// schedule.scheduleJob(date,()=>{
//   console.log("job ran @",new Date().toString());
// })


                  //    s m h d m w
// schedule.scheduleJob('m-Job','*/2 * * * * *',()=>{
//   console.log("I ran..");
//   schedule.cancelJob('m-Job');
// })

// const job = schedule.scheduleJob('*/2 * * * * *',()=>{
//      console.log("I ran..");
//      job.cancel();
// });
