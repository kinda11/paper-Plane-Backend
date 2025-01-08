import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory of the current module in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define TEMPLATE_DIR using __dirname
const TEMPLATE_DIR = path.join(__dirname, './');

// Create a transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_AUTH_USER_EMAIL, // Your Gmail address
        pass: process.env.NODEMAILER_AUTH_USER_PASSWORD, // App password
    },
});

// Function to send email with a dynamic EJS template
const sendRedeemEmail = (to, subject, templateName, data) => {
    return new Promise((resolve, reject) => {
        try {
            // Dynamically resolve the template path
            const templatePath = path.join(TEMPLATE_DIR, `${templateName}.ejs`);
            console.log('Resolved Template Path:', templatePath); // Debugging line

            // Render the EJS template to HTML
            ejs.renderFile(templatePath, data, (err, htmlContent) => {
                if (err) {
                    console.error('Error rendering EJS template:', err);
                    return reject(err);
                }

                // Send the email
                transporter.sendMail({
                    from: process.env.FROM_EMAIL,
                    to: to,
                    subject: subject,
                    html: htmlContent,
                }, (err, info) => {
                    if (err) {
                        console.error('Error sending email:', err);
                        return reject(err);
                    }

                    console.log('Email sent successfully:', info.messageId);
                    resolve(info);
                });
            });
        } catch (error) {
            console.error('Error:', error);
            reject(error);
        }
    });
};

export { sendRedeemEmail };
