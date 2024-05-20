const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
require('dotenv').config()
const transporter = nodemailer.createTransport({
  host: "mail9210.maychuemail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_AUTH_USER, // generated ethereal user
    pass: process.env.MAIL_AUTH_PASS, // generated ethereal password
  },
});
function getEmailAdmin(env) {
  return env == 'test' ?  'dicom-movinavir2022@yopmail.com' : 'info@aamtgroup.com'; 
}

async function emailNotificationContact(req, res) {
  try {
    const env = req.headers.env;
    if (!req.body.email || !req.body.phone) {
      console.log("emailNotificationContact:: require email or phone");
      res.send({ status: false })
      return
    }

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Movinavir" <noreply@dicom-interactive.com>', // sender address
      to: getEmailAdmin(env), // list of receivers
      subject: `You have new message from contact form - email ${req.body.email}`, // Subject line
      // text: "Hello world?", // plain text body
      html: `
      <div>
        <p>Hi admin,</p>
        <p>You have new message from contact form</p>
        <p>Name: ${req.body.name}</p>
        <p>Phone: ${req.body.phone}</p>
        <p>Email: ${req.body.email}</p>
        <p>Message: ${req.body.message}</p>
        <p>Thank you!</p>
        <br>
        <p><i>This is a notification email from noreply@dicom-interactive.com</i></p>
       </div>`,
    });
    console.log("emailNotificationContact:: ", info);
    res.send({ status: true })
  } catch (error) {
    res.send({ status: false })
  }
}

async function emailNotificationSubscrition(req, res) {
  try {
    const env = req.headers.env;
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Movinavir" <noreply@dicom-interactive.com>', // sender address
      to: getEmailAdmin(env), // list of receivers
      subject: `You have new message from subscription form - ${req.body.email}`, // Subject line
      // text: "Hello world?", // plain text body
      html: `
      <div>
        <p>Hi admin,</p>
        <p>You have new message from subscription form</p>
        <p>Email: ${req.body.email}</p>
        <p>Thank you!</p>
        <br>
        <p><i>This is a notification email from noreply@dicom-interactive.com</i></p>
       </div>`,
    });
    console.log("emailNotificationSubscrition:: ", info);
    res.send({ status: true })
  } catch (error) {
    res.send({ status: false })
  }
}

async function emailNotificationEnquiry(req, res) {
  try {
    const env = req.headers.env;
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Movinavir" <noreply@dicom-interactive.com>', // sender address
      to: getEmailAdmin(env), // list of receivers
      subject: `You have new message from product enquiry form - ${req.body.email}`, // Subject line
      // text: "Hello world?", // plain text body
      html: `
      <div>
        <p>Hi admin,</p>
        <p>You have new message from product enquiry form</p>
        <p>Name: ${req.body.name}</p>
        <p>Company: ${req.body.company}</p>
        <p>Email: ${req.body.email}</p>
        <p>Phone: ${req.body.phoneCountryCode} ${req.body.phone}</p>
        <p>Commodity: ${(req.body.commodity || "").text}</p>
        <p>Details Of Port: ${req.body.detailsOfPort}</p>
        <p>Delivery Terms: ${req.body.deliveryTerms}</p>
        <p>Delivery Schedule: ${req.body.deliverySchedule}</p>
        <p>Quantity: ${req.body.quantity}</p>
        <p>Quantity Specifications: ${req.body.quantitySpecifications}</p>
        <p>Inspection: ${req.body.inspection}</p>
        <p>Payment Terms: ${req.body.paymentTerms}</p>
        <p>Origins: ${req.body.origins}</p>
        <p>Thank you!</p>
        <br>
        <p><i>This is a notification email from noreply@dicom-interactive.com</i></p>
       </div>`,
    });

    console.log("emailNotificationEnquiry:: ", info);
    res.send({ status: true })
  } catch (error) {
    console.log(error)
    res.send({ status: false })
  }
}

module.exports = {
  emailNotificationContact,
  emailNotificationSubscrition,
  emailNotificationEnquiry,
}
