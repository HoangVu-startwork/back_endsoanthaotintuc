// ES6+ example
// upload for multipart
const { Upload } = require("@aws-sdk/lib-storage");
const { S3, S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3client = new S3({ region: "ap-southeast-1" });
const region = "ap-southeast-1";
const axios = require('axios');
const slugify = require('slugify');
// require('dotenv').config();
// const transporter = require('../services/email');

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
const slackWebDicomHrHookUrl = process.env.SLACK_WEB_DICOM_HR_HOOK_URL;
const slackWebDicomIncomingHookUrl = process.env.SLACK_WEB_DICOM_INCOMING_HOOK_URL;
const BUCKET_NAME = "dicom-interactive"
const REFIX_URL = "https://dicom-interactive.s3.ap-southeast-1.amazonaws.com/";

const DEADLINE = [
  "Within a month",
  "1-2 months",
  "+2 months",
]

const CONTENT_PLAN = [
  "Absolutely, all of them",
  "Just some text and imagery",
  "Not at all",
]

const PAGE_REQUEST = [
  "one page",
  "Up to 5",
  "Up to 10",
  "I'm not sure",
]

const FEATURE_REQUEST = [
  "I want to show my business information, its products and services",
  "I want to sell product online with shopping cart and checkout process",
  "I want to have a showcase of work, projects, or personal achievements",
  "I want to have a blog",
  "Other",
]

async function careerApply(req, res) {
  try {
    if (!req.files) {
      return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    const task = [];
    console.log("req: ", req.body);
    const listFileUrl = []
    for (let [key, value] of Object.entries(req.files)) {
      let s3Path = generateS3Path(value);
      listFileUrl.push(REFIX_URL + s3Path);
      console.log("files[key]: ", value);
      task.push(handleUpload2S3(value, s3Path));
    }
    await Promise.all(task);

    const { body } = req;
    const options = {
      url: slackWebDicomHrHookUrl,
      data: JSON.stringify({
        "text": `
      \`\`\`      name: ${body.name},
      phone: ${body.phone},
      countryCode: ${body.countryCode},
      countryName: ${body.countryName},
      position: ${body.position},
      message: ${body.message},\`\`\`
      files: ${listFileUrl[0]}, ${listFileUrl[1] ?? ""}
      ` }),
      method: 'post',
      headers: { 'Content-Type': 'application/json' }
    };

    const { data } = await axios(options);
    res.send({ status: true, data });
  } catch (error) {
    res.status(500).send({ status: false, error })
  }
}

async function handleUpload2S3(file, s3Path) {
  console.log("0 upload done..");
  const target = {
    Bucket: BUCKET_NAME,
    Key: s3Path,
    ContentType: file.mimetype,
    Body: file.data,
    ACL: "public-read",
  };

  console.log('1 upload done..')

  const parallelUploads3 = new Upload({
    client: new S3({ region }) || new S3Client({ region }),
    params: target,
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 50, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: true, // optional manually handle dropped parts
  });

  console.log('2 upload done..')
  parallelUploads3.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });

  console.log('3 upload done..')
  await parallelUploads3.done();
  return;
}

async function developWebRequest(req, res) {
  console.log('develop web request....')
  // verify data
  // consider save to db
  // send message to slack
  const { body } = req;
  const options = {
    url: slackWebDicomIncomingHookUrl,
    icon_emoji: ":robot_face:",
    username: "Dicom Bot",
    data: JSON.stringify({
      "text": `---------Đặt hàng làm Web----------
    subject: Có khách yêu cầu ${body.subject},
    name: ${body.name},
    email: ${body.email},
    phone: ${body.phone},
    countryCode: ${body.countryCode},
    countryName: ${body.countryName},
    message: ${body.message},
    ` }),
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  };

  const { data } = await axios(options);

  // send email to potential client
  // send mail with defined transport object
  try {
    let info = await transporter.sendMail({
      from: 'Dicom interactive" <sales@dicom-interactive.com>', // sender address
      to: body.email, // list of receivers
      subject: `Xác nhận đơn hàng thiết kế website chuyên nghiệp - ${body.subject}`, // Subject line
      // don't try reformat email without testing
      html: `
        <div style="color: #000000;">
        Thân chào ${body.name},

        <p>Cảm ơn quý khách đã đặt hàng thiết kế website chuyên nghiệp của Dicom interactive!</p>
        
        <p>Nhân viên tư vấn sẽ liên hệ lại lại trong 24 giờ.</p>
        
        <p>Nếu có thêm bất của yêu cầu nào quý khách vui lòng liên hệ với chúng tôi qua sales@dicom-interactive.com hoặc (+84) 287 1065 144.</p>
        
        <p>Trân thành cảm ơn!</p>
        
        <p style="color: #000000;">Kính mến,<br/>
Sales Team<br/>
Dicom Interactive<br/>
sales@dicom-interactive.com<br/>
(+84) 287 1065 144</p>
</div>`,
    });
    console.log("emailNotificationContact:: ", info);
    res.send({ status: true })
  } catch (error) {
    console.log("error, ", error)
    res.send({ status: false })
  }
}


