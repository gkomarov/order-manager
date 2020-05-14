import { getToken } from "../index";
import { throwError } from "../components/helpers";
import { actionsCustomers as actions } from "./actions";
import initialState from "./initialState";

const headers = { 'Authorization': 'Bearer ' + getToken() };

export const actionCreators = {
  requestCustomers:() => async (dispatch, getState) => {
    const state = getState().customers;
    let { skip, take, searchValue, orderBy, orderByDesc } = state.pageFilter;
    const searchParams = searchValue ? `Search=${encodeURIComponent(searchValue)}` : '';
    
    const urlCount = `api/Customers/Count${searchParams && '?' + searchParams}`;
    const responseCount = await fetch(urlCount, {
      method: "GET",
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    const customersCount = await responseCount.json();
    const url = `api/Customers?Skip=${skip}&Take=${take}&OrderByDesc=${orderByDesc}&OrderBy=${orderBy}${searchParams && '&' + searchParams}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const list = await response.json();
    dispatch({ type: actions.RECEIVE_CUSTOMERS_DATA, list: list, count: customersCount });
  },
  clearErrors: () => async(dispatch) => {
    dispatch({ type: actions.SET_CUSTOMERS_UPDATE_ERRORS, errors: "" });
  },
  requestCustomerDetails: customerId => async (dispatch) => {
    const url = `api/Customers/${customerId}`;
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const customerDetails = await response.json();
    dispatch({ type: actions.RECEIVE_CUSTOMERS_DETAILS, details: customerDetails });
  },
  updateCustomerDetails: (customerId, paymentTerms) => async(dispatch) => {
    const url = `api/Customers/${customerId}`;
    headers['Content-Type'] = "application/json";
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({paymentTerms: paymentTerms})
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const updatedCustomerDetails = await response.json();
    dispatch({ type: actions.RECEIVE_CUSTOMERS_DETAILS, details: updatedCustomerDetails });
  },
  updatePageFilter: (filter) => async (dispatch, getState) => {
    let state = getState();
    let newFilter = state.customers.pageFilter;
    for (let key in filter) {
        newFilter[key] = filter[key];
    }
    dispatch({ type: actions.UPDATE_CUSTOMERS_FILTER_ACTION, pageFilter: newFilter });
  },
  replaceCustomersList: (list) => async (dispatch) => {
    dispatch({ type: actions.SET_CUSTOMERS_LIST, list: list })
  },
  clearFilter: () => async (dispatch) => {
    dispatch({ type: actions.CLEAR_CUSTOMERS_FILTER_ACTION });
  }
};

export const reducer = (state, action) => {
  state = state || initialState.customers;
  switch (action.type) {
    case actions.RECEIVE_CUSTOMERS_DATA:
        return {
            ...state,
            list: action.list,
            count: action.count.count,
            isLoading: false
        };
    case actions.RECEIVE_CUSTOMERS_DETAILS:
        return {
            ...state,
            details: action.details
        };
    case actions.SET_CUSTOMERS_LIST:
        return {
            ...state,
            list: action.list
        };
    case actions.CLEAR_CUSTOMERS_FILTER_ACTION:
        return {
            ...state,
            pageFilter: Object.assign(initialState.customers.pageFilter)
        };
    case actions.UPDATE_CUSTOMERS_FILTER_ACTION:
        return {
            ...state,
            pageFilter: action.pageFilter
        };
    case actions.SET_UPDATE_ERRORS:
      return {
        ...state,
        errors: action.errors,
        isLoading: true,
      };
    default:
      return state;
  }
};