import nodemailer, { SendMailOptions } from "nodemailer";

async function createTestCreds() {
    const creds = await nodemailer.createTestAccount();
    console.log({ creds });
}

createTestCreds();


const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth:{
        user:process.env.NODEMAILER_USER,
        pass:process.env.MODEMAILER_PASS
    }
});

  
async function sendEmail(payload: SendMailOptions) {
    await transporter.sendMail(payload)
    console.log('\n********       Email sent successfully       ********\n')
}
  
export default sendEmail;