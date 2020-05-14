import { getToken } from "../index";
import { throwError } from "../components/helpers";
import { actionsOrders as actions } from "./actions";
import initialState from "./initialState";


const headers = { 'Authorization': 'Bearer ' + getToken() };

export const actionCreators = {
    requestOrders: () => async (dispatch, getState) => {
        const state = getState().orders;
        let { skip, take, searchValue, orderBy, orderByDesc, status } = state.pageFilter;
        const searchParams = searchValue ? `Search=${encodeURIComponent(searchValue)}` : '';
        status = status ? `Status=${status}` : '';
        
        const filterPath = `OrderByDesc=${orderByDesc}&OrderBy=${orderBy}${searchParams && '&' + searchParams}${status && '&' + status}`;
        const urlCount = `api/Orders/Count?${filterPath}`;
        const responseCount = await fetch(urlCount, {
            method: "GET",
            headers
        });
        const ordersCount = await responseCount.json();
        const url = `api/Orders?Skip=${skip}&Take=${take}&${filterPath}`;
        const response = await fetch(url, {
            method: "GET",
            headers
        });
        if (!response.ok) {
            const result = await response.json();
            throwError(result);
        }
        const list = await response.json();
        dispatch({ type: actions.RECEIVE_ORDERS_DATA, list: list, count: ordersCount });
    },
    requestOrderDetails: orderId => async (dispatch) => {
        const url = `api/Orders/${orderId}`;
        const response = await fetch(url, {
            method: "GET",
            headers
        });
        if (!response.ok) {
            const result = await response.json();
            throwError(result);
        }
        const orderDetails = await response.json();
        dispatch({ type: actions.RECEIVE_ORDERS_DETAILS, details: orderDetails });
    },
    updateOrderDetails: (orderId, orderDetails) => async (dispatch) => {
        headers['Content-Type'] = "application/json";
        const url = `api/Orders/${orderId}`;
        const response = await fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(orderDetails)
        });
        if (!response.ok) {
            const result = await response.json();
            throwError(result);
        }
        const updatedOrderDetails = await response.json();
        dispatch({ type: actions.RECEIVE_ORDERS_DETAILS, details: updatedOrderDetails });
    },
    createInvoice: (orderId) => async () => {
        headers['Content-Type'] = "application/json";
        const url = `api/Invoices`;
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ orderId })
        });
        if (!response.ok) {
            const result = await response.json();
            throwError(result);
        }
        const updatedInvoiceDetails = await response.json();
        return updatedInvoiceDetails;
    },
    updatePageFilter: (filter) => async (dispatch, getState) => {
        let state = getState();
        let newFilter = state.orders.pageFilter;
        for (let key in filter) {
            newFilter[key] = filter[key];
        }
        dispatch({ type: actions.UPDATE_ORDERS_FILTER_ACTION, pageFilter: newFilter });
    },
    replaceOrderList: (list) => async (dispatch) => {
        dispatch({ type: actions.SET_ORDERS_LIST, list: list })
    },
    clearFilter: () => async (dispatch) => {
        dispatch({ type: actions.CLEAR_ORDERS_FILTER_ACTION });
    },
    setOrderStatus: (orderId, newStatus) => async (dispatch) => {
        headers['Content-Type'] = "application/json";
        const url = `api/Orders/${orderId}/status/${newStatus}`;
        const response = await fetch(url, {
            method: "PUT",
            headers,
            body: null
        });
        if (!response.ok) {
            const result = await response.json();
            throwError(result);
        }
        const updatedOrderDetails = await response.json();
        dispatch({ type: actions.RECEIVE_ORDERS_DETAILS, orderDetails: updatedOrderDetails });
    }
};

export const reducer = (state, action) => {
    state = state || initialState.orders;
    switch (action.type) {
        case actions.RECEIVE_ORDERS_DATA:
            return {
                ...state,
                list: action.list,
                count: action.count.count,
                isLoading: false
            };
        case actions.RECEIVE_ORDERS_DETAILS:
            return {
                ...state,
                details: action.details
            };
        case actions.SET_ORDERS_LIST:
            return {
                ...state,
                list: action.list
            };
        case actions.CLEAR_ORDERS_FILTER_ACTION:
            return {
                ...state,
                pageFilter: Object.assign(initialState.orders.pageFilter)
            };
        case actions.UPDATE_ORDERS_FILTER_ACTION:
            return {
                ...state,
                pageFilter: action.pageFilter
            };
        default:
            return state;
    }
};