document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('amount');

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    console.log(isMobile)
    if(isMobile){
        inputElement.addEventListener('input', (e) => {
            let newValue = e.target.value.replace(/[^0-9]/g, ''); // Strip all non-numeric characters
        
            if (newValue) {
                // Treat the number as cents
                let dollarValue = parseInt(newValue, 10) / 100;
                e.target.value = `$${dollarValue.toFixed(2)}`;
            } else {
                // If no valid input is left, reset to default
                e.target.value = "$0.00";
            }
        });
    } else {
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
    console.log(tips);
    tips.forEach(tip => {
        tip.addEventListener('click', (e) => {
            console.log(e.target)
            if(e.target.classList.contains('selected')){
                e.target.classList.remove('selected');
                return;
            }
            e.target.classList.add('selected');
        });
    });
});



function qsa(selector) {
    return document.querySelectorAll(selector);
}

function qs(selector) {
    return document.querySelector(selector);
}