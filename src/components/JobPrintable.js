import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Jobs';
import { DATE_FORMAT_EU, DATE_FORMAT_EU_WITH_TIME } from './constants/formats';
import moment from 'moment';

class JobPrintable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
    }

    componentDidMount() {
        const { details, requestJobDetails } = this.props;
        let detailsIsEmpty = !Object.keys(details).length;
        if (detailsIsEmpty) {
            requestJobDetails(this.props.match.params.jobId)
            .then(() => this.setDetailsAndPrint());
        } else {
            this.setDetailsAndPrint();
        }
    }
    
    setDetailsAndPrint() {
        this.setState({ jobDetails: this.props.details }, () => { 
            let docTitle = document.getElementsByTagName("title");
            docTitle[0].innerHTML = this.props.details.jobNo;
            window.print();
            this.props.history.goBack();
        });
    }

    renderHeader() {
        return <div className="row">
            <div className="col-6">
                <img style={{ marginBottom: 10 }} alt="logo" width="200" height="100" src="/logo.png"></img>
            </div>
            <div className="col-6 d-flex flex-column justify-content-center">
                <h4 className="page-header">
                    Job
                    <small className="float-right font-weight-bold">{this.state.jobDetails.jobNo}</small>
                </h4>
            </div>
        </div>
    }

    renderBigBatchesPage() {
        const { batches } = this.state.jobDetails;
        return <div style={{ pageBreakBefore: "always" }}>
            {this.renderHeader()}
            <p className="lead">Batch names</p>
            <div className="table-responsive col-6">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.map((batch, i) =>
                            <tr key={`bb${i}`}>
                                <td>{batch.name}</td>
                                <td>{batch.size}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    }

    renderBigOrdersPage() {
        const { orders } = this.state.jobDetails;
        return <div style={{ pageBreakBefore: "always" }}>
            {this.renderHeader()}
            <p className="lead">Related order</p>
            <div className="table-responsive col-6">
                <table className="table table-borderless">
                    <tbody>
                        <tr>
                            <td>
                                {orders.map((order, index) =>
                                    <div key={`op${index}`}>{`${order.orderNo} ${order.customer.fullName}`}{order.customer.company && ` @ ${order.customer.company}`}</div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    }

    renderShippingAddress() {
        const { orders } = this.state.jobDetails;
        const showShippingAddress = orders.length === 1 && orders[0].shippingAddress && orders[0].useRoyalMail === false;
        if (showShippingAddress) {
            const { shippingAddress } = orders[0];
            return <React.Fragment>
                <tr>
                    <td colSpan="2" className="labled">Shipping address</td>
                </tr>
                <tr>
                    <td colSpan="2" className="text-left">
                        <div className="table-responsive" style={{ lineHeight: 1 }}>
                            <table className="table table-sm table-borderless">
                                <tbody>
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
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </React.Fragment>
        }
    }

    renderNoteInsteadOfShippingAddress() {
        const { orders } = this.state.jobDetails;
        const multipleOrders = orders.length > 1;
        if (!multipleOrders) {
            return;
        };

        let allOrdersUseRoyalMail = true;
        orders.forEach((x) => {
            if (x.useRoyalMail === false) {
                allOrdersUseRoyalMail = false;
            };
        });

        if (!allOrdersUseRoyalMail) {
            return <tr>
                <td className="labled">Shipping address</td>
                <td className="text-right">
                    <span>Please see individual orders</span>
                </td>
            </tr>
        };
    }

    render() {
        const { jobDetails } = this.state;
        const emptyLines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const { batches, orders } = jobDetails;
        const renderPageBatches = batches.length > 10;
        const renderPageOrders = orders.length > 10;
        return (
            <div>
                {this.renderHeader()}
                <div className="row">
                    <div className="col-12 d-flex justify-content-between">
                        <span className="ml-2 pl-0 labled col-3">Job details</span>
                        <div className="d-flex">
                            <div>{jobDetails.note}</div>
                            <small className="ml-2" style={{ color: "#cdcdcd" }}>{jobDetails.sku}</small>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-6">
                        <div className="table-responsive">
                            <table className="table  table-sm table-borderless">
                                <tbody>
                                    <tr>
                                        <td><span className="labled">Created</span></td>
                                        <td className="text-right">{jobDetails.creTime && moment(jobDetails.creTime).format(DATE_FORMAT_EU_WITH_TIME)}</td>
                                    </tr>
                                    <tr>
                                        <td><span className="labled">Expected dispatch</span></td>
                                        <td className="text-right font-weight-bold text-danger">{jobDetails.expectedDispatch && moment(jobDetails.expectedDispatch).format(DATE_FORMAT_EU)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-6">
                        {!renderPageOrders &&
                            <div className="table-responsive">
                                <table className="table table-sm table-borderless">
                                    <tbody>
                                        <tr>
                                            <td className="pl-0"><span className="labled">Related order</span></td>
                                            <td className="text-right">
                                                {jobDetails.orders.map(order =>
                                                    <div key={`ord${order.id}`}>{`${order.orderNo} ${order.customer.fullName}`}{order.customer.company && ` @ ${order.customer.company}`}</div>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        }
                        {renderPageOrders &&
                            <div className="d-flex justify-content-between">
                                <span className="labled">Related order</span>
                                <span>Please see additional list</span>
                            </div>}
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-6">
                        <div className="table-responsive">
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    <tr>
                                        <td className="labled">Paper type</td>
                                        <td className="text-right">{jobDetails.paperType}</td>
                                    </tr>
                                    <tr>
                                        <td className="labled">Envelope</td>
                                        <td className="text-right">{jobDetails.envelope}</td>
                                    </tr>
                                    <tr>
                                        <td className="labled">Processing</td>
                                        <td className="text-right">{jobDetails.processing}</td>
                                    </tr>
                                    <tr>
                                        <td className="labled">Stamps</td>
                                        <td className="text-right">{jobDetails.stamps}</td>
                                    </tr>
                                    <tr>
                                        <td className="labled">Postage</td>
                                        <td className="text-right">{jobDetails.postage}</td>
                                    </tr>
                                    <tr>
                                        <td className="labled">Courier</td>
                                        <td className="text-right">{jobDetails.courier}</td>
                                    </tr>
                                    {this.renderShippingAddress()}
                                    {this.renderNoteInsteadOfShippingAddress()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-6">
                        {!renderPageBatches &&
                            <React.Fragment>
                                <p className="labled">Batch names</p>
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Size</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobDetails.batches.map((batch, i) =>
                                                <tr key={`b${i}`}>
                                                    <td>{batch.name}</td>
                                                    <td>{batch.size}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </React.Fragment>
                        }
                        {renderPageBatches && <div className="d-flex justify-content-between">
                            <span className="labled">Batch names</span>
                            <span>Please see additional list</span>
                        </div>}
                    </div>
                </div>

                <h4>Timesheet</h4>
                <div className="row mt-2">
                    <div className="col-6">
                        <p className="lead">Writing / Handling during writing</p>
                        <div className="table-responsive">
                            <table className="table fat-table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Initial</th>
                                        <th>Date</th>
                                        <th>Start</th>
                                        <th>Finish</th>
                                        <th>Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emptyLines.map((i) =>
                                        <tr style={{ height: 35 }} key={`el${i}`}>
                                            <td style={{ width: 70 }}></td>
                                            <td></td>
                                            <td style={{ width: 75 }}></td>
                                            <td style={{ width: 75 }}></td>
                                            <td style={{ width: 70 }}></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="d-flex align-items-center ml-2 mt-5">
                                <input type="checkbox" id="scanned" className="big-checkbox" style={{ transform: "scale(1)" }} />&nbsp;
                                <div className="lead ml-2" htmlFor="scanned">Scanned and sent</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <p className="lead">Fulfilment / processing</p>
                        <div className="table-responsive">
                            <table className="table  fat-table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Initial</th>
                                        <th>Date</th>
                                        <th>Start</th>
                                        <th>Finish</th>
                                        <th>Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emptyLines.map((i) =>
                                        <tr style={{ height: 35 }} key={`f${i}`}>
                                            <td style={{ width: 70 }}></td>
                                            <td></td>
                                            <td style={{ width: 75 }}></td>
                                            <td style={{ width: 75 }}></td>
                                            <td style={{ width: 70 }}></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {renderPageBatches && this.renderBigBatchesPage()}
                {renderPageOrders && this.renderBigOrdersPage()}

            </div>
        )
    }
}


export default connect(
    state => state.jobs,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(JobPrintable);