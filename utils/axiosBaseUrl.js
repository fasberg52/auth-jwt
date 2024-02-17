export const quiz24 = axios.create({
  baseURL: "https://www.quiz24.ir/api/v1",
  timeout: 1000,
  headers: {
    "x-api-key": process.env.X_Api_Key,
    "Content-Type": "application/json",
  },
});


