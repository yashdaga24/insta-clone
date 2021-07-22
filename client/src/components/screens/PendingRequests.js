import React, { useState, useEffect, useContext, Fragment } from 'react';
import { UserContext } from '../../App';
import { Link } from 'react-router-dom';
const PendingRequests = () => {
  const [data, setData] = useState([]);
  const { state, dispatch } = useContext(UserContext);
  useEffect(() => {
    fetch('/getpendingrequests', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setData(result);
      });
    console.log(data);
  }, []);

  const acceptRequest = (userid) => {
    fetch('/acceptrequest', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        followId: userid,
      }),
    })
      .then((res) => res.json())
      .then((data2) => {
        dispatch({
          type: 'UPDATE',
          payload: { following: data2.following, followers: data2.followers },
        });
      });
  };

  const declineRequest = (userid) => {
    fetch('/acceptrequest', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        followId: userid,
      }),
    })
      .then((res) => res.json())
      .then((data2) => {
        dispatch({
          type: 'UPDATE',
          payload: { following: data2.following, followers: data2.followers },
        });
      });
  };

  return (
    <div>
      <ul>
        {data &&
          data.map((item) => {
            return (
              <Fragment>
                <h4>{item.email}</h4>
                <button
                  className="btn waves-effect waves-light #64b5f6 green darken-1"
                  onClick={() => acceptRequest(item._id)}
                >
                  Accept Request
                </button>
                <button
                  className="btn waves-effect waves-light #64b5f6 red darken-1"
                  onClick={() => declineRequest(item._id)}
                >
                  Decline Request
                </button>
              </Fragment>
            );
          })}
      </ul>
    </div>
  );
};

export default PendingRequests;
