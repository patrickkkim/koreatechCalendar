var calendarSize = 8;
document.addEventListener("DOMContentLoaded", () => {
    loadCalendar();
    updateLike();
});

function loadCalendar(){
    const date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    const monthText = document.createElement("h1");
    monthText.innerHTML = month + "월";
    monthText.setAttribute("class", "mb-4");
    document.querySelector("#calendarFrame").append(monthText);
    const today = date.getDate();

    var row = document.createElement("div");
    for (var i = 0; i < calendarSize; ++i){
        if (day > daysInMonth(year, month)){
            day = 1;
            month++;
        }
        if (month > 12){
            month = 1;
            year++;
        }
        row.setAttribute("class", "row");
        if (i === (calendarSize / 2)){
            document.querySelector("#calendarFrame").append(row);
            row = document.createElement("div");
            row.setAttribute("class", "row");
        }
        const col = document.createElement("div");
        col.setAttribute("class", "d-flex col-lg py-2");
        const dayBox = document.createElement("div");
        dayBox.setAttribute("id", "day:" + day);
        dayBox.setAttribute("class", "\
            col-lg pt-4 pb-5 card-custom border-dark");
        const digit = document.createElement("h4");
        digit.setAttribute("class", "card-title");
        digit.innerHTML = day;
        const eventNote = document.createElement("div");

        const request = new XMLHttpRequest();
        request.open("POST", "/getevent");
        request.onload = () => {
            const response = JSON.parse(request.responseText);
            if (response !== null){
                for (var i = 0; i < response.length && i < 3; ++i){
                    const p = document.createElement("label");
                    p.setAttribute("class", "card-text d-block pt-2");
                    if (response[i]["note"].length > 100){
                        p.innerHTML = response[i]["note"].slice(0,50) + "...";
                    }
                    else{
                        p.innerHTML = response[i]["note"];
                    }
                    eventNote.append(p);
                    const subLineDiv = document.createElement("div");
                    subLineDiv.setAttribute("class", "form-inline \
                        justify-content-between mb-3");
                    const like = document.createElement("label");
                    like.setAttribute("style", "font-size: 12px");
                    like.setAttribute("class", "card-text text-muted");
                    like.innerHTML = " 좋아요: " + response[i]["likeCount"];
                    subLineDiv.append(like);
                    const buttonDiv = document.createElement("div");
                    buttonDiv.setAttribute("class", "d-flex");
                    buttonDiv.setAttribute("id", `event${response[i]["id"]}`);
                    const up = document.createElement("button");
                    up.setAttribute("class", "vote mr-1 btn btn-outline-success btn-xs");
                    up.setAttribute("value", true);
                    up.setAttribute("data-toggle", "button");
                    up.setAttribute("aria-pressed", false);
                    up.innerHTML = "▲";
                    buttonDiv.append(up);
                    const down = document.createElement("button");
                    down.setAttribute("class", "vote btn btn-outline-danger btn-xs");
                    down.setAttribute("value", false);
                    down.setAttribute("data-toggle", "button");
                    down.setAttribute("aria-pressed", false);
                    down.innerHTML = "▼";
                    buttonDiv.append(down);
                    subLineDiv.append(buttonDiv);
                    eventNote.append(subLineDiv);
                    document.querySelectorAll(".vote").forEach( btn => {
                        btn.onclick = e => {
                            const data = new FormData();
                            let value;
                            if (e.target.value === "true"){ value = true; }
                            else { value = false; }
                            const wasPressed = e.target.getAttribute("aria-pressed");
                            if (wasPressed === "true"){
                                data.append("value", !(value));
                                e.target.setAttribute("aria-pressed", false);
                            }
                            else{
                                data.append("value", value);
                                e.target.setAttribute("aria-pressed", true);
                                //If the other button was pressed
                                if (value){
                                    const buttonDiv = e.target.parentNode;
                                    if (buttonDiv.childNodes[1].getAttribute("aria-pressed") === "true"){
                                        //Uncheck that other button and change the total like value
                                        const className = buttonDiv.childNodes[1].className.split("active")[0];
                                        buttonDiv.childNodes[1].setAttribute("class", className);
                                        buttonDiv.childNodes[1].setAttribute("aria-pressed", false);
                                    }
                                }
                                else { 
                                    if (buttonDiv.childNodes[0].getAttribute("aria-pressed") === "true"){
                                        //Uncheck that other button and change the total like value
                                        const className = buttonDiv.childNodes[0].className.split("active")[0];
                                        buttonDiv.childNodes[0].setAttribute("class", className);
                                        buttonDiv.childNodes[0].setAttribute("aria-pressed", false);
                                    }
                                }
                            }
                            const request = new XMLHttpRequest();
                            request.open("POST", "/updatelike");
                            data.append("eventId", e.target.parentNode.id.split("event")[1]);
                            request.setRequestHeader("X-CSRFToken", csrftoken);
                            request.send(data);
                            return false;
                        };
                    });
                }
            }
            return false;
        };
        const data = new FormData();
        data.append("year", year);
        data.append("month", month);
        data.append("day", day);
        request.setRequestHeader("X-CSRFToken", csrftoken);
        request.send(data);

        dayBox.append(digit);
        dayBox.append(eventNote);
        col.append(dayBox);
        row.append(col);
        day++;
    }
    document.querySelector("#calendarFrame").append(row);
}

function daysInMonth(year, month){
    const days = new Date(year, month, 0).getDate();
    return days;
}

function updateLike(){
    const date = new Date();
    const startDateStr = String(date.getFullYear()) + "-" + 
        String(date.getMonth() + 1) + "-" + String(date.getDate());
    const endDate = date.setDate(date.getDate() + calendarSize - 1);
    const endDateStr = String(date.getFullYear()) + "-" + 
        String(date.getMonth() + 1) + "-" + String(date.getDate());
    const request = new XMLHttpRequest();
    request.open("POST", "getuserlike");
    request.onload = () => {
        response = JSON.parse(request.responseText);
        for (var i = 0; i < response.length; ++i){
            const buttonDiv = document.querySelector(`#event${response[i]["event_id"]}`);
            const value = response[i]["value"];
            if (value){
                const className = buttonDiv.childNodes[0].className + " " + "active";
                buttonDiv.childNodes[0].setAttribute("class", className);
                buttonDiv.childNodes[0].setAttribute("aria-pressed", true);
            }
            else {
                const className = buttonDiv.childNodes[1].className + " " + "active";
                buttonDiv.childNodes[1].setAttribute("class", className);
                buttonDiv.childNodes[1].setAttribute("aria-pressed", true);
            }
        }
        return false;
    };
    request.setRequestHeader("X-CSRFToken", csrftoken);
    const data = new FormData();
    data.append("startDate", startDateStr);
    data.append("endDate", endDateStr);
    request.send(data);
}