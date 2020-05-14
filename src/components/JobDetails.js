import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Jobs';
import { Button, InputGroup, InputGroupAddon, } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import * as Formats from './constants/formats';
import moment from 'moment';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import enGB from "date-fns/locale/en-GB";
import "react-datepicker/dist/react-datepicker.css";

import { getDecimalString, RenderStatus } from './helpers';
import { STATUSES } from './constants/statuses';

import { FlexColumn } from './FlexBlock';
import ModalConfirm from './ModalConfirm';
registerLocale("en-GB", enGB);

class JobDetails extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            errors: '',
            modalFormParams: {
                title: "",
                modalBody: "",
                replaceStatus: ""
            },
            jobDetails: {
                batches: [],
                courier: null,
                creTime: '',
                created: '',
                dateRequired: '',
                envelope: '',
                expectedDispatch: null,
                jobNo: '',
                note: '',
                orders: [],
                paperType: '',
                postage: '',
                processing: '',
                sku: '',
                stamps: '',
                status: '',
                statusDate: '',
                tchTime: null
            },
            jobId: null
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.printJob = this.printJob.bind(this);
        this.setErrorsToState = this.setErrorsToState.bind(this);
    }

    componentDidMount() {
        this.ensureData();
    }

    setErrorsToState(errors) {
        this.setState({ errors });
    }

    ensureData() {
        this.setState({ jobId: this.props.match.params.jobId }, () => {
            this.props.requestJobDetails(this.state.jobId)
                .then(() => {
                    this.setState({ jobDetails: this.props.details });
                })
                .catch(errorResponse => {
                    this.setErrorsToState(errorResponse);
                });
        });
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({
            jobDetails: {
                ...this.state.jobDetails,
                [name]: value
            }
        });
    }

    handleChangeDate(date) {
        const newDate = date && moment(date).format(Formats.DATE_FORMAT_ISO);
        this.setState({
            jobDetails: {
                ...this.state.jobDetails,
                expectedDispatch: newDate
            }
        });
    }

    handleSave() {
        const { expectedDispatch } = this.state.jobDetails;
        const { updateJobDetails } = this.props;
        updateJobDetails(this.state.jobId, { expectedDispatch })
            .catch(errorResponse => {
                this.setErrorsToState(errorResponse);
            });
    }

    handleBack() {
        //this.props.history.push(`/jobs`);
        this.props.history.goBack();
    }

    redirectToOrder(orderId, e) {
        e.preventDefault();
        this.props.history.push(`/orders/${orderId}`);
    }

    printJob() {
        this.props.history.push(`/jobs/${this.state.jobId}/print`);
    }

    renderDetailsTable(lines) {
        return (
            <table className={'table table-hover table-sm table-striped'}>
                <thead>
                    <tr>
                        <th>Quantity</th>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map(line =>
                        <tr key={line.Sku}>
                            <td>{line.Quantity}</td>
                            <td>{line.Name}</td>
                            <td>{getDecimalString(line.Price)}</td>
                            <td>{line.Amount}</td>
                        </tr>)
                    }
                </tbody>
            </table>
        )
    }

    renderOrders(orders) {
        return (
            <FlexColumn>
                <label className="labled mt-3">Related orders</label>
                <div>
                    {orders.map(order =>
                        <div className="d-flex align-items-center justify-content-start" key={order.orderNo}>
                            {order.orderNo && <a href={null} className="text-primary pointer" onClick={this.redirectToOrder.bind(this, order.id)}>{order.orderNo}</a>}
                            <span className="ml-3">{RenderStatus(order.status)}</span>
                            <span className="ml-3">{order.customer.fullName}</span>
                            <span className="ml-3">{order.customer.company && `@ ${order.customer.company}`}</span>
                            <ReactTooltip place="top" data-for="expectedDispatch" />
                            <span id="expectedDispatch" className="ml-3" data-tip="Expected dispatch date">{order.expectedDispatch && moment(order.expectedDispatch).format(Formats.DATE_FORMAT_EU_WITH_TIME)}</span>
                        </div>
                    )}
                </div>
            </FlexColumn>
        )
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    markJob(status) {
        const { updateJobDetails, replaceJobList } = this.props;
        updateJobDetails(this.state.jobId, { status }, true).then(() => {
            const { details, list } = this.props;
            this.setState({ jobDetails: details }, () => {
                if (list.length) {
                    const newList = list.map(item => {
                        if (item.id === details.id) {
                            return details
                        }
                        return item;
                    })
                    replaceJobList(newList);
                }
                this.toggleModal();
            });
        });
    }

    activateRemoveModal(markAsRemoved) {
        this.setState({
            modalFormParams: {
                replaceStatus: markAsRemoved.replaceStatus,
                modalBody: markAsRemoved.modalBody,
                title: markAsRemoved.title
            }
        }, () => { this.toggleModal() })
    }

    activateForm(markObject) {
        this.setState({
            modalFormParams: {
                replaceStatus: markObject.replaceStatus,
                modalBody: markObject.modalBody,
                title: markObject.title
            }
        }, () => { this.toggleModal() })
    }

    renderAddresses(details) {
        return (
            <div className="d-flex justify-content-between mt-4">
                <div className="col-6 pl-0">
                    {details.billingAddress && (
                        <React.Fragment>
                            <label className="labled">Shipping address</label>
                            <div>{details.shippingAddress.firstName + ' ' + details.shippingAddress.lastName}</div>
                            <div>{details.shippingAddress.company}</div>
                            <div>{details.shippingAddress.address1}</div>
                            <div>{details.shippingAddress.address2}</div>
                            <div>{details.shippingAddress.city}</div>
                            <div>{details.shippingAddress.state}</div>
                            <div>{details.shippingAddress.postCode}</div>
                            <div>{details.shippingAddress.country}</div>
                            <div>{details.shippingAddress.phone}</div>
                        </React.Fragment>
                    )}
                </div>
                <div className="col-6 pl-0">
                    {details.billingAddress && (
                        <React.Fragment>
                            <label className="labled">Billing address</label>
                            <div>{details.billingAddress.firstName + ' ' + details.billingAddress.lastName}</div>
                            <div>{details.billingAddress.company}</div>
                            <div>{details.billingAddress.address1}</div>
                            <div>{details.billingAddress.address2}</div>
                            <div>{details.billingAddress.city}</div>
                            <div>{details.billingAddress.state}</div>
                            <div>{details.billingAddress.postCode}</div>
                            <div>{details.billingAddress.country}</div>
                            <div>{details.billingAddress.phone}</div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        )
    }

    render() {

        const { jobDetails, modalFormParams, errors } = this.state;
        const { expectedDispatch } = this.state.jobDetails;
        const jobInCompletedStatus = jobDetails.status === STATUSES.Completed.value;
        const jobInRemovedStatus = jobDetails.status === STATUSES.Removed.value;

        const markAsCompleted = {
            active: jobDetails.status === STATUSES.NotStarted.value,
            title: "Mark as Completed",
            modalBody: "Are you sure you want to mark the job as Completed?",
            replaceStatus: STATUSES.Completed.value
        }

        const markAsNoStarted = {
            active: jobDetails.status === STATUSES.Completed.value,
            title: "Mark as Not started",
            modalBody: "Are you sure you want to mark the job as Not Started?",
            replaceStatus: STATUSES.NotStarted.value
        }

        const markAsRemoved = {
            active: jobDetails.status === STATUSES.Removed.value,
            title: "Remove job",
            modalBody: "Are you sure you want to remove this job?",
            replaceStatus: STATUSES.Removed.value
        }

        const markObject = jobInCompletedStatus ? markAsNoStarted : markAsCompleted;
        const selectedDate = expectedDispatch ? new Date(expectedDispatch) : null;
        const printImg = <img width={20} alt="desc" src="print-solid.svg" />;
        const calendarIcon = <img width={20} alt="desc" src="calendar.svg" />;


        if (errors) {
            throw new Error(errors);
        }

        return (
            <div>
                <ModalConfirm
                    modal={this.state.modal}
                    toggle={this.toggleModal}
                    action={this.markJob.bind(this, modalFormParams.replaceStatus)}
                    body={modalFormParams.modalBody}
                    header={modalFormParams.title}
                />
                <div className="row p-3">
                    <div className="col-9 d-flex justify-content-start align-items-center">
                        <h4 className="mb-0 mr-2">Job Details</h4>
                    </div>
                    <div className="col-3 d-flex justify-content-end align-items-center">
                        <Button color="secondary" className="ml-2" onClick={this.handleBack.bind(this)}>Back</Button>
                        {markAsCompleted.active && <Button color="danger" className="ml-2" onClick={this.activateRemoveModal.bind(this, markAsRemoved)}>Remove</Button>}
                        {markAsCompleted.active && <Button color="success" className="ml-2 text-nowrap" onClick={this.activateForm.bind(this, markObject)}>{markAsCompleted.title}</Button>}
                        {markAsNoStarted.active && <Button color="primary" className="ml-2 text-nowrap" onClick={this.activateForm.bind(this, markObject)}>{markAsNoStarted.title}</Button>}
                    </div>
                </div>
                <div className="row p-3">
                    <div className="col-12 d-flex justify-content-start align-items-center">
                        <h5 className="mb-0 mr-2">{jobDetails.jobNo}</h5>
                        <div className="pointer" onClick={this.printJob}>{printImg}</div>
                        <div className="ml-2">{RenderStatus(jobDetails.status)}</div>
                        {jobDetails.status !== STATUSES.NotStarted.value && <div className="ml-2">{moment(jobDetails.creTime).format(Formats.DATE_FORMAT_EU_WITH_TIME)}</div>}
                    </div>
                </div>

                <div className="row p-3">
                    <div className="col-8">

                        <FlexColumn className="mt-3">
                            <label className="labled">Job details</label>
                            <div>{jobDetails.note}<span className="labled ml-2">{jobDetails.sku}</span></div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Created</label>
                            <div>{moment(jobDetails.creTime).format(Formats.DATE_FORMAT_EU_WITH_TIME)}</div>
                        </FlexColumn>

                        {/* <FlexColumn className="mt-3">
              <label className="labled">Details required</label>
              <div>{jobDetails.dateRequired}</div>
            </FlexColumn>  */}

                        <FlexColumn className="mt-3 col-5 pl-0">
                            <label className="labled">Expected dispatch</label>
                            <InputGroup>
                                <ReactDatePicker
                                    className="form-control border-right-none"
                                    disabled={jobInCompletedStatus || jobInRemovedStatus}
                                    selected={selectedDate}
                                    locale="en-GB"
                                    onChange={this.handleChangeDate}
                                    onBlur={this.handleSave}
                                    dateFormat={Formats.DATE_FORMAT_EU_SPECIAL}
                                />
                                <InputGroupAddon addonType="append">
                                    <Button color="light" className="border">
                                        {calendarIcon}
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <div>{this.renderOrders(jobDetails.orders)}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Paper type</label>
                            <div>{jobDetails.paperType}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Envelope</label>
                            <div>{jobDetails.envelope}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Processing</label>
                            <div>{jobDetails.processing}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Stamps</label>
                            <div>{jobDetails.stamps}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Postage</label>
                            <div>{jobDetails.postage}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Courier</label>
                            <div>{jobDetails.courier}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            {jobDetails.batches.length > 0 && (
                                <React.Fragment>
                                    <label className="labled">Batch names</label>
                                    <table className="table table-hover table-sm table-striped">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Size</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobDetails.batches.map((batch, index) =>
                                                <tr key={`${index}${batch.name}`}>
                                                    <td>{batch.name}</td>
                                                    <td>{batch.size}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </React.Fragment>
                            )}
                        </FlexColumn>

                    </div>
                </div>

                <div className="col-4"></div>
                <div className="col-4"></div>

            </div>
        );
    }
}

export default connect(
    state => state.jobs,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(JobDetails);