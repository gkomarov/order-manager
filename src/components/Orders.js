import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactPaginate from 'react-paginate';
import { InputGroup, Input, InputGroupAddon, Button } from 'reactstrap';
import moment from 'moment';

import { actionCreators } from '../store/Orders';
import * as Formats from './constants/formats';
import { getCurrency, RenderStatus, renderBankIcon, getUniqKey } from './helpers';
import FrontFilters from './FrontFilters';

class Orders extends Component {

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
      this.ensureDataFetched()
    }
    const sortableHeadersCollection = document.getElementsByClassName("sortableItem");//
    for (let sortableNode of sortableHeadersCollection) {
      sortableNode.addEventListener("click", this.sortByValue.bind(this, sortableNode));
    }
  }

  componentWillUnmount() {
    /**Clear order list leave order type page.
     * If user come back from another page, list will be downloaded */
    let leaveOrders = window.location.href.includes('orders');
    if (!leaveOrders) {
      this.props.clearFilter();
      this.props.replaceOrderList([]);
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
          activePage: 0,
        })
          .then(() => {
            if (clear) this.ensureDataFetched();
          })
    });
  }

  ensureDataFetched() {
    const { requestOrders, updatePageFilter } = this.props;
    requestOrders()
      .then(updatePageFilter({ pagingKey: getUniqKey() }))
      .catch(errors => {
        this.setState({ errors });
      });
  }

  showEntriesWithStatus(clear) {
    this.props.updatePageFilter({
      skip: 0,
      take: 10,
      activePage: 0,
      status: clear ? '' : 'Placed',
    })
      .then(this.ensureDataFetched())
  }

  redirectToDetails(id) {
    this.props.history.push(`/orders/${id}`);
  }

  sortByValue(element) {
    const sortValue = element.dataset.sort;
    const { orderBy, orderByDesc } = this.props.pageFilter;
    const actualOrderByDesc = orderBy === sortValue ? !orderByDesc : false;
    this.props.updatePageFilter({
      orderBy: sortValue ? sortValue : undefined,
      orderByDesc: actualOrderByDesc
    })
      .then(this.setState({ customOrdering: true }, () => this.ensureDataFetched()))
  }

  renderOrdersTable(props) {
    const { orderBy, orderByDesc } = this.props.pageFilter;
    const { customOrdering } = this.state;
    const orderDownImg = <img width={10} alt="desc" src="arrow-down-solid.svg" />;
    const orderUpImg = <img width={10} alt="desc" src="arrow-up-solid.svg" />;
    const cogsImg = <img width={15} alt="desc" src="cogs-solid.svg" />;
    const emptyImg = <span style={{ width: 10 }} />;
    const activeOrderIcon = orderByDesc ? orderDownImg : orderUpImg;

    const headers = [
      { title: "Order", ordering: "OrderNo" },
      { title: "Customer", ordering: "" },
      { title: "Status", ordering: "Status" },
      { title: "Created", ordering: "CreatedAt" },
      { title: "Total", ordering: "Total" },
    ]

    return (
      <table className={'table table-hover table-sm table-striped table-nonselectable'}>
        <thead>
          <tr>
            {headers.map(header => {
              let orderingIcon = customOrdering && orderBy === header.ordering && activeOrderIcon;
              return <th data-sort={header.ordering} className="sortableItem" key={header.ordering}>
                <span className="thContent d-flex align-items-center justify-content-between">{header.title}{orderingIcon ? orderingIcon : emptyImg}</span>
              </th>
            })}
          </tr>
        </thead>
        <tbody>
          {props.list.length > 0 &&
            props.list.map(order => {
              return <tr key={order.id} onClick={this.redirectToDetails.bind(this, order.id)}>
                <td style={{ width: 200 }}>{order.orderNo}<span className="ml-2">{order.hasJobs && cogsImg}</span></td>
                <td>{order.customer && order.customer.fullName}{order.customer && order.customer.company && ` @ ${order.customer.company}`}</td>
                <td>{RenderStatus(order.status)}</td>
                <td>{moment(order.createdAt).format(Formats.DATE_FORMAT_WITH_TIME)}</td>
                <td className="text-right">
                  <span className="mr-2">{renderBankIcon(order.paymentType, order.isPaid)}</span>
                  {getCurrency(order.total)}
                </td>
              </tr>
            }
            )
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
          breakClassName="page-item"
          breakLinkClassName="page-link"
          initialPage={initialPage}
          forcePage={initialPage}
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
          <h4>Orders</h4>
          <FrontFilters
            pushedButton={this.props.pageFilter.status}
            allButtonClick={this.showEntriesWithStatus.bind(this, true)}
            secondButtonClick={this.showEntriesWithStatus.bind(this)}
            secondButtonTitle={"Placed"}
          />
          {this.renderTableSearch(this.props, this.changeSearchValue, this.state.searchValue)}
        </div>
        {this.renderOrdersTable(this.props)}
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
  state => state.orders,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Orders);
