for(let i = 0; i < 10; i++){
    setTimeout(function(){
        console.log(i);
    }, Math.random() * 2000 + 1000);
}