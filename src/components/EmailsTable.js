import React, { Component } from 'react';

// import UrlForm from './UrlForm';
// import DeleteUrl from './DeleteUrl';

class EmailsTable extends Component {

    constructor(props){

        super(props);

        this.state = {
            page: 1,        // Starts in the page 1, it changes with every changePage() call.
            limit: 5,      // Docs per page
            total: 0,       // Total docs in the emails collection, it sets with each fetchDocs() call
            pages: 0,       // Available pages in the emails collection, it sets with each fetchDocs() call
            emails: [],       // Current emails to show inside the table
        }

        this.changePage = this.changePage.bind(this);

        this.fetchDocs = this.fetchDocs.bind(this);

        this.getUrl = this.getUrl.bind(this);

        this.handleClick = this.handleClick.bind(this);

        this.handleAddUrl = this.handleAddUrl.bind(this);

    }

    /**
    * Changes the previous/next page
    * Evaluates the anchor that calls this function
    * @params e
    */
    changePage(e){

        e.preventDefault();

        let currentPage = this.state.page;

        let direction = e.target.getAttribute('direction');

        if(direction === 'previous'){

            if(currentPage > 1){

                currentPage--;

                this.setState({
                    page: currentPage
                }, () => {
                    this.fetchDocs();
                });

            }

        } else {

            if(this.state.pages > currentPage){

                currentPage++;

                this.setState({
                    page: currentPage
                }, () => {
                    this.fetchDocs();
                });
            }

        }

    }

    /**
    * Generates the url that is going to be fetched
    * according the current page and documents limit per page
    */
    getUrl(){
        var url = 'http://167.99.236.30/draft-backend/public/api/emails?page=' + this.state.page + '&limit=' + this.state.limit;
        return url;
    }

    /*
    * Fetches the docs to be rendered inside the table
    * after the component is mounted
    */
    componentDidMount(){
        this.fetchDocs();
    }

    /*
    * Change the current page by clicking nav buttons
    * Renders the docs in the page inside the table
    */
    handleClick(e){
        this.setState(
            {
                page: parseInt(e.target.getAttribute('value'))
            },
            () => {
                this.fetchDocs();
            }
        );
    }

    /*
    * Fires fetchDocs() event
    * It's called inside the UrlForm component after each url creation
    */
    handleAddUrl(){
        this.fetchDocs();
    }

    /*
    * Fetches url inside the Emails collection
    * Set emails to render inside the table with the documents
    * inside the current page
    */
    fetchDocs(){
        var url = this.getUrl();
        let api_token = localStorage.getItem('api_token');
        fetch(url, {
            method: 'get',
              headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-type': 'application/json',
                  'Authorization': `Bearer ${api_token}`,
              }
        })
        .catch(err => console.log(err))
        .then(res => res.json())
        .then(res =>{
            let pages = res.emails.total % res.emails.per_page !== 0 ? parseInt(res.emails.total / res.emails.per_page) + 1 : parseInt(res.emails.total / res.emails.per_page);
            this.setState({
                emails: res.emails.data,
                total: res.emails.total,
                pages: pages,
            })
        }
        );
    }

    /*
    * Renders a table with the emails
    * with nav pagination separating each page
    * with the number of emails per page
    */
    render(){

        // Emails in table row format, puts the DeleteUrl component inside the row
        var emailsHtml = [];

        this.state.emails.forEach((email, i) => {

            emailsHtml.push(

                <tr id={email.id}>
                    <td className="text-nowrap text-center">{ email.id }</td>
                    <td className="text-nowrap text-center">
                        <a className="text-primary" onClick={() => {
                            this.props.setView('detail', email);
                        }}>
                            { email.subject } 
                        </a>
                    </td>
                    <td className="text-nowrap text-center">{ email.created_at }</td>
                    {/* <td className="text-nowrap">
                        <a href={ url.shorten } target="_blank"> { email.shorten } </a>
                    </td> */}
                </tr>

            );
        });

        // Fills the page with empty rows in case the number of url is less than the emails per page
        if(this.state.limit - this.state.emails.length > 0){

            for(let i = 0; i < this.state.limit - this.state.emails.length; i++){

                emailsHtml.push(

                    <tr id={i}>
                        <td className="text-nowrap text-center"> - </td>
                        <td className="text-nowrap text-center"> - </td>
                        <td className="text-nowrap text-center"> - </td>
                    </tr>

                );

            }

        }

        // It builds the nav pagination
        var navPages = [];

        if(this.state.pages > 0){

            for(var i = 0; i < this.state.pages; i++){
                navPages[i] = <li onClick={this.handleClick} className="page-item"> <a className="page-link" value={i+1}> {i+1} </a>  </li>;
            }

        }

        var nav =
            <ul className="pagination justify-content-center">

                <li className="page-item">
                    <a className="page-link" href="#" direction="previous" onClick={this.changePage}>
                        &laquo;
                    </a>
                </li>

                { navPages }

                <li className="page-item">
                    <a className="page-link" href="#" direction="next" onClick={this.changePage}>
                        &raquo;
                    </a>
                </li>

            </ul>;

        // It renders the table nesting the previus built html elements
        return(

            <div>

                {/* <UrlForm onAddUrl={this.handleAddUrl}/> */}

                { this.state.emails.length === 0 ? <div className="mt-3 text-right font-weight-bold">No Emails added yet :( </div> : <br/> }

                <br/>

                <div className="table-responsive">

                    <table className="table table-sm table-bordered table-striped table-hover" >

                        <thead>
                            <tr>
                                <td className="text-center font-weight-bold">Id</td>
                                <td className="text-center font-weight-bold">Subject</td>
                                <td className="text-center font-weight-bold"> Created at</td>
                            </tr>
                        </thead>

                        <tbody>
                            { emailsHtml }
                        </tbody>

                    </table>

                    { this.state.emails.length > 0 ? nav : <hr/> }

                </div>
            </div>

        )
    }

}

export default EmailsTable;
