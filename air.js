const request = require('request');
const ci = require('cheerio');

let apiKey = "nW3EJz4NLt7NpHjIMycEfFmPF7%2Bv%2BFnUeSMDE7ZsyQLzMfjwEKYLpFunSgAE%2FaAvVfGQlC84mtWDgSn3Ru9I4Q%3D%3D";
let url = `http://openapi.airkorea.or.kr//openapi/services/rest/MsrstnInfoInqireSvc/getNearbyMsrstnList?tmX=244148.546388&tmY=412423.75772&pageNo=1&numOfRows=10&_returnType=json&ServiceKey=${apiKey}`;

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    }
}

request(url, options, function(req, res, body){
    console.log(body);
});