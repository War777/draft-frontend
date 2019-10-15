import React from 'react';

export default (props) => {
  return (
    <div>
      <div className="row" style={{marginTop: 30}}>
        <div className="col-sm-8">
          <h4>Email detail</h4>
        </div>
        <div className="col-sm-4">
        <button className="btn btn-outline-danger float-right" onClick={() => props.setView('general')}>x</button>
        </div>
      </div>
      <br />
      <div className="table-responsive">

        <table className="table table-sm table-bordered table-striped" >

            <tbody>
                <tr>
                    <td className="font-weight-bold">Id:</td>
                    <td className="text-center">{props.email.id}</td>
                </tr>
                <tr>
                    <td className="font-weight-bold">Subject:</td>
                    <td className="text-center">{props.email.subject}</td>
                </tr>
                <tr>
                    <td className="font-weight-bold">Created date</td>
                    <td className="text-center">{props.email.created_at}</td>
                </tr>
                <tr>
                    <td colSpan="2" className="" >
                      <div style={{padding:15}} dangerouslySetInnerHTML={{ __html: props.email.body }} />
                    </td>
                </tr>
            </tbody>

        </table>

      </div>
     
    </div>
  );

}