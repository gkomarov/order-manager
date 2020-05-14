import { STATUSES } from './constants/statuses';
import { PAYMENT_TYPES } from './constants/types';
import* as CreditIcons from './constants/icons';
import React from 'react';

export const getDecimalString = (number, floor) => {
    let numberToFormat = number >= 0 || number <= 0 ? number : 0;
    numberToFormat = floor ? (Math.floor(numberToFormat * 100) / 100).toString() : numberToFormat.toFixed(2);
    const decimalStringParts = numberToFormat.split(".");
    decimalStringParts[0] = decimalStringParts[0].replace(/(\d\d\d)+$/, value => {
        return value.replace(/\d\d\d/g, (digits, position) => {
            return (decimalStringParts[0].length % 3 !== 0 || position !== 0 ? "," : "") + digits;
        });
    });
    return decimalStringParts.join(".").replace("-,", "-");
}

export const getCurrency = (number, minusBeforeSar, withoutCurrencyText, floor) => {
    const negativeValue = number < 0;
    if (!minusBeforeSar && !negativeValue) return ((withoutCurrencyText ? '' : '\u20A4 ') + getDecimalString(number, floor));
    return "- \u20A4 " + getDecimalString(number * -1, floor);
}

export const RenderStatus = (status) => {
    const displayStatus = STATUSES[status] && STATUSES[status].title;
    switch (status){
        case STATUSES.Removed.value:
        case STATUSES.Cancelled.value:
            return (<div className="badge badge-pill badge-danger">{displayStatus}</div>)
        case STATUSES.NotStarted.value:    
        case STATUSES.Placed.value:
            return (<div className="badge badge-pill badge-secondary">{displayStatus}</div>)
        case STATUSES.Completed.value:
        case STATUSES.Fulfilled.value:
            return (<div className="badge badge-pill badge-success">{displayStatus}</div>)
        default:
            return (<div className="badge badge-pill badge-default">{displayStatus}</div>)
    }
}

export const renderBankIcon = (paymentType, isPaid) => {

    const renderPaymentIcon = (paymentType) => {
        switch (paymentType){
          case PAYMENT_TYPES.BankTransfer.value:
            return { "paid": CreditIcons.bankGreen, "notPaid": CreditIcons.bankDefault }
            case PAYMENT_TYPES.CreditCard.value:
            return { "paid": CreditIcons.creditGreen, "notPaid": CreditIcons.creditDefault }
          default:
            return {}
        }
      }

    const creditIconsObject = renderPaymentIcon(paymentType);
    const creditIcon = isPaid ? creditIconsObject.paid : creditIconsObject.notPaid;
    return creditIcon;
}

const packErrorsInBlock = (errors) => {
    let pack = [];
    for (let key in errors) {
        const errorMessages = errors[key].map(errorMessage => { return `<div>${errorMessage}</div>`});
        pack.push(`<div><div>${key}:</div>${errorMessages}</div>`)
    }
    return pack.join();
}

export const throwError = (response) => {
    // 409 status type
    if (typeof(response) === 'string') {
        throw new Error(response);
    }
    // 400 status type
    if (response.title) {
        let body = '';
        if (response.errors) {
            body = packErrorsInBlock(response.errors);
        }
        const result = `<div><h5>${response.title}</h5>${body}</div>`;
        throw new Error(result)
    }
}

export const getUniqKey = () => {
    return new Date().getTime();
}