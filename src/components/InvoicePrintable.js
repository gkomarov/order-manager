import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Invoices';
import { DATE_FORMAT_EU } from './constants/formats';
import { getCurrency } from './helpers';
import moment from 'moment';

class InvoicePrintable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
            invoiceId: ''
        }
    }

    componentDidMount() {
        this.setState({ invoiceDetails: this.props.details }, () => { window.print(); this.props.history.goBack(); });
    }

    render() {
        const { invoiceDetails } = this.state;
        const { billingAddress, shippingAddress } = invoiceDetails;
        return (
            <div>
                <div className="row mb-4">
                    <div className="col-6">
                        <img style={{ marginBottom: 10 }} alt="logo" width="200" height="100" src="/logo.png"></img>
                    </div>
                    <div className="col-6">
                        <h4 className="page-header">
                            Sales invoice
                            <span className="float-right">{invoiceDetails.invoiceNo}</span>
                        </h4>
                        <h4 className="page-header">
                            Due date
                            <small className="float-right">{moment(invoiceDetails.paymentDue).format(DATE_FORMAT_EU)}</small>
                        </h4>
                        <div><small>LetterBot Limited, 6 Rockhaven Park, Kembrey Street, Swindon, SN2 7AA</small></div>
                        <div><small>VAT Number: GB326027232</small></div>
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-6">
                        <p className="lead">Billing address</p>
                        <div className="table-responsive" style={{ lineHeight: 1 }}>
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    {billingAddress.firstName && <tr><td>{billingAddress.firstName + ' ' + billingAddress.lastName}</td></tr>}
                                    {billingAddress.company && <tr><td>{billingAddress.company}</td></tr>}
                                    {billingAddress.address1 && <tr><td>{billingAddress.address1}</td></tr>}
                                    {billingAddress.address2 && <tr><td>{billingAddress.address2}</td></tr>}
                                    {billingAddress.city && <tr><td>{billingAddress.city}</td></tr>}
                                    {billingAddress.state && <tr><td>{billingAddress.state}</td></tr>}
                                    {billingAddress.postCode && <tr><td>{billingAddress.postCode}</td></tr>}
                                    {billingAddress.country && <tr><td>{billingAddress.country}</td></tr>}
                                    {billingAddress.phone && <tr><td>{billingAddress.phone}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-6">
                        <p className="lead">Shipping address</p>
                        <div className="table-responsive" style={{ lineHeight: 1 }}>
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    {invoiceDetails.useRoyalMail && <tr><td>Post out with Royal Mail</td></tr>}
                                    {!invoiceDetails.useRoyalMail && (
                                        <React.Fragment>
                                            {shippingAddress.firstName && <tr><td>{shippingAddress.firstName + ' ' + shippingAddress.lastName}</td></tr>}
                                            {shippingAddress.company && <tr><td>{shippingAddress.company}</td></tr>}
                                            {shippingAddress.address1 && <tr><td>{shippingAddress.address1}</td></tr>}
                                            {shippingAddress.address2 && <tr><td>{shippingAddress.address2}</td></tr>}
                                            {shippingAddress.city && <tr><td>{shippingAddress.city}</td></tr>}
                                            {shippingAddress.state && <tr><td>{shippingAddress.state}</td></tr>}
                                            {shippingAddress.postCode && <tr><td>{shippingAddress.postCode}</td></tr>}
                                            {shippingAddress.country && <tr><td>{shippingAddress.country}</td></tr>}
                                            {shippingAddress.phone && <tr><td>{shippingAddress.phone}</td></tr>}
                                        </React.Fragment>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-6">
                        <div className="table-responsive">
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    <tr>
                                        <td><span className="labled">Invoice date</span></td>
                                        <td className="text-right">{moment(invoiceDetails.invoiceDate).format(DATE_FORMAT_EU)}</td>
                                    </tr>
                                    <tr>
                                        <td><span className="labled">Fulfilled date</span></td>
                                        <td className="text-right">{invoiceDetails.fulfilled && moment(invoiceDetails.fulfilled).format(DATE_FORMAT_EU)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="table-responsive">
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    <tr>
                                        <td><span className="labled">Purchase order</span></td>
                                        <td className="text-right">{invoiceDetails.purchaseOrder}</td>
                                    </tr>
                                    <tr>
                                        <td><span className="labled">Sales order</span></td>
                                        <td className="text-right">{invoiceDetails.orderNo}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-12">
                        <p className="lead">Item & Payment Details</p>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th className="text-center">Quantity</th>
                                        <th>Item</th>
                                        <th className="text-right">Price</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceDetails.lines.map((line, i) => {
                                        const price = line.price ? getCurrency(line.price) : getCurrency(line.originalPrice);
                                        return <tr key={i}>
                                            <td className="text-center">{line.quantity}</td>
                                            <td>{line.name}<small className="ml-2" style={{ color: "#cdcdcd" }}>{line.sku}</small></td>
                                            <td className="text-right text-nowrap">{price}</td>
                                            <td className="text-right text-nowrap">{getCurrency(line.amount)}</td>
                                        </tr>
                                    }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-6 d-flex flex-column justify-content-between">
                        <div>
                            <p className="lead">Our bank details</p>
                            <div className="table-responsive" style={{ lineHeight: 1 }}>
                                <table className="table table-sm table-borderless">
                                    <tbody>
                                        <tr><td>Benefeciary: LetterBot Limited</td></tr>
                                        <tr><td>Barclays Bank</td></tr>
                                        <tr><td>Sort Code: 20-68-15</td></tr>
                                        <tr><td>Account No: 33796051</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p><small>We also accept payment by all major credit/debit cards</small></p>
                    </div>
                    <div className="col-6">
                        <p className="lead">Totals</p>
                        <div className="table-responsive" style={{ lineHeight: 1 }}>
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    <tr>
                                        <td><span className="labled">Discount</span></td>
                                        <td className="text-right">{getCurrency(invoiceDetails.discountTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td><span className="labled">Total GRP Excl.VAT</span></td>
                                        <td className="text-right">{getCurrency(invoiceDetails.subTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td><span className="labled">Shipping</span></td>
                                        <td className="text-right">{getCurrency(invoiceDetails.shippingTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td><span className="labled">Total VAT {invoiceDetails.taxRate > 0 && `@ ${invoiceDetails.taxRate * 100}%`}</span></td>
                                        <td className="text-right">{getCurrency(invoiceDetails.taxTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td><h5 className="labled font-weight-bold">Total GRP Incl.VAT</h5></td>
                                        <td className="text-right font-weight-bold"><h5>{getCurrency(invoiceDetails.total)}</h5></td>
                                    </tr>
                                    {invoiceDetails.paidAmount > 0 && <tr>
                                        <td><span className="labled">Paid</span></td>
                                        <td className="text-right">{getCurrency(invoiceDetails.paidAmount)}</td>
                                    </tr>}
                                    {invoiceDetails.paidAmount > 0 && <tr>
                                        <td><h5 className="labled text-danger font-weight-bold">Outstanding</h5></td>
                                        <td className="text-right text-danger font-weight-bold"><h5>{getCurrency(invoiceDetails.outstanding)}</h5></td>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <p className="fixed-bottom"><small>If you have any questions, please send an email to hello@letterbot.co.uk</small></p>

            </div >
        )
    }
}

export default connect(
    state => state.invoices,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(InvoicePrintable);