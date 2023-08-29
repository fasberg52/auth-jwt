const Kavenegar = require("kavenegar");
const Users = require("../model/users");
const { getManager } = require("typeorm");
async function sendOtp(req,res){
    try{
         
        const userRepository = getManager().getRepository(Users);
        const phoneNumber = req.params.phone;
        const existingUser = await userRepository.findOne({
        where: { phone: phoneNumber },
        });
        const OtpApi = Kavenegar.KavenegarApi({
        apikey: process.env.KAVENEGAR_API_KEY,
        });
        OtpApi.VerifyLookup(
        {
            receptor: existingUser,
            token: "852596",
            template: "verify",
        },
        function (response, status) {
            console.log(response);
            console.log(status);
        }
        );
    }catch(error){
        console.error("Error sending otp:", error);
        res
        .status(500)
        .json({ error: "An error occurred while sending otp." });
    }
}


module.exports = { sendOtp };
