const form = document.forms['myForm']
const marginBtn = document.querySelector('.marginBtn')
const phoneMask = {mask: '+38(000)-00-00-000'}
let emailValidationCounter = 0
let formContent = {
  fName: '',
  lName: '',
  email: '',
  phoneNumbers: [],
  country: '',
  address: '',
  card: 0,
  cvv: 0,
  agreement: false
}

function setError(target, errorText) {
  target.classList.add('error')
  target.nextElementSibling.innerHTML = errorText
  target.nextElementSibling.classList.add("visible")
}

function setValid(target) {
  target.classList.remove('error')
  target.nextElementSibling.classList.remove("visible")
}

let maskedPhoneFirst = IMask(form['phone'], phoneMask)
let maskedPhoneSecond = IMask(form['phone2'], phoneMask)
let maskedPhoneThird = IMask(form['phone3'], phoneMask)
let maskedCard = IMask(form['card'],
  {
    mask: '0000-0000-0000-0000'
  }
)
IMask(form['cvv'],
  {
    mask: '000'
  }
)

const mockApiRequest = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(emailValidationCounter < 3);
    }, 1000);
  });
};

async function validateEmailAsync(target) {
  const result = await mockApiRequest(target.value);
  if(emailValidationCounter < 3) {
    emailValidationCounter++
  } else emailValidationCounter = 0

  return result ? setValid(target) : setError(target, `The email ${target.value} already exists`);
}

function throttle(mainFunction, delay) {
  let timerFlag = null;
  return (...args) => {
    if (timerFlag === null) {
      mainFunction(...args);
      timerFlag = setTimeout(() => {
        timerFlag = null;
      }, delay);
    }
  };
}

function validateNotEmpty (target) {
  if (!target.value) {
    setError(target, "Field should not be empty")
    return false
  } else {
    setValid(target)
    return true
  }
}

function validateString (target) {
  if (!target.value) {
    setError(target, "Field should not be empty")
    return false
  } else if (/^[A-Za-z]+$/.test(target.value)){
    setValid(target)
    return true
  } else {
    setError(target, "Text field must not contain numbers")
    return false
  }
}

function validatePhone (target, canBeEmpty) {
  if (!target.value) {
    if(canBeEmpty) {
      setValid(target)
      return true
    } else {
      setError(target, "Field should not be empty")
      return false
    }
  } else if (target.value.length !== 18) {
    setError(target, "Enter a valid phone number")
    return false
  } else {
    setValid(target)
    return true
  }
}

function validateEmail (target) {
  if(!target.validity.valid) {
    setError(target, target.validationMessage)
    return false;
  } else {
    setValid(target)
    return true
  }
}

function validateNumberWithLength(target, maxLength) {
  if(!target.value) {
    setError(target, 'Field should not be empty')
    return false
  } else if(target.value.length < maxLength) {
    setError(target, `Enter a valid card number, length must be ${maxLength}`)
    return false
  } else {
    setValid(target)
    return true
  }
}

function validateCountry (target) {
  if(!target.value){
    setError(target, "Select country")
    return false
  } else {
    setValid(target)
    return true
  }
}

function scrollToElement (element) {
  element.scrollIntoView()
  window.scrollBy(0, -80)
}

async function submit (event) {
  event.preventDefault();
  form['submitBtn'].disabled = true
  form['submitBtn'].value = 'Loading...'
  let scrolled = false;

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if(!validateString(form['fName']) && !scrolled) {
      scrolled = true;
      scrollToElement(form['fName'])
    } else {
      formContent.fName = form['fName'].value
    }
    if(!validateString(form['lName']) && !scrolled) {
      scrolled = true;
      scrollToElement(form['lName'])
    } else {
      formContent.lName = form['lName'].value
    }
    if(!validatePhone(form['phone']) && !scrolled) {
      scrolled = true;
      scrollToElement(form['phone'])
    } else {
      formContent.phoneNumbers = []
      formContent.phoneNumbers.push(maskedPhoneFirst.unmaskedValue);

      if(!validatePhone(form['phone2'], true) && !scrolled) {
        scrolled = true;
        scrollToElement(form['phone2'])
      } else if(maskedPhoneSecond.unmaskedValue) {
        formContent.phoneNumbers.push(maskedPhoneSecond.unmaskedValue);

        if(!validatePhone(form['phone3'], true) && !scrolled) {
          scrolled = true;
          scrollToElement(form['phone3'])
        } else if(maskedPhoneThird.unmaskedValue) {
          formContent.phoneNumbers.push(maskedPhoneThird.unmaskedValue);
        }
      }
    }
    if(!validateCountry(form['country']) && !scrolled) {
      scrolled = true;
      scrollToElement(form['country'])
    } else {
      formContent.country = form['country'].value
    }
    if(!validateNotEmpty(form['address']) && !scrolled) {
      scrolled = true;
      scrollToElement(form['address'])
    } else {
      formContent.address = form['address'].value
    }
    if(!validateNumberWithLength(form['card'], 16) && !scrolled) {
      scrolled = true;
      scrollToElement(form['card'])
    } else {
      formContent.card = maskedCard.unmaskedValue
    }
    if(!validateNumberWithLength(form['cvv'], 3) && !scrolled) {
      scrollToElement(form['cvv'])
    } else {
      formContent.cvv = form['cvv'].value
    }

    if(!form['check'].checked) {
      setError(form['check'], "Accept terms of policy!")
    } else {
      formContent.agreement = true
      setValid(form['check'])
    }

    const isFormFilled = formContent.fName && formContent.lName && formContent.phoneNumbers.length !== 0 && formContent.country && formContent.address && formContent.cvv && formContent.card && formContent.agreement

    if (isFormFilled) {
      console.log(formContent)
    }

    form['submitBtn'].disabled = false
    form['submitBtn'].value = 'Submit'
  } catch (e) {
    console.error('Error occurred:', e);
  }
}

const throttledSubmit = throttle(submit, 1000)
const throttledEmail = throttle(validateEmailAsync, 1000)

marginBtn.addEventListener('click', () => {
  form.classList.toggle('extraMargins')
})

form['fName'].addEventListener('blur', (event) => validateString(event.target))
form['lName'].addEventListener('blur', (event) => validateString(event.target))
form['country'].addEventListener('blur', (event) => validateCountry(event.target))
form['address'].addEventListener('blur', (event) => validateNotEmpty(event.target))
form['email'].addEventListener('blur', (event) => {
  if(validateEmail(event.target)){
    formContent.email = event.target.value
  }
})
form['email'].addEventListener('input', (event) => throttledEmail(event.target))
form['phone'].addEventListener('blur', (event) => {
  if(validatePhone(event.target)){
    form['phone2'].classList.add('visible')
  } else {
    form['phone2'].classList.remove('visible')
  }
})
form['phone2'].addEventListener('blur', (event) => {
  if(validatePhone(event.target, true) && event.target.value){
    form['phone3'].classList.add('visible')
  } else {
    form['phone3'].classList.remove('visible')
  }
})
form['phone3'].addEventListener('blur', (event) => validatePhone(event.target, true))
form['card'].addEventListener('blur', (event) => validateNumberWithLength(event.target, 16))
form['cvv'].addEventListener('blur', (event) => validateNumberWithLength(event.target, 3))

form.addEventListener('submit', (event) => {
  event.preventDefault();
  throttledSubmit(event)
});
