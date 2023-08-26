var Kavenegar = require('kavenegar');
var api = Kavenegar.KavenegarApi({
    apikey: '467033554A54724376674566726738614741623744546462536A32377A6D78525A793942736678624A62343D'
});
api.VerifyLookup({
    receptor: "09218913541",
    token: "852596",
    template: "verify"
}, function(response, status) {
    console.log(response);
    console.log(status);
});