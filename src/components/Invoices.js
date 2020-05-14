import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactPaginate from 'react-paginate';
import { InputGroup, Input, InputGroupAddon, Button } from 'reactstrap';
import moment from 'moment';

import { actionCreators } from '../store/Invoices';
import * as Formats from './constants/formats';
import { getCurrency, renderBankIcon, getUniqKey } from './helpers';
import { STATUSES } from './constants/statuses';

class Invoices extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      numberOfItemOnPage: 10,
      customOrdering: false,
      errors: '',
    }
    this.changeSearchValue = this.changeSearchValue.bind(this);
    this.ensureDataFetched = this.ensureDataFetched.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  componentDidMount() {
    if (this.props.list.length < 1) {
      this.ensureDataFetched();
    }
    const sortableHeadersCollection = document.getElementsByClassName("sortableItem");//
    for (let sortableNode of sortableHeadersCollection) {
      sortableNode.addEventListener("click", this.sortByValue.bind(this, sortableNode));
    }
  }
  
  componentWillUnmount() {
      /**Clear order list leave order type page.
       * If user come back from another page, list will be downloaded */
      let leaveOrders = window.location.href.includes('invoices');
      if (!leaveOrders) {
          this.props.clearFilter();
          this.props.replaceInvoiceList([]);
      }
  }

  clearSearch(e) {
    this.changeSearchValue(e, true);
  }

  changeSearchValue(e, clear) {
    const value = clear ? '' : e.target.value;
    this.setState({ searchValue: value }, () => {
        this.props.updatePageFilter({
          searchValue: value,
          skip: 0,
          take: this.state.numberOfItemOnPage,
          activePage: 0
        })
            .then(() => {
                if (clear) this.ensureDataFetched();
            })
    });
  }

  ensureDataFetched() {
    const { requestInvoices, updatePageFilter } = this.props;
    updatePageFilter({ pagingKey: getUniqKey() })
        .then(requestInvoices())
        .catch(errors => {
            this.setState({ errors });
        });
  }

  redirectToDetails(id) {
    this.props.history.push(`/invoices/${id}`)
  }

  sortByValue(element) {
    const sortValue = element.dataset.sort;
    const { orderBy, orderByDesc } = this.props.pageFilter;
    const actualOrderByDesc = orderBy === sortValue ? !orderByDesc : false;
    this.props.updatePageFilter({
        orderBy: sortValue ? sortValue : undefined,
        orderByDesc: actualOrderByDesc
    })
        .then(this.setState({ customOrdering: true }, () => this.ensureDataFetched()));
  }

  renderInvoicesTable(props) {
    const { orderBy, orderByDesc } = props.pageFilter;
    const { customOrdering } = this.state;
    const orderDownImg = <img className="ml-2" width={10} alt="desc" src="arrow-down-solid.svg" />;
    const orderUpImg = <img className="ml-2" width={10} alt="desc" src="arrow-up-solid.svg" />;
    const emptyImg = <span style={{ width: 10 }} />;
    const activeOrderIcon = orderByDesc ? orderDownImg : orderUpImg;

    const headers = [
      { title: "Invoice", ordering: "invoiceNo" },
      { title: "Related order", ordering: "orderNo" },
      { title: "Customer", ordering: "firstName" },
      { title: "Invoice date", ordering: "invoiceDate" },
      { title: "Payment due", ordering: "paymentDue" },
      { title: "Total", ordering: "total", justify: "justify-content-end" },
    ]

    return (
      <table className={'table table-hover table-sm table-striped table-nonselectable'}>
        <thead>
          <tr>
            {headers.map((header, index) => {
              let justify = header.justify ? header.justify : "justify-content-between";
              let orderingIcon = customOrdering && orderBy === header.ordering && activeOrderIcon;
              return <th data-sort={header.ordering} className="sortableItem" key={index}>
                <span className={`thContent d-flex align-items-center ${justify}`}>{header.title}{orderingIcon ? orderingIcon : emptyImg}</span>
              </th>
            })}
          </tr>
        </thead>
        <tbody>
          {props.list.length > 0 &&
            props.list.map(invoice => {
              const crossOutStyle = invoice.isCredited ? { textDecoration: "line-through" } : {};
              const isPaid = invoice.status === STATUSES.Paid.value;
              return <tr style={crossOutStyle} key={invoice.id} onClick={this.redirectToDetails.bind(this, invoice.id)}>
                <td style={{ width: 200 }}>{invoice.invoiceNo}</td>
                <td>{invoice.orderNo}</td>
                <td>{invoice.fullName}{invoice.company && ` @ ${invoice.company}`}</td>
                <td>{invoice.invoiceDate && moment(invoice.invoiceDate).format(Formats.DATE_FORMAT_EU_WITH_TIME)}</td>
                <td>{invoice.paymentDue && moment(invoice.paymentDue).format(Formats.DATE_FORMAT_EU)}</td>
                <td className="text-right">
                  <span className="mr-2">{renderBankIcon(invoice.paymentType, isPaid)}</span>
                  {getCurrency(invoice.total)}
                </td>
              </tr>
            })
          }
          {!props.list.length && (
            <tr>
              <td className="col-12 text-center" colSpan={5}>No results</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.ensureDataFetched()
    }
  }

  changePage(selectedObject) {
    const activePage = selectedObject.selected;
    const skip = activePage * this.state.numberOfItemOnPage;
    const rest = this.props.count - skip;
    const take = this.state.numberOfItemOnPage > rest ? rest : this.state.numberOfItemOnPage;
    this.props.updatePageFilter({
      skip: skip,
      take: take,
      activePage: activePage
    })
      .catch(errors => {
          this.setState({ errors });
      })
      .then(this.ensureDataFetched());
  }

  renderPagination(props) {
    const initialPage = props.pageFilter.activePage;
    const pageCount = props.count / this.state.numberOfItemOnPage;
    return (
      <div className="d-flex align-items-center">
        {/* {props.isLoading ? <span className="mr-3">Loading...</span> : []} */}
        <ReactPaginate
          pageCount={pageCount}
          pageRangeDisplayed={4}
          marginPagesDisplayed={2}
          previousLabel="Previous"
          nextLabel="Next"
          previousClassName="page-item"
          nextClassName="page-item"
          previousLinkClassName="page-link"
          nextLinkClassName="page-link"
          initialPage={initialPage}
          forcePage={initialPage}
          breakClassName="page-item"
          breakLinkClassName="page-link"
          onPageChange={this.changePage.bind(this)}
          containerClassName="pagination justify-content-center mb-0"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          activeClassName="active"
          disableInitialCallback
          disabledClassName="disabled"
        />
      </div>
    )
  }


  renderTableSearch() {
    return (
      <div className="row mb-3 mr-0">
        <InputGroup>
          <Input value={this.state.searchValue} onKeyPress={this.handleKeyPress} onChange={this.changeSearchValue} />
          <InputGroupAddon addonType="append">
            {this.state.searchValue.length > 0 && 
              <Button color="light" className="border" onClick={this.clearSearch}><img width={10} alt="desc" src="times-solid.svg" /></Button>
            }
            <Button color="lite" onClick={this.ensureDataFetched}>Search</Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  render() {
    const { count, pageFilter } = this.props;
    const { skip, take } = pageFilter;
    const { errors } = this.state;

    if (errors) {
      throw new Error(errors);
    }

    return (
      <div>
        <div className="d-flex justify-content-between">
          <h4>Invoices</h4>
          {this.renderTableSearch(this.props, this.changeSearchValue, this.state.searchValue)}
        </div>
        {this.renderInvoicesTable(this.props)}
        {this.props.list.length > 0 &&
          <div className="d-flex justify-content-between align-items-center mb-3" key={pageFilter.pagingKey}>
            <div>Showing {skip + 1} to {skip + take} of {count} entries</div>
            {count > pageFilter.take && this.renderPagination(this.props)}
          </div>
        }
      </div>
    );
  }
}




export default connect(
  state => state.invoices,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Invoices);
