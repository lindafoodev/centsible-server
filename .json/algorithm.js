// calculate y with gain.

// function userY(gain,yearBefore){
//     return gain/100 * yearBefore 
// }

function user(gain,userid){
    User
    .findById({userid})
    .then(data => {
        return {
        gain: gain/100 * data.currentFund,
        fund: data.currentFund
    }})
}

async function userUpdate(gain,userid){
    let quickMaths = await user(gain,userid);
    let newFund = quickMaths.gain + quickMaths.fund;
    console.log(quickMaths)
    User
    .findByIdAndUpdate(userid,{currentFund: newFund,previousFund: quickMaths.fund})
    .then(data => data)
    .catch(err => console.log(err))
}

// function risk(gain,userid){
//     Risk
//     .findById({userid})
//     .then(data => {
//         return {
//         gain: gain/100 * data.currentFund,
//         fund: data.currentFund
//     }})
// }

// async function riskUpdate(gain,userid){
//     let quickMaths = await user(gain,userid);
//     let newFund = quickMaths.gain + quickMaths.fund;
//     console.log(quickMaths)
//     User
//     .findByIdAndUpdate(userid,{currentFund: newFund})
//     .then(data => data)
//     .catch(err => console.log(err))
// }