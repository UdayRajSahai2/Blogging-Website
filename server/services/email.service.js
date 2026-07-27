//server\services\email.service.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPendingApprovalEmail = async (email, firstName) => {
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Registration Received",
    html: `
  <div style="font-family:Arial,sans-serif;padding:20px;color:#333">
    <h2>Hello ${firstName},</h2>

    <p>Thank you for registering with us.</p>

    <p>Your account is currently <b>pending approval</b>. We'll notify you by email once it's approved.</p>

    <a href="${process.env.CLIENT_URL}/signin"
      style="display:inline-block;margin-top:15px;padding:10px 18px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">
      Login
    </a>

  </div>
`,
  });
};
export const sendApprovalEmail = async (email, firstName) => {
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Account is Approved",
    html: `
  <div style="font-family:Arial,sans-serif;padding:20px;color:#333">
    <h2>Congratulations, ${firstName}! </h2>

    <p>Your account has been <b>approved</b>. You can now log in and access your account.</p>

    <a href="${process.env.CLIENT_URL}/signin"
       style="display:inline-block;margin-top:15px;padding:10px 18px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">
      Login Now
    </a>
  </div>
`,
  });
};

export const sendRejectionEmail = async (email, firstName) => {
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Account Application Update",
    html: `
      <div style="font-family:Arial;padding:10px">
        <h2>Hello ${firstName}</h2>

        <p>After reviewing your application, we are unable to approve your account at this time.</p>

        <p>You may contact support or reapply if needed.</p>

        <a href="${process.env.CLIENT_URL}/signin""
           style="display:inline-block;margin-top:10px;padding:10px 15px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
          Return to Login
        </a>
      </div>
    `,
  });
};

export const sendAdminSignupNotification = async (user, enrollment) => {
  await transporter.sendMail({
    from: `"Reach Foundation" <${process.env.EMAIL_USER}>`,
    to: "ceprab24@gmail.com",
    subject: "New User Awaiting Approval",

    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:30px;">
        <div style="max-width:650px;margin:auto;background:#fff;border:1px solid #ddd;border-radius:8px;padding:24px;">

          <h2 style="margin-top:0;color:#222;">📝 New Enrollment</h2>

          <p>A new user has registered and is awaiting approval.</p>

          <h3>User Details</h3>

          <table cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;width:35%;">Name</td>
              <td style="border:1px solid #ddd;">
                ${user.first_name} ${user.last_name}
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;">Email</td>
              <td style="border:1px solid #ddd;">
                ${user.email}
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;">Mobile</td>
              <td style="border:1px solid #ddd;">
                ${user.mobile_number || "N/A"}
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;">Status</td>
              <td style="border:1px solid #ddd;">
                <span style="background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;font-weight:bold;">
                  Pending Approval
                </span>
              </td>
            </tr>
          </table>

          <h3 style="margin-top:30px;">Referrer Details</h3>

          <table cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;width:35%;">Name</td>
              <td style="border:1px solid #ddd;">
                ${enrollment.referrer_name || ""}
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;">Email</td>
              <td style="border:1px solid #ddd;">
                ${enrollment.referrer_email || "N/A"}
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;">Mobile</td>
              <td style="border:1px solid #ddd;">
                ${enrollment.referrer_mobile || "N/A"}
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #ddd;font-weight:bold;">District</td>
              <td style="border:1px solid #ddd;">
                ${enrollment.referrer_district || "N/A"}
              </td>
            </tr>
          </table>

          <div style="margin-top:30px;text-align:center;">
            <a
              href="${process.env.CLIENT_URL}/signin"
              style="display:inline-block;padding:12px 22px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;"
            >
              Review Application on Admin Panel
            </a>
          </div>

        </div>
      </div>
    `,
  });
};
