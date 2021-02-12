'use strict';

const container = document.querySelector('.container');
const containerOperations = document.querySelector('.operations');
const headerBalance = document.querySelector('.header__balance');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelInterest = document.querySelector('.summary__value--interest');
const labelWelcome = document.querySelector('.nav__welcome');

const inputLogin = document.querySelector('.login__input--user');
const inputPin = document.querySelector('.login__input--pin');
const btnLogin = document.querySelector('.login__btn');
const btnLogOut = document.querySelector('.log-out');

const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const btnTransfer = document.querySelector('.form__btn--transfer');

const btnCloseAcc = document.querySelector('.form__btn--close');
const inputUserCloseAcc = document.querySelector('.form__input--user');
const inputPinCloseAcc = document.querySelector('.form__input--pin');

const btnLoan = document.querySelector('.form__btn--request');
const inputLoan = document.querySelector('.form__input--request-amount');
const sortBtn = document.querySelector('.btn--sort');

const labelDate = document.querySelector('.header-date');
const sessionLabel = document.querySelector('.session');

btnLogOut.style.opacity = 0;
container.style.opacity = 0;

const eurToUsd = 1.1;
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const movementsToUSD = movements.map(mov => Math.trunc(mov * eurToUsd));

const account1 = {
  owner: 'Jonas Schmedtmann',
  operations: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-02-10T21:31:17.178Z',
    '2021-02-06T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-02-10T23:36:17.929Z',
    '2021-02-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  operations: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

const calcPassedDate = (date, today) => {
  return Math.round(Math.abs(today - date) / (1000 * 60 * 60 * 24));
};

const displayPassedDate = (date, locale) => {
  const daysPassed = calcPassedDate(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getUTCMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format();
  }
};

const formatCurrency = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayOperations = (acc, sort = false) => {
  containerOperations.innerHTML = '';

  const ops = sort
    ? acc.operations.slice().sort((a, b) => a - b)
    : acc.operations;
  ops.forEach((operation, index) => {
    const type = operation > 0 ? 'deposit' : 'withdrawal';
    const displayDate = displayPassedDate(
      new Date(acc.movementsDates[index]),
      acc.locale
    );
    const formattedOp = formatCurrency(operation, acc.locale, acc.currency);

    const html = `
      <div class="operations__row">
          <div class="operations__type operations__type--${type}">
            ${index + 1} ${type}
          </div>
          <div class="operations__date">${displayDate}</div>
          <div class="operations__value">${formattedOp}</div>
        </div>`;
    containerOperations.insertAdjacentHTML('afterbegin', html);
  });
};

const computeUsername = accs => {
  accs.forEach(singleAcc => {
    singleAcc.username = singleAcc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

const calcBalance = acc => {
  return acc.operations.reduce(
    (currentElement, currentIndex) => currentElement + currentIndex,
    0
  );
};

const displayBalance = (acc, fn) => {
  acc.balance = fn(acc);
  const formattedOp = formatCurrency(acc.balance, acc.locale, acc.currency);
  headerBalance.textContent = formattedOp;
};
const calcDisplaySummary = acc => {
  const incomes = acc.operations
    .filter(mov => mov > 0)
    .reduce((acc, mov) => Math.trunc(acc + mov, 0));
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);
  const outcomes = movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(-outcomes, acc.locale, acc.currency);
  const interest = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, interes) => acc + interes, 0);
  labelInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};
computeUsername(accounts);

const updateUI = currentAccount => {
  // Display Movements
  displayOperations(currentAccount);

  // Display balance
  displayBalance(currentAccount, calcBalance);

  // Display Summary
  calcDisplaySummary(currentAccount);
};

const clockOptions = {
  minute: 'numeric',
  second: 'numeric',
};

const startLogOutTimer = () => {
  // Set timer for 5 mins
  let time = 600;
  //Call the timer every second
  timer = setInterval(() => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // const now = new Intl.DateTimeFormat(
    //   currentAccount.locale,
    //   clockOptions
    // ).format(new Date());
    sessionLabel.textContent = `Session end: ${min}:${sec}`;
    time--;
    if (time === 0) {
      clearInterval(timer);
      logOut();
    }
  }, 1000);

  // In each call, print the raminng time to UI
  // When 0 seconds, stop timer nad log out user
};

const displayAll = currentAccount => {
  // Display UI and Welcome Message
  labelWelcome.textContent = `Welcome back, ${
    currentAccount.owner.split(' ')[0]
  }`;
  container.style.opacity = 100;

  // Clear Input Fields
  inputLogin.remove();
  inputPin.remove();
  btnLogin.remove();

  updateUI(currentAccount);
};
let currentAccount, timer;

