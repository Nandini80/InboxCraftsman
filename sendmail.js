const nodemailer = require("nodemailer");
const path = require("path");
const hbs = require('nodemailer-express-handlebars');

async function SendMail(email) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "aryangoyal625@gmail.com",
      pass: "rjxgtdhhjatkywrc"
    }
  });

  const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve('./public'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./public'),
    extName: ".handlebars",
  }
  transporter.use('compile', hbs(handlebarOptions));

  transporter.sendMail({
    from: 'aryangoyal625@gmail.com',
    to: email,
    subject: 'JSCOP Inhouse Hackathon',
    template: 'email',
    context: {
      title: 'JSCOP Inhouse Hackathon',
      text: "this is text"
    },
    attachments: [
      {
        filename: 'optica.jpg',  // Change the filename to match your image file
        path: path.resolve('./public/uploads/optica.jpg'), // Change the path to the actual path of your image
        cid: 'unique@nodemailer.com'  // Use the same cid as referenced in your Handlebars template
      }
    ]

  }, (err, info) => {
    if (err) throw err;
    console.log(`Mail sent to ${email},${name}: ${info.response}`);
  });
}

module.exports = {
  SendMail
}