const express = require('express');
const http = require('http');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');  //여기
const qs = require('querystring');
const iconv = require('iconv-lite');  //인코딩 변환도구
const charset = require('charset');  //캐릭터셋 체크 도구
const mysql = require('mysql');

/* mysql 연결부분 */
const conn = mysql.createConnection({
    user: "yy_30201",
    password: "1234",
    host:"gondr.asuscomm.com"
});

conn.query("USE yy_30201"); //yy_30201 데이터베이스 사용


/* mysql 연결 종료 */

let app = express();

app.set('port', 12000);

app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); //미들웨어로 바디파서를 사용함. //여기
app.use(bodyParser.urlencoded({extended:true})); //여기

app.get('/', function (req, res) {
    res.render('main', { msg: 'Welcome To Express4' });
});

app.get('/top20', function(req, res){

    request("https://www.naver.com", function(err, response, body){
        let list = [];
        $ = cheerio.load(body);

        let top20 = $(".ah_roll_area > .ah_l > li > a > .ah_k");

        for(let i = 0; i < top20.length; i++){
            let msg = $(top20[i]).text();
            list.push(msg);
        }

        res.render('top', {msg:'네이버 실시간 급상승 검색어', list:list});
    });
});


app.get('/search', function(req, res){
    res.render('search',{});
});

app.post('/search', function(req, res){
    let word = req.body.word;
    word = qs.escape(word);
    let url = "https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=" + word;
    request(url, function(err, response, body){
        let list = [];
        $ = cheerio.load(body);

        let result = $(".sp_website .type01 > li dt > a:first-child");

        for(let i = 0; i < result.length; i++){
            let msg = $(result[i]).text();
            list.push(msg);
        }

        res.render('search', {msg:'검색 결과', list:list});
    });
});

app.get('/lunch', function(req, res){
    res.render('lunch', {});
});

app.post('/lunch', function(req, res){
    let date = req.body.date;
    date = date.split("-").join("");
    const options = {
        url: 'http://www.y-y.hs.kr/lunch.view?date=' + date,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        },
        encoding:null  //인코딩 값을 널로주어 별도의 인코딩을 하지 않게 한다.
    }
    request(options, function (err, response, body) {
        if (err != null) {
            console.log(err);
            return;
        }
        
        const enc = charset(response.headers, body); //사이트의 인코딩을 알아냄. 급식페이지는 euc-kr임
        const result = iconv.decode(body, enc);
    
        $ = cheerio.load(result);
        let menu = $(".menuName > span");
        res.render('lunch', {menu : menu.text()});
    });
    
});

app.get('/board', function(req, res){
    let sql = "SELECT * FROM board WHERE title LIKE ? ORDER BY id DESC";
    
    let keyword = "%%";
    console.log(req.query.key);
    if(req.query.key != undefined){
        keyword = "%" + req.query.key + "%";
    }
    console.log(keyword);
    conn.query(sql, [keyword], function(err, result){
        res.render('board', {list:result});
    });
});

app.get('/board/write', function(req, res){
    res.render('write', {});
});

app.post('/board/write', function(req, res){
    let param = [req.body.title, req.body.content, req.body.writer];

    let sql = "INSERT INTO board (title, content, writer) VALUES(?, ?, ?)";
    conn.query(sql, param, function(err, result){
        if(!err) {
            res.redirect('/board');
        }
    });
});

let server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log(`Express 엔진이 ${app.get('port')}에서 실행중`);
});


