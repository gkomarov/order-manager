import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Invoices';
import { Button, Input, Card, CardBody, CardHeader, CardFooter } from 'reactstrap';
import * as Formats from './constants/formats';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";

import { getCurrency, renderBankIcon } from './helpers';

import { FlexBlock, FlexColumn } from './FlexBlock';
import ModalConfirm from './ModalConfirm';
import { STATUSES } from './constants/statuses';

class InvoiceDetails extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            errors: '',
            invoiceDetails: {
                status: '',
                purchaseOrder: '',
                useRoyalMail: false,
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
            invoiceId: null
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmUpdateCredit = this.confirmUpdateCredit.bind(this);
        this.printInvoice = this.printInvoice.bind(this);
        
    }

    componentDidMount() {
        this.setState({ invoiceId: this.props.match.params.invoiceId }, () => {
            this.props.requestInvoiceDetails(this.state.invoiceId)
                .then(() => {
                    this.setState({ invoiceDetails: this.props.details});
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
            invoiceDetails: {
                ...this.state.invoiceDetails,
                [name]: value
            }
        });
    }


    handleSave() {
        const { purchaseOrder } = this.state.invoiceDetails;
        const { updateInvoiceDetails } = this.props;
        updateInvoiceDetails(this.state.invoiceId, { purchaseOrder })
        .catch(errorResponse => {
            this.setErrorsToState(errorResponse);
        });
    }

    handleBack() {
        //this.props.history.push(`/invoices`);
        this.props.history.goBack();
    }

    redirectToOrder(orderId, e) {
        e.preventDefault();
        this.props.history.push(`/orders/${orderId}`);
    }

    redirectToCredit(e) {
        e.preventDefault();
        this.toggleModal();
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    confirmUpdateCredit() {
        const { updateCredit } = this.props;
        updateCredit(this.state.invoiceId)
            .then(()=>{
                this.setState({ invoiceDetails: this.props.details}, () => {
                    this.toggleModal();
                });
            })
            .catch(errorResponse => {
                this.setErrorsToState(errorResponse);
            });
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
                    {lines.map((line, i) => {
                        const originalPrice = line.originalPrice !== line.price && getCurrency(line.originalPrice);
                        return <tr key={i}>
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

    printInvoice() {
        this.props.history.push(`/invoices/${this.state.invoiceId}/print`);
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

        const { invoiceDetails, errors } = this.state;

        const printImg = <img width={20} alt="desc" src="print-solid.svg" />;
        const isPaid = invoiceDetails.status === STATUSES.Paid.value;
        
        if (errors) {
            throw new Error(errors);
        }

        return (
            <div>
                <ModalConfirm
                    modal={this.state.modal}
                    toggle={this.toggleModal}
                    action={this.confirmUpdateCredit}
                    body={"Are you sure you want to mark this invoice as credited?"}
                    header={"Mark as credited"}
                />
                <div className="row p-3">
                    <div className="col-9 d-flex justify-content-start align-items-center">
                        <h4 className="mb-0 mr-2">Invoice Details</h4>
                    </div>
                    <div className="col-3 d-flex justify-content-end align-items-center">
                        <Button color="secondary" className="ml-2" onClick={this.handleBack.bind(this)}>Back</Button>
                    </div>
                </div>  

                <div className="row p-3">
                    <div className="col-12 d-flex justify-content-start align-items-center">
                        <h5 className="mb-0 mr-2">{invoiceDetails.invoiceNo}</h5>
                        <div className="pointer" onClick={this.printInvoice}>{printImg}</div>
                        <div className="ml-2">{invoiceDetails.fullName}</div>
                        <div className="ml-2">@ {invoiceDetails.company}</div>
                        {invoiceDetails.email && <div className="ml-2">({invoiceDetails.email})</div>}
                    </div>
                </div>  

                <div className="row p-3">
                    <div className="col-8">
                        {invoiceDetails.lines.length > 0 && (
                            <FlexColumn>
                                <label className="labled">Order details</label>
                                {this.renderDetailsTable(invoiceDetails.lines)}
                            </FlexColumn>
                        )}

                        <FlexColumn className="mt-3">
                            <label className="labled">Relater order</label>
                            <a href={null} className="text-primary pointer mr-2" onClick={this.redirectToOrder.bind(this, invoiceDetails.orderId)}>{invoiceDetails.orderNo}</a>
                            <div></div>
                        </FlexColumn>

                        <FlexColumn className="mt-3">
                            <label className="labled">Fulfilled Date</label>
                            <div>{invoiceDetails.fulfilled && moment(invoiceDetails.fulfilled).format(Formats.DATE_FORMAT_EU)}</div>
                        </FlexColumn>  

                        <FlexColumn className="mt-3">
                            <label className="labled">Invoice Date</label>
                            <div>{invoiceDetails.invoiceDate && moment(invoiceDetails.invoiceDate).format(Formats.DATE_FORMAT_EU)}</div>
                        </FlexColumn>  

                        <FlexColumn className="mt-3">
                            <label className="labled">Payment Due</label>
                            <div>{invoiceDetails.paymentDue && moment(invoiceDetails.paymentDue).format(Formats.DATE_FORMAT_EU)}</div>
                        </FlexColumn>  

                        <div className="mt-2 col-7 pl-0">
                            {this.renderAddresses(invoiceDetails)}
                        </div>

                        <FlexBlock className="mt-2 custom-control custom-checkbox">
                            <Input name="useRoyalMail" type="checkbox" disabled className="custom-control-input" id="royalMail" checked={invoiceDetails.useRoyalMail}/>
                            <label className="labled mb-0 custom-control-label" htmlFor="royalMail">Post out with Royal Mail</label>
                        </FlexBlock>

                        {!invoiceDetails.isCredited && (
                            <div className="mt-2"><a href={null} className="text-primary pointer mr-2" onClick={this.redirectToCredit.bind(this)}>Credit</a></div>
                        )}

                    </div>

                    <div className="col-4">
                        <div>
                            <Card>
                                <CardHeader>Totals</CardHeader>
                                <CardBody>
                                    <FlexBlock><span>Discount</span>{getCurrency(invoiceDetails.discountTotal)}</FlexBlock>
                                    <FlexBlock><span>Subtotal</span>{getCurrency(invoiceDetails.subTotal)}</FlexBlock>
                                    <FlexBlock><span>Shipping</span>{getCurrency(invoiceDetails.shippingTotal)}</FlexBlock>
                                    <FlexBlock ><span>VAT {invoiceDetails.taxRate > 0 && `@ ${invoiceDetails.taxRate * 100}%`}</span>{getCurrency(invoiceDetails.taxTotal)}</FlexBlock>
                                    <h4>
                                        <FlexBlock>
                                            Total
                                            <span className="d-flex align-items-center">
                                                {invoiceDetails.isCredited && (
                                                    <div className="badge badge-pill badge-danger mr-4">Credit</div>
                                                )}
                                                {renderBankIcon(invoiceDetails.paymentType, isPaid)}
                                                <span className="ml-2">{getCurrency(invoiceDetails.total)}</span>
                                            </span>
                                        </FlexBlock>
                                    </h4>
                                </CardBody>
                                <CardFooter>
                                    <FlexBlock><span>Paid by customer</span>{getCurrency(invoiceDetails.paidAmount)}</FlexBlock>
                                    <FlexBlock className="text-danger"><span>Outstanding</span>{getCurrency(invoiceDetails.outstanding)}</FlexBlock>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="mt-2">
                            <FlexColumn>
                                <label className="labled">Purchase order</label>
                                <Input name="purchaseOrder" value={this.state.invoiceDetails.purchaseOrder} onChange={this.handleChange} onBlur={this.handleSave} />
                            </FlexColumn>
                        </div>

                        <div className="mt-2">
                            {/* {this.renderInvoices(invoiceDetails.invoices)} */}
                        </div>
                    </div>
                </div>                
            </div>
        );
    }
}

export default connect(
    state => state.invoices,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(InvoiceDetails);