document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('amount');

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    console.log(isMobile)
    if(isMobile){
        let previousValue = "000";

        inputElement.addEventListener('input', (e) => {
            let newValue = e.target.value.replace(/[^0-9]/g, '');  // Strip all non-numeric characters
            
            // Handle addition of numbers
            if (newValue.length > previousValue.length) {
                newValue = previousValue + newValue.slice(-1); // Append the last typed digit to the end
            } 
            // Handle deletion of numbers (backspace or delete)
            else if (newValue.length < previousValue.length) {
                newValue = previousValue.slice(0, -1); // Remove the last character
            }
        
            // Adjust the length of newValue to at least 3 characters by padding zeros
            while (newValue.length < 3) {
                newValue = "0" + newValue;
            }
            
            let dollarValue = parseInt(newValue, 10) / 100;
            e.target.value = `$${dollarValue.toFixed(2)}`;
            previousValue = newValue;
        });    } else {
        inputElement.addEventListener('keydown', (e) => {
            console.log(1);
            // Ensure pressed key is a number or backspace
            if ((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode === 8) {
                let currentValue = parseFloat(inputElement.value.replace('$', '')).toFixed(2);
                let newStr;
        
                if (e.keyCode === 8) { // Handle backspace
                    if(inputElement.value === "$0.00"){
                        console.log(0);
                        newStr = "0";
                    } else {
                        newStr = (currentValue * 10).toString().slice(0, -1);
                    }
                } else { // Handle number press
                    let pressedNumber = e.key;
                    newStr = currentValue.replace('.', '') + pressedNumber;
                }
        
                let newNumber = parseInt(newStr, 10) / 100;
                inputElement.value = `$${newNumber.toFixed(2)}`;
            }
            e.preventDefault(); // Prevent any default behavior
        });
    
    }

    let tips = qsa('.tip-percent');
    let customTip = id('customTip');
    tips.forEach(tip => {
        tip.addEventListener('click', (e) => {
            if(e.target.classList.contains('selected')){
                e.target.classList.remove('selected');
                customTip.readOnly = false;
                return;
            }
            tips.forEach(tip => {
                tip.classList.remove('selected');
            });
            e.target.classList.add('selected');
            customTip.value = '';
            customTip.readOnly = true;
        });
    });

    let inputs = qsa('input');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {checkInput(e)})
    });
    id('add').addEventListener('click', (e) => {checkInput(e)});
    id('minus').addEventListener('click', (e) => {checkInput(e)});

}); 

function addItem(){
    let input = qs(".add-prices").querySelector('input');
    let price = input.value;
    if(parseInt(price) === 0){
        return;
    }
    price = parseInt(price).toFixed(2).toString();
    price = "$" + price;
    let items = qs(".new-person").querySelector('.items');
    let itemElement = document.createElement('p');
    itemElement.innerHTML = price;
    items.appendChild(itemElement);
}

function minusItem(){
    let items = qs(".new-person").querySelector('.items');
    let itemElement = items.lastChild;
    items.removeChild(itemElement);
}

function parsePerson(){
    let person = {};
    let name = id('new-name').value;
    let items = qs(".new-person").querySelector('.items');
    person.name = name;
    person.items = items;
    createNewPerson(person);
    blurToggle()
}

function createNewPerson(person){
    let personElement = document.createElement('div');
    let total = parseFloat(id('amount').value.replace('$', ''));
    let totalTax = parseFloat(id('tax').value.replace('$', ''));
    let totalTip = parseFloat(id('tip').value.replace('$', ''));

    let subtotal = 0;
    let tax = 0;
    let tip = 0;
    let totalOwed = 0;
    for(item of person.items.children){
        subtotal += parseFloat(item.innerHTML.replace('$', ''));
    }
    let ratio = subtotal / total;
    tax = (ratio * 0.07).toFixed(2);
    personElement.classList.add('person');
    personElement.innerHTML = `
            <div class="top">
                <h3>${person.name}</h3>
                <h3 class="accent">$500.00</h3>
            </div>
            <div class="item-container">
                <div class="items">
                </div>
                <div class="total">
                        <div class="total-item">
                            <p>Subtotal</p>
                            <h4 id="grab-subtitle">$0.00</h4>    
                        </div>
                        <div class="total-item">
                            <p>Tax</p>
                            <h4 id="grab-tax">$0.00</h4>    
                        </div>
                        <div class="total-item">
                            <p>Tip</p>
                            <h4 id="grab-tip">$0.00</h4>    
                        </div>
                </div>  
            </div>

    `;
}

function checkInput(event){
    let empty = false;
    let parent = event.target.parentNode;
    while(parent.tagName != "SECTION"){
        parent = parent.parentNode;
    }
    let inputs = parent.querySelectorAll('input');
    inputs.forEach(input => {
        if(input.name === "prices"){
            let itemsElement = parent.querySelector('.items');
            if(itemsElement.children.length === 0){
                empty = true;
            }
        } else{
            if(input.value === ""){
                empty = true;
            }
        }
    });
    console.log(parent);
    if(empty){
        console.log(parent.querySelector(".validation"))
        parent.querySelector(".validation").classList.remove('active');
    } else {
        console.log(parent.querySelector(".validation"))
        parent.querySelector(".validation").classList.add('active');
    }
}

function blurToggle(){
    let blur = qs('.blur');
    let newPerson = qs(".new-person");
    blur.classList.toggle('active');
    newPerson.classList.toggle('active');
    console.log("blur");
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}

function qs(selector) {
    return document.querySelector(selector);
}

function id(element){
    return document.getElementById(element);
}