async function freeQuoteRequest(req, res) {
  // verify data
  // consider save to db
  // upload file to s3
  // send message to slack
  const { body } = req;
  console.log("req: ", body);
  const lang = body.lang || 'en';

  if (body.subject === 'web') {
    const task = [];
    const listFileUrl = []
    if (body.files !== 'undefined') {
      for (let [key, value] of Object.entries(req.files)) {
        let s3Path = generateQuoteS3Path(value);
        listFileUrl.push(REFIX_URL + s3Path);
        console.log("files[key]: ", value);
        task.push(handleUpload2S3(value, s3Path));
      }
      await Promise.all(task);
    }

    slack = JSON.stringify({
      "text": `---------Free Quote Request----------
      name: ${body.name},
      countryCode: ${body.countryCode},
      countryName: ${body.countryName},
      phone: ${body.phone},
      email: ${body.email},
      companyName: ${body.companyName},
      contentPlan:${CONTENT_PLAN[body.contentPlan]},
      deadline: ${DEADLINE[body.deadline]},
      pageRequest: ${PAGE_REQUEST[body.pageRequest]},
      featureRequest: ${FEATURE_REQUEST[body.featureRequest]},
      message: ${body.message},
      files: ${listFileUrl[0]}, ${listFileUrl[1] ?? ""}
      `
    })
  } else {
      slack = JSON.stringify({
        "text": `--------- Contact ----------
        subject: There is a customer request ${body.subject},
        name: ${body.name},
        email: ${body.email},
        phone: ${body.phone},
        countryCode: ${body.countryCode},
        countryName: ${body.countryName},
        message: ${body.message},
      ` 
    })
  }

  const options = {
    url: slackWebDicomIncomingHookUrl,
    icon_emoji: ":robot_face:",
    username: "Dicom Bot",
    data: slack,
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  };

  const { data } = await axios(options);

  // send email to potential client
  if (lang === 'en') {
    emailTemplate = `
        <div style="color: #000000;">
          Dear ${body.name},

          <p>Thank you for requesting a quote from ${body.companyName || body.name}. We appreciate your interest in our services. This email is to confirm that we've received your request, and we're excited to work with you.</p>
        
          <p>Our team is currently reviewing the details you provided, and we'll get back to you with a customized quote within 24 hours.</p>
        
          <p>If you have any immediate questions or need further assistance, please don't hesitate to reach out to us at sales@dicom-interactive.com or (+84) 287 1065 144.</p>
        
          <p>We look forward to the opportunity to serve you and discuss your project in more detail.</p>
        
          <p style="color: #000000;">Best regards,<br/>
Sales Team<br/>
<span style="color: #000000">Dicom Interactive</span><br/>
sales@dicom-interactive.com<br/>
<span style="color: #000000">(+84) 287 1065 144</span></p>
          </div>`
  } else {
    emailTemplate = `
          <div style="color: #000000;">
          Xin chào ${body.name},

          <p>Cảm ơn bạn đã gửi yêu cầu báo giá cho ${body.companyName || body.name} và chú ý đến dịch vụ từ Dicom Interactive. Chúng tôi đã nhận được yêu cầu từ bạn và vô cùng mong đợi được làm việc cùng bạn.</p> 

          <p>Đội ngũ Dicom Interactive đang xử lý thông tin bạn cung cấp và sẽ gửi báo giá dựa trên đó trong vòng 24 giờ.</p> 

          <p>Nếu bạn có thắc mắc hoặc cần hỗ trợ, hãy liên hệ chúng tôi qua email sales@dicom-interactive.com hoặc số điện thoại (+84) 287 1065 144.</p>

          <p>Dicom Interactive rất mong có cơ hội thảo luận về dự án và cung cấp dịch vụ đến bạn.</p>

          <p style="color: #000000;">
Thân gửi,<br/>
Sales Team<br/>
<span style="color: #000000">Dicom Interactive</span><br/>
sales@dicom-interactive.com<br/>
<span style="color: #000000">(+84) 287 1065 144</span></p>
          </div>`
  }

  try {
    const info = await transporter.sendMail({
      from: 'Dicom interactive" <sales@dicom-interactive.com>', // sender address
      to: body.email,
      subject: `${lang === 'en' ? 'Your Quote Request Confirmation' : 'Xác nhận yêu cầu báo giá của bạn'}`,
      html: emailTemplate
    });
    console.log("emailNotificationContact:: ", info);
    res.send({ status: true })
  } catch (error) {
    res.send({ status: false })
  }

}

function generateS3Path(file) {
  return `dicom-career/${(Math.floor(Math.random() * 10000) + '').padStart(4, '0')}-${slugify(file.name, "_")}`
}

function generateQuoteS3Path(file) {
  return `dicom-quote/${(Math.floor(Math.random() * 10000) + '').padStart(4, '0')}-${slugify(file.name, "_")}`
}

module.exports = {
  careerApply,
  developWebRequest,
  freeQuoteRequest,
}
