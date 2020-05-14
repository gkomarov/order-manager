import { getToken } from "../index";
import { throwError, getUniqKey } from "../components/helpers";
import { actionsInvoices as actions } from "./actions";
import initialState from "./initialState";

const headers = { 'Authorization': 'Bearer ' + getToken() };

export const actionCreators = {
  requestInvoices:() => async (dispatch, getState) => {
    const state = getState().invoices;
    let { skip, take, searchValue, orderBy, orderByDesc, status } = state.pageFilter;
    const searchParams = searchValue ? `Search=${encodeURIComponent(searchValue)}` : '';
    
    const urlCount = `api/Invoices/Count${searchParams && '?' + searchParams}`;
    const responseCount = await fetch(urlCount, {
      method: "GET",
      headers
    });
    const invoicesCount = await responseCount.json();
    const url = `api/Invoices?Skip=${skip}&Take=${take}&OrderByDesc=${orderByDesc}&OrderBy=${orderBy}${searchParams && '&' + searchParams}`;
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const list = await response.json();
    dispatch({ type: actions.RECEIVE_INVOICES_DATA, list: list, count: invoicesCount });
  },
  requestInvoiceDetails: invoiceId => async (dispatch) => {
    const url = `api/Invoices/${invoiceId}`;
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const invoiceDetails = await response.json();
    dispatch({ type: actions.RECEIVE_INVOICES_DETAILS, details: invoiceDetails });
  },
  updateInvoiceDetails: (invoiceId, invoiceDetails) => async(dispatch) => {
    headers['Content-Type'] = "application/json";
    const url = `api/Invoices/${invoiceId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(invoiceDetails)
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const updatedInvoiceDetails = await response.json();
    dispatch({ type: actions.RECEIVE_INVOICES_DETAILS, details: updatedInvoiceDetails });
  },
  updatePageFilter: (filter) => async (dispatch, getState) => {
    let state = getState();
    let newFilter = state.invoices.pageFilter;
    for (let key in filter) {
        newFilter[key] = filter[key];
    }
    dispatch({ type: actions.UPDATE_INVOICES_FILTER_ACTION, pageFilter: newFilter });
  },
  updateCredit: (invoiceId) => async(dispatch) => {
    headers['Content-Type'] = "application/json";
    const url = `api/Invoices/${invoiceId}/credit`;
    const response = await fetch(url, {
      method: "PUT",
      headers
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const updatedInvoiceDetails = await response.json();
    dispatch({ type: actions.RECEIVE_INVOICE_CREDIT, details: updatedInvoiceDetails });
  },
  replaceInvoiceList: (list) => async (dispatch) => {
    dispatch({ type: actions.SET_INVOICES_LIST, list: list })
  },
  clearFilter: () => async (dispatch) => {
    dispatch({ type: actions.CLEAR_INVOICES_FILTER_ACTION });
  },
};

export const reducer = (state, action) => {
  state = state || initialState.invoices;
  switch (action.type) {
    case actions.RECEIVE_INVOICE_CREDIT:
      return {
        ...state,
        details: action.details,
        isLoading: true,
      };
    case actions.RECEIVE_INVOICES_DATA:
      return {
          ...state,
          list: action.list,
          count: action.count.count,
          isLoading: false
      };
    case actions.RECEIVE_INVOICES_DETAILS:
        return {
            ...state,
            details: action.details
        };
    case actions.SET_INVOICES_LIST:
        return {
            ...state,
            list: action.list
        };
    case actions.CLEAR_INVOICES_FILTER_ACTION:
        return {
            ...state,
            pageFilter: Object.assign(initialState.invoices.pageFilter)
        };
    case actions.UPDATE_INVOICES_FILTER_ACTION:
        return {
            ...state,
            pageFilter: action.pageFilter
        };
    default:
      return state;
  }
};