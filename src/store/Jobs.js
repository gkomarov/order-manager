import { getToken } from "../index";
import { throwError, getUniqKey } from "../components/helpers";
import { actionsJobs as actions } from "./actions";
import initialState from "./initialState";

const headers = { 'Authorization': 'Bearer ' + getToken() };

export const actionCreators = {
  requestJobs: () => async (dispatch, getState) => {
    const state = getState().jobs;
    let { skip, take, searchValue, orderBy, orderByDesc, status } = state.pageFilter;
    const searchParams = searchValue ? `Search=${encodeURIComponent(searchValue)}` : '';
    status = status ? `Status=${status}` : '';

    const filterPath = `OrderByDesc=${orderByDesc}&OrderBy=${orderBy}${searchParams && '&' + searchParams}${status && '&' + status}`;
    const urlCount = `api/Jobs/Count?${filterPath}`;
    const responseCount = await fetch(urlCount, {
      method: "GET",
      headers
    });
    const jobsCount = await responseCount.json();
    const url = `api/Jobs?Skip=${skip}&Take=${take}&${filterPath}`;
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const list = await response.json();
    dispatch({ type: actions.RECEIVE_JOBS_DATA, list: list, count: jobsCount });
  },
  requestJobDetails: jobId => async (dispatch) => {
    const url = `api/Jobs/${jobId}`;
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const jobDetails = await response.json();
    dispatch({ type: actions.RECEIVE_JOBS_DETAILS, details: jobDetails });
  },
  updateJobDetails: (jobId, jobDetails, updateStatus) => async (dispatch) => {
    headers['Content-Type'] = "application/json";
    const updateStatusMode = updateStatus ? "/status" : "";
    const url = `api/Jobs/${jobId}${updateStatusMode}`;
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(jobDetails)
    });
    if (!response.ok) {
      const result = await response.json();
      throwError(result);
    }
    const updatedJobDetails = await response.json();
    dispatch({ type: actions.RECEIVE_JOBS_DETAILS, details: updatedJobDetails });
  },
  updatePageFilter: (filter) => async (dispatch, getState) => {
    let state = getState();
    let newFilter = state.jobs.pageFilter;
    for (let key in filter) {
      newFilter[key] = filter[key];
    }
    dispatch({ type: actions.UPDATE_JOBS_FILTER_ACTION, pageFilter: newFilter });
  },
  replaceJobList: (list) => async (dispatch) => {
    dispatch({ type: actions.SET_JOBS_LIST, list: list })
  },
  clearFilter: () => async (dispatch) => {
    dispatch({ type: actions.CLEAR_JOBS_FILTER_ACTION });
  },
};

export const reducer = (state, action) => {
  state = state || initialState.jobs;
  switch (action.type) {
    case actions.RECEIVE_JOBS_DATA:
      return {
          ...state,
          list: action.list,
          count: action.count.count,
          isLoading: false
      };
    case actions.RECEIVE_JOBS_DETAILS:
        return {
            ...state,
            details: action.details
        };
    case actions.SET_JOBS_LIST:
        return {
            ...state,
            list: action.list
        };
    case actions.CLEAR_JOBS_FILTER_ACTION:
        return {
            ...state,
            pageFilter: Object.assign(initialState.jobs.pageFilter)
        };
    case actions.UPDATE_JOBS_FILTER_ACTION:
        return {
            ...state,
            pageFilter: action.pageFilter
        };
    default:
      return state;
  }
};