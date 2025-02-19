'use strict' 

//Get a list of accounts based on the account_type
let accountTypeList = document.querySelector("#accountTypeList")
accountTypeList.addEventListener("change", function () { 
    let account_type = accountTypeList.value 
    console.log(`account_type is: ${account_type}`) 
    let accountTypeURL = "/account/getAccounts/"+ account_type
    fetch(accountTypeURL) 
    .then(function (response) { 
    if (response.ok) { 
    return response.json(); 
    } 
    throw Error("Network response was not OK"); 
    }) 
    .then(function (data) { 
    console.log(data); 
    buildAccountList(data); 
    }) 
    .catch(function (error) { 
    console.log('There was a problem: ', error.message) 
    }) 
})



// Build account entry into HTML table components and inject into DOM 
function buildAccountList(data) { 
    let accountDisplay = document.getElementById("accountDisplay"); 
    // Set up the table labels 
    let dataTable = '<thead>'; 
    dataTable += '<tr><th>Accounts Summary</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
    dataTable += '</thead>'; 
    // Set up the table body 
    dataTable += '<tbody>'; 
    // Iterate over all vehicles in the array and put each in a row 
    data.forEach(function (element) { 
     console.log(element.account_id + ", " + element.account_email); 
     dataTable += `<tr><td>${element.account_firstname} ${element.account_lastname}</td>`; 
     dataTable += `<td><a href='/account/Admin/update/${element.account_id}' title='Click to update'>Admin Update Account</a></td>`; 
     dataTable += `<td><a href='/account/Admin/delete/${element.account_id}' title='Click to delete'>Admin Delete Account</a></td></tr>`; 
    }) 
    dataTable += '</tbody>'; 
    // Display the contents in the Inventory Management view 
    accountDisplay.innerHTML = dataTable; 
}



