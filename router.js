const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const qs = require('querystring');
const router = express.Router(); 
const mysql = require('mysql');
const lunch = require('./lunch');

const dbinfo = require('./dbinfo');

/* mysql 연결부분 */
const conn = mysql.createConnection(dbinfo);

conn.query("USE yy_30201"); //yy_30201 데이터베이스 사용
// DB연결 종료

const dlab = require('./datalab');


router.get('/', function (req, res) {
    res.render('main', { msg: 'Welcome To Express4' });
});


router.get('/top20', function(req, res){

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


router.get('/search', function(req, res){
    res.render('search',{});
});

router.post('/search', function(req, res){
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

router.get('/lunch', function(req, res){
    res.render('lunch', {});
});

router.post('/lunch', function(req, res){
    lunch(req.body.date, function(menu){
        res.render('lunch', { menu: menu });
    });
});

router.get('/board', function(req, res){
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

router.get('/board/write', function(req, res){
    res.render('write', {});
});

router.post('/board/write', function(req, res){
    let param = [req.body.title, req.body.content, req.body.writer];

    let sql = "INSERT INTO board (title, content, writer) VALUES(?, ?, ?)";
    conn.query(sql, param, function(err, result){
        if(!err) {
            res.redirect('/board');
        }
    });
});

router.get('/datalab', function(req, res){
    let data = [
        {
            "groupName": "키보드",
            "keywords": [ "리얼포스", "앱코", "필코"]
        },
        {
            "groupName": "모니터",
            "keywords": [ "알파스캔", "큐닉스", "LG"]
        },
    ];

    dlab("2019-01-01", "2019-04-30", "week", data, function (g){
        let colors = ["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)"];
        let graphData = {"labels":[], "datasets":[]};

        // {
        //     "labels": ["0107", "0114", "0121", "0128", "0204", "0211", "0218", "0225", "0304", "0311"],
        //     "datasets":[
        //         {"label":"키보드", "data":[41, 38, 44, 49, 47, 42, 38, 36, 33, 31], "borderColor":"rgba(75, 192, 192)", "lineTension":0.1},
        //         {"label":"모니터", "data":[24, 35, 22, 11, 42, 65, 79, 64, 22, 21], "borderColor":"rgba(255, 192, 42)", "lineTension":0.1}
        //     ]
        // }

        let result = g.results;
        
        for(let i = 0; i < result.length; i++){
            let x = result[i];
            let item = {"label": x.title, "borderColor":colors[i], "lineTension":0.1, "data":[]};
            for(let j = 0; j < x.data.length; j++){
                item.data.push(x.data[j].ratio);
                if(i == 0){
                    let arr = x.data[j].period.split("-");

                    graphData.labels.push(arr[1] + arr[2]);
                }
            }
            graphData.datasets.push(item);
        }
        
        res.render('datalab', {graphData:graphData});
    });


});

module.exports = router;