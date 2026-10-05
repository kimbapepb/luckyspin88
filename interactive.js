function typeEffect(element, text, speed=25){
    let i=0;
    element.innerHTML="";
    const timer=setInterval(()=>{
        element.innerHTML += text[i];
        i++;
        if(i>=text.length) clearInterval(timer);
    },speed);
}