// Check if user is logged in
const localStorageData = JSON.parse(localStorage.getItem('currentUser'));
if (accounts.find(acc => acc.username === localStorageData?.username)) {
  currentAccount = localStorageData;
  btnLogOut.style.opacity = 100;
  displayAll(currentAccount);
} else {
  console.log('BOOM 🎈 NO LOCAL STORAGE AT ALL');
}

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  btnLogOut.style.opacity = 100;
  container.style.opacity = 100;

  currentAccount = accounts.find(acc => acc.username === inputLogin.value);
  if (currentAccount?.pin === Number(inputPin.value)) {
    // Set Local Storage
    localStorage.setItem('currentUser', JSON.stringify(currentAccount));
  }
  displayAll(currentAccount);

  const now = new Date();
  const opt = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long', // numeric or 2-digit
    year: 'numeric', // 2-digit
    weekday: 'long',
  };

  startLogOutTimer();
  const locale = navigator.language; // Pobiera język z przeglądarki
  labelDate.textContent = new Intl.DateTimeFormat(locale, opt).format(now);
});

const logOut = () => {
  localStorage.clear();
  window.location.reload();
};

btnLogOut.addEventListener('click', () => {
  logOut();
});

const deposits = movements.filter(mov => mov > 0);
const withdrawals = movements.filter(mov => mov < 0);

const currentBalance = movements.reduce(
  (currentElement, currentIndex, i, array) => {
    // console.log(`Iteration ${i}: ${currentElement}`);
    return currentElement + currentIndex; // FIRST ELEMENT IS ACCUMULATOR
  },
  0 // PUNKT STARTOWY
);
// console.log(currentBalance);

const computeMaximumValue = movs => {
  return movs.reduce((prevValue, currentValue) => {
    if (prevValue > currentValue) return prevValue;
    else return currentValue;
  }, movs[0]);
};
// console.log(computeMaximumValue(movements));

const calcAverageHumanAge = arrayOfDogAges => {
  const humanAges = arrayOfDogAges.map(dogAge => {
    return dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4;
  });
  const adults = humanAges.filter(age => age >= 18);
  console.log(humanAges);
  console.log(adults);
  const average = adults.reduce((acc, age, i) => acc + age, 0) / adults.length;
  return average;
};

const totalDepistsUSD = movements
  .filter(mov => mov > 0)
  .map(mov => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  clearInterval(timer);

  timer = startLogOutTimer();
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  const amount = Number(inputTransferAmount.value);

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.operations.push(-amount);
    receiverAcc.operations.push(amount);

    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    inputTransferAmount.value = inputTransferTo.value = '';
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  clearInterval(timer);
  timer = startLogOutTimer();
  const amount = Math.floor(inputLoan.value);

  if (amount > 0 && currentAccount.operations.some(mov => mov >= amount / 10)) {
    setTimeout(() => {
      currentAccount.operations.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2500);
  }

  inputLoan.value = '';
});

// CLOSE ACC

btnCloseAcc.addEventListener('click', e => {
  e.preventDefault();

  if (
    currentAccount.username === inputUserCloseAcc.value &&
    currentAccount.pin === Number(inputPinCloseAcc.value)
  ) {
    console.log('Delete');
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    inputUserCloseAcc.value = inputPinCloseAcc.value = '';
    accounts.splice(index, 1);
    logOut();
    container.style.opacity = 0;
  }
});

let sorted = false;
sortBtn.addEventListener('click', e => {
  e.preventDefault();
  displayOperations(currentAccount, !sorted);
  sorted = !sorted;
});
// Łączenie łańcuchów
const overalBalanceChained = accounts
  .map(acc => acc.operations)
  .flat()
  .reduce((acc, op) => acc + op, 0);

// FlatMap
const overalBalanceWithFlatMap = accounts
  .flatMap(acc => acc.operations)
  .reduce((acc, op) => acc + op, 0);

// Sorting

// Nowa tablica z imionami użytkowników
const owners = accounts.map(acc => acc.owner.split(' ')[0]);
owners.push('Alex');
owners.push('Bartek');
// Sortowanie aflabetyczne
owners.sort();

// Rosnąco return > 0
movements.sort((a, b) => a - b);

// Malejąco
movements.sort((a, b) => b - a);

const movementsUI = Array.from(document.querySelectorAll('.operations__value'));

const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;

console.log(randomInt(0, 1));

const isEven = numb => (numb % 2 == 0 ? 'even' : 'odd');
console.log(isEven(2));

headerBalance.addEventListener('click', () => {
  [...document.querySelectorAll('.operations__row')].forEach((val, i) => {
    if (i % 2 === 0) val.style.backgroundColor = '#E5E5E5';
  });
});
