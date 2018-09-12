export function getMonthsBetween(sD, eD) {
    var startDate = new Date(sD.replace(/-/g, "/"));
    var stopDate = new Date(eD.replace(/-/g, "/"));
    
    var dateArray = [];
    var currentDate = startDate;


    while (currentDate <= stopDate) {
        console.log(sD + " - " + eD);
        console.log(currentDate);
        var mStr = currentDate.getFullYear() + "-" + padMonth(currentDate.getMonth()+1);
        if (dateArray.indexOf(mStr) === -1)  // If it's not already in
            dateArray.push(mStr);

        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}


function padMonth(m) {
    return ("0"+m).substr(-2);
}