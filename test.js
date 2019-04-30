function proTest(rand){
    return new Promise((res, rej) => {
        setTimeout(function(){
            res("");
        }, rand)
    });
}

async function test(){
    let sum = 0;
    for(let i = 1; i <= 10; i++){
        let rand = Math.random() * 2000 + 1000;
        await proTest(rand);
        console.log(i);
        sum += i;
    }
    return sum;
}

async function start(){
    console.log(await test());
}


start();


//https://holywater-jeong.github.io/blog/node-mysql-async-await/  mysql비동기 처리관련 잘 나온 포스팅