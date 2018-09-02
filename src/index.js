import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import moment from 'moment'
import posed, { PoseGroup } from 'react-pose'
import './index.css';
import db from './users.json';
import ReactBodymovin from 'react-bodymovin'
import animation from './logo.json'

const loadDelayMs = 2000;
const fadeInMs = 1200;

const API = "https://api.stackexchange.com/2.2/users/{ids}?order=desc&sort=reputation&site=sitecore&filter=!9Z(-woBMT"

const bodymovinOptions = {
  loop: false,
  width: 400,
  autoplay: true,
  prerender: true,
  animationData: animation
}

const Wrapper = posed.div({
  hidden: {
    opacity: 0
  },
  fadeIn: {
    opacity: 1,
    transition: {
      default: {
        duration: fadeInMs,
        type: 'tween',
        ease: 'anticipate'
      }
    }
  }
});

const Item = posed.div({
  flip: {
    transition: {
      default: {
        duration: fadeInMs,
        type: 'tween',
        ease: 'anticipate'
      }
    }
  }
});

class User extends React.Component {
  render() {
    return (
      <div className="usr">
        <a
          className="usr-img"
          style={{ backgroundImage: "url(" + this.props.data.profile_image + ")" }}
          href={this.props.data.link}
          target="_blank">
        </a>
        <div className="usr-info">
          <div className="usr-name">
            <h3>{this.props.data.display_name}</h3>
            <span>{this.props.data.reputation}</span>
          </div>
          <div className="usr-points-week">
            <h2>{this.props.data.reputation_change_week <= 0 || '+'}{this.props.data.reputation_change_week}</h2>
            <span>This week</span>
          </div>
          <div className="usr-points-month">
            <h2>{this.props.data.reputation_change_month <= 0 || '+'}{this.props.data.reputation_change_month}</h2>
            <span>This month</span>
          </div>
          <div className="usr-activity">
            <h2><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 125.66 125.66">
              <path fill="#333" d="M88.95 67.73a2.8 2.8 0 0 1-2.8 2.8H68.99a2.78 2.78 0 0 1-2.76-2.41l-3.04-21.77-6.12 56.01a2.8 2.8 0 0 1-2.56 2.48h-.23a2.77 2.77 0 0 1-2.69-2.03l-9.12-32.46-8.99 17.07a2.8 2.8 0 0 1-5.2-.62L23.9 69.31H2.8a2.8 2.8 0 0 1 0-5.6H26.1a2.8 2.8 0 0 1 2.72 2.12l3.12 12.49 8.84-16.8a2.74 2.74 0 0 1 2.77-1.48c1.14.12 2.09.93 2.41 2.02l7.12 25.32 7.02-64.09a2.79 2.79 0 0 1 2.74-2.48c1.58.13 2.62 1.02 2.81 2.42l5.8 41.7h14.71a2.8 2.8 0 0 1 2.8 2.8zm14.82-2.8h-8.86a2.81 2.81 0 0 0-2.8 2.8 2.8 2.8 0 0 0 2.8 2.8h8.86c1.54 0 2.8-1.25 2.8-2.8 0-1.54-1.26-2.8-2.8-2.8zm19.08 0h-9.43a2.81 2.81 0 0 0-2.8 2.8c0 1.55 1.27 2.8 2.8 2.8h9.43c1.54 0 2.8-1.25 2.8-2.8 0-1.54-1.26-2.8-2.8-2.8z" />
            </svg>
            </h2>
            <span>{moment.unix(this.props.data.last_access_date).fromNow()}</span>
          </div>
        </div>
      </div>
    );
  }
}

class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      error: false,
      users: db.users.map((id) => ({ user_id: id })),
      sortBy: "week"
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {

    document.title = "Hedgehog StackExchange Challenge";

    let users = sessionStorage.getItem('users')
    if (users) {
      setTimeout(() => {
        this.setState({
          users: JSON.parse(users).sort((a, b) => sort(a, b, this.state.sortyBy)),
          isLoading: false
        });
      }, loadDelayMs);
      return;
    }

    axios.get(API.replace("{ids}", db.users.join(";")))
      .then(result => {
        sessionStorage.setItem('users', JSON.stringify(result.data.items));
        setTimeout(() => {
          this.setState({
            users: result.data.items.sort((a, b) => sort(a, b, this.state.sortyBy)),
            isLoading: false
          });
        }, loadDelayMs);
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          error: true
        })
      });

  }

  handleChange(event) {
    const users = this.state.users.slice();
    this.setState({
      sortBy: event.target.value,
      users: users.sort((a, b) => sort(a, b, event.target.value))
    });
  }

  render() {
    return (
      <div className="dashboard">
        <ReactBodymovin options={bodymovinOptions} />
        <h1>Hedgehog StackExchange Challenge</h1>
        <div className="leader-board">
          <Wrapper initialPose="hidden" pose={this.state.isLoading ? "hidden" : "fadeIn"}>
            <p className="sort">
              Sort by <input type="radio" name="sort" value="week" id="week" onChange={this.handleChange} checked={this.state.sortBy === 'week'} />
              <label htmlFor="week">week</label> or <input type="radio" name="sort" value="month" id="month" onChange={this.handleChange} checked={this.state.sortBy === 'month'} />
              <label htmlFor="month">month</label>
            </p>
            <PoseGroup>
              {
                this.state.users.map((user) => (
                  <Item key={user.user_id}>
                    <User data={user} />
                  </Item>
                ))
              }
            </PoseGroup>
          </Wrapper>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <Dashboard />,
  document.getElementById('root')
);

function sort(a, b, option) {

  if (option === "month") {
    if (a.reputation_change_month > b.reputation_change_month) {
      return -1;
    }
    else if (a.reputation_change_month < b.reputation_change_month) {
      return 1;
    }
  }

  if (option === "week") {
    if (a.reputation_change_week > b.reputation_change_week) {
      return -1;
    }
    else if (a.reputation_change_week < b.reputation_change_week) {
      return 1;
    }
  }

  return Math.random() >= 0.5;

}