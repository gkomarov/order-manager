import { getUniqKey } from "../components/helpers";

const pageFilter = {
    activePage: 0,
    skip: 0,
    take: 10,
    orderByDesc: true,
    searchValue: '',
    status: '',
    pagingKey: getUniqKey(),
    location: window.location.pathname
}

const pageState = {
    count: null,
    list: [],
    details: {},
    isLoading: false,
}

const initialState = {
    customers: Object.assign({
        errors: '',
        pageFilter: Object.assign({ orderBy: "FirstName" }, pageFilter)
    }, pageState),
    invoices: Object.assign({
        pageFilter: Object.assign({ orderBy: "InvoiceDate" }, pageFilter)
    }, pageState),
    jobs: Object.assign({
        pageFilter: Object.assign({ orderBy: "CreTime" }, pageFilter)
    }, pageState),
    orders: Object.assign({
        pageFilter: Object.assign({ orderBy: "createdAt" }, pageFilter)
    }, pageState),
};

export default initialState;