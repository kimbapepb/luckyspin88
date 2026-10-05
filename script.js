function login() {

    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (password === "notredame") {

        message.style.color = "#00ff88";
        message.innerHTML = "ACCESS GRANTED";

        setTimeout(function () {

            window.location.href = "dashboard.html";

        }, 1000);

    } else {

        message.style.color = "#ff4444";
        message.innerHTML = "ACCESS DENIED";

        document.getElementById("password").value = "";

    }

}

document.getElementById("password").addEventListener("keypress", function(event){

    if(event.key === "Enter"){

        login();

    }

});


document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("button").forEach(btn=>{
        btn.addEventListener("click", function(){
            this.style.transform="scale(.96)";
            setTimeout(()=>this.style.transform="",120);
        });
    });

    const observer = new MutationObserver(()=>{
        document.querySelectorAll("#terminal,#result,#analysis").forEach(el=>{
            if(el.innerHTML.trim()) el.classList.add("reveal");
        });
    });

    observer.observe(document.body,{childList:true,subtree:true});
});



document.addEventListener("DOMContentLoaded",()=>{

    // Add animated counters for numerical dashboard values
    document.querySelectorAll(".stats b").forEach(item=>{
        item.parentElement.classList.add("data-live");
    });

    // Keyboard shortcut for security-console feeling
    document.addEventListener("keydown",(e)=>{
        if(e.key==="Escape"){
            document.body.classList.toggle("focus-mode");
        }
    });

    // Add loading transition before navigation
    document.querySelectorAll("button").forEach(btn=>{
        btn.addEventListener("click",()=>{
            btn.innerHTML = "PROCESSING...";
            setTimeout(()=>{
                if(btn.innerHTML==="PROCESSING...")
                    btn.innerHTML="CONTINUE";
            },700);
        });
    });
});




// System notification sound using Web Audio API
function securityBeep(type="normal"){
    try{
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = type==="warning" ? 880 : 440;
        gain.gain.value = 0.05;

        osc.start();
        setTimeout(()=>{
            osc.stop();
            ctx.close();
        },180);
    }catch(e){}
}


document.addEventListener("click", function(e){
    if(e.target.tagName==="BUTTON"){
        securityBeep("normal");
    }
});


function systemBoot(target){
    const messages=[
        "INITIALIZING SECURITY MODULE...",
        "CONNECTING ANALYSIS ENGINE...",
        "VERIFYING DIGITAL EVIDENCE...",
        "SYSTEM READY"
    ];

    let i=0;
    const timer=setInterval(()=>{
        if(target){
            target.innerHTML += messages[i]+"<br>";
        }
        i++;
        if(i>=messages.length) clearInterval(timer);
    },600);
}


window.addEventListener("load",()=>{
    const terminal=document.getElementById("terminal");
    if(terminal){
        systemBoot(terminal);
    }
});



const operationEvents=[
"08:00 DOMAIN IDENTIFIED - Gangseo-gu Seoul",
"08:15 CONNECTION MONITORING ESTABLISHED",
"08:30 DIGITAL EVIDENCE VERIFIED",
"08:45 TRANSACTION PATTERN ANALYZED",
"09:00 TERMINATION PROTOCOL PREPARED"
];

function startOperationTimeline(target){
    if(!target) return;
    let i=0;
    let timer=setInterval(()=>{
        if(i<operationEvents.length){
            target.innerHTML += operationEvents[i]+"<br>";
            i++;
        }else{
            clearInterval(timer);
        }
    },700);
}


function epbVoice(message){
    if(window.speechSynthesis){
        const voice=new SpeechSynthesisUtterance(message);
        voice.rate=0.9;
        voice.pitch=0.8;
        window.speechSynthesis.speak(voice);
    }
}

document.addEventListener("click",function(e){
    if(e.target.tagName==="BUTTON"){
        epbVoice("EPB system activated. Processing operation.");
    }
});

window.addEventListener("load",function(){
    setTimeout(()=>{
        epbVoice("Elite Protection Bureau Seoul system online.");
    },800);
});
