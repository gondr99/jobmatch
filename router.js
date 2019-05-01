const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const qs = require('querystring');
const mysql = require('mysql');
const router = express.Router(); 

const dbinfo = require('./dbinfo');
const Top20 = require('./mymodules/Top20');
const lunch = require('./mymodules/lunch');

const datalab = require('./mymodules/NaverData');

const conn = mysql.createConnection(dbinfo);

conn.query("USE yy_30201"); //yy_30201 데이터베이스 사용

router.get('/', function (req, res) {
    res.render('main', { msg: 'Welcome To Express4' });
});

router.get('/top20', function(req, res){
    Top20(function(list){
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

router.get("/datalab2", function(req, res){
    let data = [
        {"groupName":"방탄소년단","keywords":["방탄소년단", "BTS", "RM","전정국"]},
        {"groupName":"트와이스","keywords":["트와이스", "Twice", "트둥이", "원스"]}
    ];

    datalab("2019-02-01", "2019-04-30", "week", data, function(result){
        let colors = ["rgb(255, 192, 192)", "rgb(75, 192, 255)", "rgb(75, 255, 128)"];

        let gData = {"labels":[], "datasets":[]};

        let r = result.results;

        for(let i = 0; i < r.length; i++){
            let item = {
                "label":r[i].title, 
                "borderColor":colors[i], 
                "fill":false, 
                "lineTension":0.2, 
                "data":[]
            };

            for(let j = 0; j < r[i].data.length; j++){
                item.data.push(r[i].data[j].ratio);
                if(i == 0){
                    let date = r[i].data[j].period;
                    let arr = date.split("-");
                    gData.labels.push(arr[1]+ arr[2]);
                }
            }

            gData.datasets.push(item);
        }

        res.render('datalab2', {g:gData});
        
    });
});

module.exports = router;