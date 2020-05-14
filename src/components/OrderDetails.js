import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Orders';
import { Button, Input, InputGroup, InputGroupAddon, Card, CardBody, CardHeader, CardFooter } from 'reactstrap';
import * as Formats from './constants/formats';
import moment from 'moment';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import enGB from "date-fns/locale/en-GB";

import { getCurrency, RenderStatus, renderBankIcon } from './helpers';

import { FlexBlock, FlexColumn } from './FlexBlock';
import { STATUSES } from './constants/statuses';
import ModalConfirm from './ModalConfirm';
registerLocale("en-GB", enGB);

class OrderDetails extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            modalFormParams: {
                title: "",
                modalBody: "",
                action: null
            },
            orderDetails: {
                status: '',
                expectedCompletion: '',
                purchaseOrder: '',
                useRoyalMail: false,
                errors: '',
                shippingAddress: {
                    address1: '',
                    address2: '',
                    city: '',
                    company: '',
                    country: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    postCode: '',
                    state: '',
                },
                billingAddress: {
                    address1: '',
                    address2: '',
                    city: '',
                    company: '',
                    country: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    postCode: '',
                    state: '',
                },
                lines: [
                    {
                        sku: '',
                        name: '',
                        quantity: 0,
                        originalPrice: 0,
                        price: 0,
                        amount: 0
                    }
                ],
                invoices: [],
                jobs: [],
                customer: {
                    fullName: '',
                    company: '',
                    email: '',
                }
            },
            paymentTerms: 0,
            orderId: null
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.addInvoice = this.addInvoice.bind(this);
        this.activateAddInvoice = this.activateAddInvoice.bind(this);
        this.setErrorsToState = this.setErrorsToState.bind(this);
        this.activateMarkAsPlaced = this.activateMarkAsPlaced.bind(this);
        this.activateMarkAsFulfilled = this.activateMarkAsFulfilled.bind(this);
    }

    componentDidMount() {
        this.setState({ orderId: this.props.match.params.orderId }, () => {
            this.props.requestOrderDetails(this.state.orderId)
                .then(() => {
                    this.setState({ orderDetails: this.props.details });
                })
                .catch(errorResponse => {
                    this.setErrorsToState(errorResponse);
                });
        });
    }

    setErrorsToState(errors) {
        this.setState({ errors });
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({
            orderDetails: {
                ...this.state.orderDetails,
                [name]: value
            }
        });
    }

    handleChangeDate(date) {
        const newDate = date && moment(date).format(Formats.DATE_FORMAT_ISO);
        this.setState({
            orderDetails: {
                ...this.state.orderDetails,
                expectedCompletion: newDate
            }
        });
    }

    handleSave() {
        const { purchaseOrder, expectedCompletion, useRoyalMail } = this.state.orderDetails;
        const { updateOrderDetails } = this.props;
        updateOrderDetails(this.state.orderId, { purchaseOrder, expectedCompletion, useRoyalMail })
            .catch(errorResponse => {
                this.setErrorsToState(errorResponse);
            });
    }

    handleBack() {
        //this.props.history.push(`/orders`);
        this.props.history.goBack();
    }

    addInvoice() {
        const { createInvoice } = this.props;
        const resultOf = createInvoice(this.state.orderId);
        resultOf.then((newInvoice) => {
            this.toggleModal();
            this.redirectToInvoice(newInvoice.id);
        });
    }

    activateAddInvoice() {
        this.setState({
            modalFormParams: {
                modalBody: "Are you sure you want to add invoice for this order?",
                title: "Invoice create",
                action: this.addInvoice
            }
        }, () => { this.toggleModal() })
    }

    activateMarkAsPlaced() {
        this.setState({
            modalFormParams: {
                modalBody: "Are you sure you want to mark this order as Placed?",
                title: "Mark as Placed",
                action: this.changeOrderStatus.bind(this, 'placed')
            }
        }, () => { this.toggleModal() })
    }

    activateMarkAsFulfilled() {
        this.setState({
            modalFormParams: {
                modalBody: "Are you sure you want to mark this order as Fulfilled?",
                title: "Mark as Fulfilled",
                action: this.changeOrderStatus.bind(this, 'fulfilled')
            }
        }, () => { this.toggleModal() })
    }
    
    changeOrderStatus(status) {
        const { setOrderStatus, replaceOrderList } = this.props;
        setOrderStatus(this.state.orderId, status).then(() => {
            // const { orderDetails } = this.props;
            // this.setState({ orderDetails: orderDetails }, () => {
            //     // if (list.length) {
            //     //     const newList = list.map(item => {
            //     //         if (item.id === orderDetails.id) {
            //     //             return orderDetails
            //     //         }
            //     //         return item;
            //     //     })
            //     //     replaceOrderList(newList);
            //     // }
            // });
            this.toggleModal();
        });
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    redirectToJob(jobId, e) {
        e.preventDefault();
        this.props.history.push(`/jobs/${jobId}`);
    }

    redirectToInvoice(invoiceId) {
        this.props.history.push(`/invoices/${invoiceId}`);
    }

    renderDetailsTable(lines) {
        return (
            <table className="table table-hover table-sm table-striped">
                <thead>
                    <tr>
                        <th className="text-center">Quantity</th>
                        <th>Item</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map((line, index) => {
                        const originalPrice = line.originalPrice !== line.price && getCurrency(line.originalPrice);
                        return <tr key={index}>
                            <td className="text-center">{line.quantity}</td>
                            <td>{line.name}<span className="labled ml-2">{line.sku}</span></td>
                            <td className="text-right text-nowrap"><span className="mr-2" style={{ textDecoration: "line-through" }}>{originalPrice}</span>{getCurrency(line.price)}</td>
                            <td className="text-right text-nowrap">{getCurrency(line.amount)}</td>
                        </tr>
                    }
                    )}
                </tbody>
            </table>
        )
    }

    renderJobs(jobs) {
        return (
            <FlexColumn>
                <label className="labled mt-2">Related jobs</label>
                <div>
                    {jobs.map(job =>
                        // <div className="d-flex align-items-center justify-content-start" key={job.jobNo}>
                        //     {job.jobNo && <a href={null} className="text-primary pointer mr-4" onClick={this.redirectToJob.bind(this, job.id)}>{job.jobNo}</a>}
                        //     <span className="mr-4">{RenderStatus(job.status)}</span>
                        //     <span>{job.status !== STATUSES.NotStarted.value && moment(job.statusDate).format(Formats.DATE_FORMAT_EU_WITH_TIME)}</span>
                        // </div>
                        <div className="row" key={job.jobNo}>
                            <div className="col-2">
                                {job.jobNo && <a href={null} className="text-primary pointer mr-4" onClick={this.redirectToJob.bind(this, job.id)}>{job.jobNo}</a>}
                            </div>
                            <div className="col-2">
                                <span className="mr-4">{RenderStatus(job.status)}</span>
                            </div>
                            <div className="col-6">
                                <span>{job.status !== STATUSES.NotStarted.value && moment(job.statusDate).format(Formats.DATE_FORMAT_EU_WITH_TIME)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </FlexColumn>
        )
    }

    renderInvoices(invoices) {
        return (
            <FlexColumn>
                <label className="labled mt-2">Related invoices</label>
                <div>
                    {invoices.map(invoice =>
                        <div key={invoice.invoiceNo}>
                            <FlexBlock>
                                <span><a href={null} className="text-primary pointer mr-2" onClick={(e) => { e.preventDefault(); this.redirectToInvoice(invoice.id) }}>{invoice.invoiceNo}</a></span>
                                {invoice.isCredited && <div className="badge badge-pill badge-danger">Credit</div>}
                            </FlexBlock>
                        </div>
                    )}
                </div>
            </FlexColumn>
        )
    }

    renderAddresses(details) {
        return (
            <div className="d-flex justify-content-between mt-4">
                {details.shippingAddress && 
                    <div className="col-6 pl-0">
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
                    </div>
                }
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

        const { orderDetails, modalFormParams, errors } = this.state;
        const { expectedCompletion } = this.state.orderDetails;
        const selectedDate = expectedCompletion ? new Date(expectedCompletion) : null;
        const disableInputs = !orderDetails.isNewInvoiceAllowed && orderDetails.status !== STATUSES.Placed.value;
        const isMarkAsPlacedEnabled = orderDetails.status === STATUSES.Fulfilled.value || orderDetails.status === STATUSES.Cancelled.value;
        const isMarkAsFulfilledEnabled = orderDetails.status === STATUSES.Placed.value && !orderDetails.hasUncompletedJobs;

        if (errors) {
            throw new Error(errors);
        }

        const calendarIcon = <img width={20} alt="desc" src="calendar.svg" />;

        return (
            <div>
                <ModalConfirm
                    modal={this.state.modal}
                    toggle={this.toggleModal}
                    action={modalFormParams.action}
                    body={modalFormParams.modalBody}
                    header={modalFormParams.title}
                />
                <div className="row p-3">
                    <div className="col-9 d-flex justify-content-start align-items-center">
                        <h4 className="mb-0 mr-2">Order Details</h4>
                    </div>
                    <div className="col-3 d-flex justify-content-end align-items-center">
                        <Button color="secondary" className="ml-2" onClick={this.handleBack.bind(this)}>Back</Button>
                        {isMarkAsPlacedEnabled && <Button color="warning" className="ml-2 text-nowrap" onClick={this.activateMarkAsPlaced}>Mark as Placed</Button>}
                        {isMarkAsFulfilledEnabled && <Button color="warning" className="ml-2 text-nowrap" onClick={this.activateMarkAsFulfilled}>Mark as Fulfilled</Button>}
                        {orderDetails.isNewInvoiceAllowed && <Button color="primary" className="ml-2 text-nowrap" onClick={this.activateAddInvoice}>Add invoice</Button>}
                    </div>
                </div>

                <div className="row p-3">
                    <div className="col-12 d-flex justify-content-start align-items-center">
                        <h5 className="mb-0">{orderDetails.orderNo}</h5>
                        <div className="ml-2">{RenderStatus(orderDetails.status)}</div>
                        <div className="ml-2">{orderDetails.customer.fullName}</div>
                        <div className="ml-2">@ {orderDetails.customer.company}</div>
                        {orderDetails.customer.email && <div className="ml-2">({orderDetails.customer.email})</div>}
                    </div>
                </div>

                <div className="row p-3">
                    <div className="col-8">
                        {orderDetails.lines.length > 0 && (
                            <FlexColumn>
                                <label className="labled">Order details</label>
                                {this.renderDetailsTable(orderDetails.lines)}
                            </FlexColumn>
                        )}

                        <FlexColumn className="mt-2">
                            <label className="labled">Created</label>
                            <div>{orderDetails.creTime && moment(orderDetails.creTime).format(Formats.DATE_FORMAT_EU_WITH_TIME)}</div>
                        </FlexColumn>

                        <FlexColumn className="mt-2 col-5 pl-0">
                            <label className="labled mt-2">Expected completion date</label>
                            <InputGroup>
                                <ReactDatePicker
                                    className="form-control border-right-none"
                                    disabled={disableInputs}
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

                        <div className="mt-2 col-8 pl-0">
                            {this.renderJobs(orderDetails.jobs)}
                        </div>

                        <div className="mt-2 col-7 pl-0">
                            {this.renderAddresses(orderDetails)}
                        </div>

                        <FlexBlock className="mt-2 custom-control custom-checkbox">
                            <Input
                                name="useRoyalMail"
                                type="checkbox"
                                disabled={disableInputs}
                                className="custom-control-input"
                                id="royalMail"
                                checked={orderDetails.useRoyalMail}
                                onChange={this.handleChange} onBlur={this.handleSave}
                            />
                            <label className="labled mb-0 custom-control-label" htmlFor="royalMail">Post out with Royal Mail</label>
                        </FlexBlock>

                        <FlexColumn className="mt-2 col-5 pl-0">
                            <label className="labled mt-2">Notes</label>
                            <div>{orderDetails.note}</div>
                        </FlexColumn>

                    </div>

                    {/* Right side */}
                    <div className="col-4">
                        <div>
                            <Card>
                                <CardHeader>Totals</CardHeader>
                                <CardBody>
                                    <FlexBlock><span>Discount</span>{getCurrency(orderDetails.discountTotal)}</FlexBlock>
                                    <FlexBlock><span>Subtotal</span>{getCurrency(orderDetails.subTotal)}</FlexBlock>
                                    <FlexBlock><span>Shipping</span>{getCurrency(orderDetails.shippingTotal)}</FlexBlock>
                                    <FlexBlock ><span>VAT {orderDetails.taxRate > 0 && `@ ${orderDetails.taxRate * 100}%`}</span>{getCurrency(orderDetails.taxTotal)}</FlexBlock>
                                    <h4>
                                        <FlexBlock>
                                            Total
                          <span className="d-flex align-items-center">
                                                {renderBankIcon(orderDetails.paymentType, orderDetails.isPaid)}
                                                <span className="ml-2">{getCurrency(orderDetails.total)}</span>
                                            </span>
                                        </FlexBlock>
                                    </h4>
                                </CardBody>
                                <CardFooter>
                                    <FlexBlock><span>Paid by customer</span>{getCurrency(orderDetails.paidAmount)}</FlexBlock>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="mt-2">
                            <FlexColumn>
                                <label className="labled">Purchase order</label>
                                <Input disabled={disableInputs} name="purchaseOrder" value={orderDetails.purchaseOrder} onChange={this.handleChange} onBlur={this.handleSave} />
                            </FlexColumn>
                        </div>

                        <div className="mt-2">
                            {this.renderInvoices(orderDetails.invoices)}
                        </div>
                    </div>

                </div>

                <div className="col-4"></div>
                <div className="col-4"></div>

            </div>
        );
    }
}

export default connect(
    state => state.orders,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(OrderDetails);