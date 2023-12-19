const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
const phoneSchema = {
  type: "object",
  properties: {
    phone: { type: "string", pattern: "^09\\d{9}$" },
  },
  required: ["phone"],
  additionalProperties: false,
  errorMessage: {
    properties: {
      phone: "فرمت شماره همراه صحیح نیست",
    },
    additionalProperties: "اطلاعات اضافی مجاز نیست",
  },
};

const loginWithOTPSchema = {
  type: "object",
  properties: {
    phone: { type: "string", pattern: "^09\\d{9}$" },

    otp: { type: "string", pattern: "^[0-9]{5}$" },
  },
  required: ["otp", "phone"],
  errorMessage: {
    properties: {
      phone: "فرمت شماره همراه صحیح نیست",
      otp: "رمز یکبار مصرف را 5 رقم وارد کنید",
    },
  },
};
const signUpSchema = {
  type: "object",
  properties: {
    firstName: { type: "string", pattern: "^[آ-ی ]+$" },
    lastName: { type: "string", pattern: "^[آ-ی ]+$" },
    phone: { type: "string", pattern: "^09\\d{9}$" },

    password: {
      type: "string",
      pattern: "^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$",
      minLength: 5,
    },
    roles: {
      type: "string",
    },
    imageUrl: {
      type: "string",
    },
    grade: {
      type: "string",
    },
  },
  required: ["firstName", "lastName"],
  additionalProperties: false,
  errorMessage: {
    properties: {
      firstName: "نام خود را فارسی وارد کنید",
      lastName: "فامیل خود را فارسی وارد کنید",
      phone: "فرمت شماره همراه صحیح نیست",
      password: "لطفا ترکیبی از حروف و اعداد وارد کنید",
    },
    additionalProperties: "وارد کردن اطلاعات اضافی مجاز نیست",
  },
};

const createPartSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    chapterId: { type: "integer" },
    description: { type: "string" },
    videoPath: { type: "string", pattern: "^(.*\\.(mp4|m4v))$" },
  },
  required: ["title", "chapterId", "description", "videoPath"],
  errorMessage: {
    properties: {
      title: "Input should be a string",
      chapterId: "Input should be an integer",
      description: "Input should be a string",
      videoPath: "Format is wrong. Supported formats: mp4, m4v",
    },
  },
};

const courseSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1 },
  },
  required: ["title"],
  errorMessage: {
    properties: {
      title: "شما باید عنوان را وارد کنید",
    },
  },
};

const phoneValidator = ajv.compile(phoneSchema);
const loginWithOTPValidator = ajv.compile(loginWithOTPSchema);
const signUpValidator = ajv.compile(signUpSchema);
const partValidator = ajv.compile(createPartSchema);
const courseValidator = ajv.compile(courseSchema);
module.exports = {
  phoneValidator,
  loginWithOTPValidator,
  signUpValidator,
  partValidator,
  courseValidator,
};
